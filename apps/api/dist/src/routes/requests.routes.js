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
router.post('/', auth_1.requireAuth, (0, validate_1.validate)(shared_1.CreateAssistanceRequestSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, urgency, location } = req.body;
    const requesterId = req.user.id;
    const request = yield db_1.prisma.assistanceRequest.create({
        data: {
            title,
            description,
            urgency,
            location,
            requesterId,
        },
    });
    yield db_1.prisma.activityLog.create({
        data: {
            userId: requesterId,
            action: 'CREATED_ASSISTANCE_REQUEST',
            entityId: request.id,
            entityType: 'AssistanceRequest',
        }
    });
    res.status(201).json({ success: true, data: request });
})));
router.get('/', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, urgency, page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
        isDeleted: false,
    };
    if (status)
        where.status = status;
    if (urgency)
        where.urgency = urgency;
    const [requests, total] = yield Promise.all([
        db_1.prisma.assistanceRequest.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: { requester: { select: { id: true, firstName: true, lastName: true } } }
        }),
        db_1.prisma.assistanceRequest.count({ where }),
    ]);
    res.json({ success: true, data: { items: requests, total, page: Number(page), limit: Number(limit) } });
})));
router.patch('/:id/status', auth_1.requireAuth, (0, validate_1.validate)(shared_1.UpdateStatusSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const request = yield db_1.prisma.assistanceRequest.findUnique({ where: { id } });
    if (!request || request.isDeleted) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assistance Request not found' } });
        return;
    }
    const isAdmin = req.user.role === shared_1.Role.ADMIN;
    // Checking volunteer assignment would require looking up VolunteerTasks
    // For simplicity based on prompt: Admin or Assigned Volunteer.
    const tasks = yield db_1.prisma.volunteerTask.findMany({ where: { assistanceRequestId: id, volunteerId: req.user.id } });
    const isAssigned = tasks.length > 0;
    if (!isAdmin && !isAssigned) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to update this request' } });
        return;
    }
    const updatedRequest = yield db_1.prisma.assistanceRequest.update({
        where: { id },
        data: { status },
    });
    yield db_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'UPDATED_REQUEST_STATUS',
            entityId: request.id,
            entityType: 'AssistanceRequest',
            details: `Status changed to ${status}`,
        }
    });
    res.json({ success: true, data: updatedRequest });
})));
exports.default = router;
