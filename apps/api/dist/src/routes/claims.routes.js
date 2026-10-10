"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const validate_1 = require("../middlewares/validate");
const auth_1 = require("../middlewares/auth");
const shared_1 = require("@mehrlink/shared");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.post('/', auth_1.requireAuth, (0, validate_1.validate)(shared_1.CreateClaimSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { donationId, quantity, reason, contactName, contactPhone } = req.body;
    const claimerId = req.user.id;
    // Use a transaction to prevent over-claiming
    const result = yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const donation = yield tx.donation.findUnique({
            where: { id: donationId },
            include: { claims: { where: { status: { in: ['PENDING', 'APPROVED', 'FULFILLED'] } } } },
        });
        if (!donation || donation.isDeleted) {
            throw new Error('DONATION_NOT_FOUND');
        }
        const existingClaim = yield tx.donationClaim.findFirst({
            where: { donationId, claimerId, status: { in: ['PENDING', 'APPROVED'] } }
        });
        if (existingClaim) {
            throw new Error('DUPLICATE_CLAIM');
        }
        const claimedQuantity = donation.claims.reduce((sum, claim) => sum + claim.quantity, 0);
        const available = donation.quantity - claimedQuantity;
        if (quantity > available) {
            throw new Error('INSUFFICIENT_QUANTITY');
        }
        const claim = yield tx.donationClaim.create({
            data: {
                donationId,
                claimerId,
                quantity,
                reason,
                contactName,
                contactPhone,
                status: 'PENDING',
            },
        });
        return claim;
    }));
    yield db_1.prisma.activityLog.create({
        data: {
            userId: claimerId,
            action: 'CREATED_CLAIM',
            entityId: result.id,
            entityType: 'DonationClaim',
        }
    });
    res.status(201).json({ success: true, data: result });
})));
router.patch('/:id/status', auth_1.requireAuth, (0, validate_1.validate)(shared_1.UpdateStatusSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body; // e.g. APPROVED, REJECTED, FULFILLED
    const claim = yield db_1.prisma.donationClaim.findUnique({ where: { id }, include: { donation: true } });
    if (!claim) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Claim not found' } });
        return;
    }
    const isAdmin = req.user.role === shared_1.Role.ADMIN;
    const isDonor = claim.donation.donorId === req.user.id;
    if (!isAdmin && !isDonor) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to update this claim' } });
        return;
    }
    // Validate status transition loosely here, or strictly
    const updatedClaim = yield db_1.prisma.donationClaim.update({
        where: { id },
        data: { status },
    });
    if (status === 'FULFILLED') {
        yield db_1.prisma.donation.update({
            where: { id: claim.donationId },
            data: { status: 'COMPLETED' } // Item is handed over
        });
    }
    else if (status === 'REJECTED' || status === 'CANCELLED') {
        // If claim is rejected, item becomes available again
        yield db_1.prisma.donation.update({
            where: { id: claim.donationId },
            data: { status: 'PENDING' }
        });
    }
    res.json({ success: true, data: updatedClaim });
})));
router.get('/', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const claims = yield db_1.prisma.donationClaim.findMany({
        where: {
            OR: [
                { claimerId: req.user.id },
                { donation: { donorId: req.user.id } }
            ]
        },
        include: {
            donation: {
                include: {
                    donor: {
                        select: { firstName: true, lastName: true, phone: true }
                    }
                }
            },
            claimer: {
                select: { firstName: true, lastName: true, phone: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: claims });
})));
exports.default = router;
