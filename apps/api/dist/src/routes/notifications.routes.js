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
const auth_1 = require("../middlewares/auth");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield db_1.prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notifications });
})));
router.patch('/:id/read', auth_1.requireAuth, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const notification = yield db_1.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
        return;
    }
    if (notification.userId !== req.user.id) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
        return;
    }
    const updatedNotification = yield db_1.prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });
    res.json({ success: true, data: updatedNotification });
})));
exports.default = router;
