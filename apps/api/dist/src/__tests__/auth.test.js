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
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
vitest_1.vi.mock('../db', () => ({
    prisma: {
        user: {
            findUnique: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
        },
        activityLog: {
            create: vitest_1.vi.fn(),
        },
        donation: {
            findMany: vitest_1.vi.fn(),
        },
        assistanceRequest: {
            findUnique: vitest_1.vi.fn(),
        },
        $transaction: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('Auth API', () => {
    const mockUser = {
        id: 'user-id-123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+998901234567',
        password: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        vitest_1.vi.mocked(db_1.prisma.user.findUnique).mockResolvedValue(null);
        // @ts-ignore
        vitest_1.vi.mocked(db_1.prisma.user.create).mockResolvedValue(mockUser);
        vitest_1.vi.spyOn(bcrypt_1.default, 'hash').mockResolvedValue('hashed-password');
        vitest_1.vi.spyOn(jsonwebtoken_1.default, 'sign').mockReturnValue('mock-jwt-token');
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/v1/auth/register')
            .send({
            firstName: 'Test',
            lastName: 'User',
            phone: '+998901234567',
            password: 'Password123!',
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.token).toBe('mock-jwt-token');
        (0, vitest_1.expect)(res.body.data.user.password).toBeUndefined();
    }));
    (0, vitest_1.it)('should fail to register with an existing phone', () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        vitest_1.vi.mocked(db_1.prisma.user.findUnique).mockResolvedValue(mockUser);
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/v1/auth/register')
            .send({
            firstName: 'Test2',
            lastName: 'User2',
            phone: '+998901234567',
            password: 'Password123!',
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.error.code).toBe('USER_EXISTS');
    }));
    (0, vitest_1.it)('should login a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        vitest_1.vi.mocked(db_1.prisma.user.findUnique).mockResolvedValue(mockUser);
        vitest_1.vi.spyOn(bcrypt_1.default, 'compare').mockResolvedValue(true);
        vitest_1.vi.spyOn(jsonwebtoken_1.default, 'sign').mockReturnValue('mock-jwt-token');
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/v1/auth/login')
            .send({
            phone: '+998901234567',
            password: 'Password123!',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.token).toBe('mock-jwt-token');
    }));
});
