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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding database with demo data (Uzbek language)...');
        // Create Users
        const admin = yield prisma.user.upsert({
            where: { phone: '+998901112233' },
            update: {},
            create: {
                firstName: 'Admin',
                lastName: 'Tizim',
                phone: '+998901112233',
                password: 'hashed_password_placeholder',
                role: client_1.Role.ADMIN,
            },
        });
        const volunteer = yield prisma.user.upsert({
            where: { phone: '+998902223344' },
            update: {},
            create: {
                firstName: 'Aziz',
                lastName: 'Karimov',
                phone: '+998902223344',
                password: 'hashed_password_placeholder',
                role: client_1.Role.VOLUNTEER,
            },
        });
        const normalUser = yield prisma.user.upsert({
            where: { phone: '+998903334455' },
            update: {},
            create: {
                firstName: 'Dilnoza',
                lastName: 'Rustamova',
                phone: '+998903334455',
                password: 'hashed_password_placeholder',
                role: client_1.Role.USER,
            },
        });
        // Create Donation
        const donation = yield prisma.donation.create({
            data: {
                title: 'Qishki kiyimlar',
                description: 'Bolalar uchun qalin kurtka va poyabzallar',
                category: 'Kiyim',
                quantity: 5,
                status: client_1.DonationStatus.PENDING,
                donorId: normalUser.id,
            },
        });
        // Create Assistance Request
        const request = yield prisma.assistanceRequest.create({
            data: {
                title: 'Tibbiy yordam kerak',
                description: 'Nogironlar aravachasiga ehtiyoj bor',
                urgency: client_1.UrgencyLevel.HIGH,
                location: 'Toshkent shahar, Yunusobod tumani',
                status: client_1.AssistanceRequestStatus.APPROVED,
                requesterId: normalUser.id,
            },
        });
        // Create Volunteer Task
        const task = yield prisma.volunteerTask.create({
            data: {
                volunteerId: volunteer.id,
                assistanceRequestId: request.id,
                description: 'Nogironlar aravachasini etkazib berish',
            },
        });
        console.log('Seed completed successfully!');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
