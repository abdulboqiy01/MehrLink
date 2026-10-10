"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStatusSchema = exports.CreateClaimSchema = exports.CreateAssistanceRequestSchema = exports.CreateDonationSchema = exports.UserLoginSchema = exports.UserRegistrationSchema = exports.UrgencyLevel = exports.AssistanceRequestStatus = exports.DonationStatus = exports.Role = void 0;
const zod_1 = require("zod");
exports.Role = {
    USER: 'USER',
    VOLUNTEER: 'VOLUNTEER',
    ADMIN: 'ADMIN',
};
exports.DonationStatus = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    ASSIGNED_TO_VOLUNTEER: 'ASSIGNED_TO_VOLUNTEER',
    DELIVERED: 'DELIVERED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
exports.AssistanceRequestStatus = {
    PENDING: 'PENDING',
    REVIEWING: 'REVIEWING',
    APPROVED: 'APPROVED',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    REJECTED: 'REJECTED',
};
exports.UrgencyLevel = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
};
// Zod Schemas
exports.UserRegistrationSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    phone: zod_1.z.string().transform(v => v.replace(/[\s-]/g, '')).refine(v => /^\+998\d{9}$/.test(v), 'Telefon raqam formati noto\'g\'ri (+998XXXXXXXXX)'),
    password: zod_1.z.string().min(8),
    role: zod_1.z.nativeEnum(exports.Role).optional(),
});
exports.UserLoginSchema = zod_1.z.object({
    phone: zod_1.z.string().transform(v => v.replace(/[\s-]/g, '')),
    password: zod_1.z.string(),
});
exports.CreateDonationSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    category: zod_1.z.string(),
    quantity: zod_1.z.number().int().min(1).default(1),
    monetaryValue: zod_1.z.number().optional().nullable(),
});
exports.CreateAssistanceRequestSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    urgency: zod_1.z.nativeEnum(exports.UrgencyLevel).default(exports.UrgencyLevel.MEDIUM),
    location: zod_1.z.string().min(5),
});
exports.CreateClaimSchema = zod_1.z.object({
    donationId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().min(1).default(1),
    reason: zod_1.z.string().optional(),
    contactName: zod_1.z.string().min(2),
    contactPhone: zod_1.z.string().transform(v => v.replace(/[\s-]/g, '')).refine(v => /^\+998\d{9}$/.test(v), 'Telefon raqam formati noto\'g\'ri'),
});
exports.UpdateStatusSchema = zod_1.z.object({
    status: zod_1.z.string(),
});
