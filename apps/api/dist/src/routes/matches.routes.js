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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middlewares/auth");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.get('/:assistanceRequestId', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { assistanceRequestId } = req.params;
    const request = yield db_1.prisma.assistanceRequest.findUnique({
        where: { id: assistanceRequestId },
        include: { requester: true }
    });
    if (!request) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assistance request not found' } });
        return;
    }
    // Fetch all available donations (only PENDING)
    const whereDonation = {
        isDeleted: false,
        status: 'PENDING',
    };
    if (req.user.role !== 'ADMIN') {
        whereDonation.donorId = req.user.id;
    }
    const donations = yield db_1.prisma.donation.findMany({
        where: whereDonation
    });
    const matches = donations.map((donation) => {
        let score = 0;
        const explanations = [];
        // Category compatibility (40 points)
        // For MVP, we assume a match if category strings are equal, or description keywords overlap
        const hasCategoryMatch = donation.category && request.title.toLowerCase().includes(donation.category.toLowerCase());
        if (hasCategoryMatch) {
            score += 40;
            explanations.push('Kategoriya mos keldi');
        }
        // Region compatibility (25 points)
        // Simple substring match on location
        if (request.location && donation.description.toLowerCase().includes(request.location.toLowerCase())) {
            score += 25;
            explanations.push('Manzil mos keldi');
        }
        else {
            score += 10;
            explanations.push('Manzil qisman mos kelishi mumkin');
        }
        // Quantity compatibility (20 points)
        if (donation.quantity >= 1) {
            score += 20;
            explanations.push('Yetarlicha miqdor mavjud');
        }
        // Description keyword relevance (10 points)
        const reqWords = request.description.toLowerCase().split(' ');
        const hasKeyword = reqWords.some(w => w.length > 3 && donation.description.toLowerCase().includes(w));
        if (hasKeyword) {
            score += 10;
            explanations.push('Ta\'rifidagi so\'zlar mos keldi');
        }
        // MANDATORY FILTER: If neither category nor description keywords match, it's not a real match
        if (!hasCategoryMatch && !hasKeyword) {
            return { donation, score: 0, explanations: [] };
        }
        // Urgency compatibility (5 points)
        if (request.urgency === 'CRITICAL' || request.urgency === 'HIGH') {
            score += 5;
            explanations.push('Zudlik bilan yordam kerakligi sababli tavsiya etildi');
        }
        return {
            donation,
            score,
            explanations,
        };
    });
    // Sort by score descending and filter out zero scores
    const sortedMatches = matches
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = request.requester, { password: _ } = _a, requesterSafe = __rest(_a, ["password"]);
    res.json({
        success: true,
        data: {
            matches: sortedMatches,
            request: Object.assign(Object.assign({}, request), { requester: requesterSafe })
        }
    });
})));
router.post('/confirm', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { assistanceRequestId, donationId } = req.body;
    const request = yield db_1.prisma.assistanceRequest.findUnique({
        where: { id: assistanceRequestId },
        include: { requester: true }
    });
    if (!request) {
        res.status(404).json({ success: false, error: { message: 'So\'rov topilmadi' } });
        return;
    }
    yield db_1.prisma.assistanceRequest.update({
        where: { id: assistanceRequestId },
        data: { status: 'IN_PROGRESS' }
    });
    yield db_1.prisma.donation.update({
        where: { id: donationId },
        data: { status: 'ACCEPTED' }
    });
    // Check if a claim already exists
    const existingClaim = yield db_1.prisma.donationClaim.findFirst({
        where: { donationId, claimerId: request.requesterId }
    });
    if (!existingClaim) {
        // Create a DonationClaim so it shows up in the Dashboard
        yield db_1.prisma.donationClaim.create({
            data: {
                donationId,
                claimerId: request.requesterId,
                status: 'APPROVED',
                quantity: 1,
                contactName: `${request.requester.firstName} ${request.requester.lastName}`,
                contactPhone: request.requester.phone,
                reason: "Tavsiya (Smart Match) orqali biriktirildi"
            }
        });
    }
    // Notify the requester with donor details
    yield db_1.prisma.notification.create({
        data: {
            userId: request.requesterId,
            title: 'Yordam topildi!',
            message: `Sizning "${request.title}" so'rovingiz bo'yicha yordam beruvchi topildi. Bog'lanish uchun: ${req.user.firstName} ${req.user.lastName}, Tel: ${req.user.phone}`
        }
    });
    // Notify the donor
    yield db_1.prisma.notification.create({
        data: {
            userId: req.user.id,
            title: 'Muvaffaqiyatli bog\'lanish',
            message: `Siz muvaffaqiyatli ravishda "${request.title}" so'rovini tasdiqladingiz. Yordamingiz uchun rahmat!`
        }
    });
    res.json({ success: true, message: 'Muvaffaqiyatli bog\'landi!' });
})));
exports.default = router;
