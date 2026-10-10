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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
vitest_1.vi.mock('../db', () => ({
    prisma: {
        user: {
            findUnique: vitest_1.vi.fn(),
        },
        assistanceRequest: {
            findUnique: vitest_1.vi.fn(),
        },
        donation: {
            findMany: vitest_1.vi.fn(),
        }
    }
}));
(0, vitest_1.describe)('Smart Matching API', () => {
    const mockUser = {
        id: 'user-id-123',
        role: 'USER',
    };
    const mockToken = 'mock-jwt-token';
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.spyOn(jsonwebtoken_1.default, 'verify').mockReturnValue({ userId: mockUser.id });
        // @ts-ignore
        vitest_1.vi.mocked(db_1.prisma.user.findUnique).mockResolvedValue(mockUser);
    });
    (0, vitest_1.it)('should calculate matching scores correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const requestItem = {
            id: 'req-1',
            title: 'Need clothes',
            description: 'Need winter jackets in Tashkent',
            location: 'Tashkent',
            urgency: 'HIGH',
        };
        const donations = [
            {
                id: 'don-1',
                title: 'Winter clothes',
                description: 'Tashkent pickup, warm jackets',
                category: 'clothes', // 40 points
                quantity: 2, // 20 points
                status: 'PENDING',
            },
            {
                id: 'don-2',
                title: 'Books',
                description: 'Samarkand',
                category: 'books', // 0 points
                quantity: 1, // 20 points
                status: 'PENDING',
            }
        ];
        // @ts-ignore
        vitest_1.vi.mocked(db_1.prisma.assistanceRequest.findUnique).mockResolvedValue(requestItem);
        // @ts-ignore
        vitest_1.vi.mocked(db_1.prisma.donation.findMany).mockResolvedValue(donations);
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/v1/matches/req-1')
            .set('Authorization', `Bearer ${mockToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.length).toBe(2);
        // don-1 should have higher score
        const bestMatch = res.body.data[0];
        (0, vitest_1.expect)(bestMatch.donation.id).toBe('don-1');
        // Category(40) + Region(25) + Quantity(20) + Keyword(10) + Urgency(5) = 100
        (0, vitest_1.expect)(bestMatch.score).toBeGreaterThan(60);
        // Check explanations
        (0, vitest_1.expect)(bestMatch.explanations).toContain('Category matches request title');
        (0, vitest_1.expect)(bestMatch.explanations).toContain('Region match found');
    }));
});
