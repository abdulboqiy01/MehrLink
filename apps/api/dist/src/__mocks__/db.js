"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const vitest_mock_extended_1 = require("vitest-mock-extended");
const db_1 = require("../db");
exports.prismaMock = db_1.prisma;
beforeEach(() => {
    (0, vitest_mock_extended_1.mockReset)(exports.prismaMock);
});
