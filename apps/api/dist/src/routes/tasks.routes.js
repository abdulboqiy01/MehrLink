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
router.get('/', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield db_1.prisma.volunteerTask.findMany({
        where: { volunteerId: req.user.id },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tasks });
})));
router.patch('/:id/status', auth_1.requireAuth, (0, validate_1.validate)(shared_1.UpdateStatusSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const task = yield db_1.prisma.volunteerTask.findUnique({ where: { id } });
    if (!task) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
        return;
    }
    const isAdmin = req.user.role === shared_1.Role.ADMIN;
    const isAssigned = task.volunteerId === req.user.id;
    if (!isAdmin && !isAssigned) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to update this task' } });
        return;
    }
    const updatedTask = yield db_1.prisma.volunteerTask.update({
        where: { id },
        data: { status },
    });
    yield db_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'UPDATED_TASK_STATUS',
            entityId: task.id,
            entityType: 'VolunteerTask',
            details: `Status changed to ${status}`,
        }
    });
    res.json({ success: true, data: updatedTask });
})));
exports.default = router;
