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
router.post('/', auth_1.requireAuth, (0, validate_1.validate)(shared_1.CreateDonationSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, category, quantity, monetaryValue } = req.body;
    const donorId = req.user.id;
    const donation = yield db_1.prisma.donation.create({
        data: {
            title,
            description,
            category,
            quantity,
            monetaryValue: monetaryValue || null,
            donorId,
        },
    });
    yield db_1.prisma.activityLog.create({
        data: {
            userId: donorId,
            action: 'CREATED_DONATION',
            entityId: donation.id,
            entityType: 'Donation',
        }
    });
    res.status(201).json({ success: true, data: donation });
})));
router.get('/', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, category, page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
        isDeleted: false,
    };
    if (status)
        where.status = status;
    if (category) {
        const searchCategory = category.toLowerCase().trim();
        // Cross-lingual synonym groups
        const synonymGroups = [
            ['kiyim', 'одежда', 'clothes', 'kurtka', 'poyabzal', 'обувь', 'shoes', 'kiyimlar', 'shim', 'ko\'ylak', 'palto', 'куртка', 'пальто'],
            ['ovqat', 'еда', 'food', 'oziq-ovqat', 'продукты', 'non', 'suv', 'ichimlik', 'ovqatlar', 'хлеб', 'вода'],
            ['telefon', 'телефон', 'phone', 'texnika', 'техника', 'tech', 'computer', 'kompyuter', 'компьютер', 'noutbuk', 'ноутбук'],
            ['tibbiyot', 'медицина', 'medical', 'dori', 'лекарства', 'medicine', 'aravacha', 'коляска', 'nogiron', 'аптека', 'dorilar']
        ];
        const matchedGroup = synonymGroups.find(g => g.some(syn => searchCategory.includes(syn) || syn.includes(searchCategory)));
        if (matchedGroup) {
            where.OR = matchedGroup.map(syn => ({
                category: { contains: syn, mode: 'insensitive' }
            }));
        }
        else {
            where.category = { contains: searchCategory, mode: 'insensitive' };
        }
    }
    const [donations, total] = yield Promise.all([
        db_1.prisma.donation.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: { donor: { select: { id: true, firstName: true, lastName: true } } }
        }),
        db_1.prisma.donation.count({ where }),
    ]);
    res.json({ success: true, data: { items: donations, total, page: Number(page), limit: Number(limit) } });
})));
router.patch('/:id/status', auth_1.requireAuth, (0, validate_1.validate)(shared_1.UpdateStatusSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const donation = yield db_1.prisma.donation.findUnique({ where: { id } });
    if (!donation || donation.isDeleted) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Donation not found' } });
        return;
    }
    // Only admin, owner, or assigned volunteer can update
    const isAdmin = req.user.role === shared_1.Role.ADMIN;
    const isOwner = donation.donorId === req.user.id;
    if (!isAdmin && !isOwner) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to update this donation' } });
        return;
    }
    const updatedDonation = yield db_1.prisma.donation.update({
        where: { id },
        data: { status },
    });
    yield db_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'UPDATED_DONATION_STATUS',
            entityId: donation.id,
            entityType: 'Donation',
            details: `Status changed to ${status}`,
        }
    });
    res.json({ success: true, data: updatedDonation });
})));
router.delete('/:id', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const donation = yield db_1.prisma.donation.findUnique({ where: { id } });
    if (!donation || donation.isDeleted) {
        res.status(404).json({ success: false, error: { message: 'Donation not found' } });
        return;
    }
    if (donation.donorId !== req.user.id && req.user.role !== shared_1.Role.ADMIN) {
        res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        return;
    }
    yield db_1.prisma.donation.update({ where: { id }, data: { isDeleted: true } });
    res.json({ success: true, message: 'Donation deleted successfully' });
})));
exports.default = router;
