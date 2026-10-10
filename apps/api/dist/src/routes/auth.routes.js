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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const validate_1 = require("../middlewares/validate");
const auth_1 = require("../middlewares/auth");
const shared_1 = require("@mehrlink/shared");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(shared_1.UserRegistrationSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, phone, password, role } = req.body;
    const existingUser = yield db_1.prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
        res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'Phone number already registered' } });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield db_1.prisma.user.create({
        data: {
            firstName,
            lastName,
            phone,
            password: hashedPassword,
            role: role || 'USER',
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
    res.status(201).json({ success: true, data: { user: userWithoutPassword, token } });
})));
router.post('/login', (0, validate_1.validate)(shared_1.UserLoginSchema), (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    const user = yield db_1.prisma.user.findUnique({ where: { phone } });
    if (!user || user.isDeleted) {
        res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone or password' } });
        return;
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone or password' } });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
    res.json({ success: true, data: { user: userWithoutPassword, token } });
})));
router.get('/me', auth_1.requireAuth, (req, res) => {
    if (!req.user)
        return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = req.user, { password: _ } = _a, userWithoutPassword = __rest(_a, ["password"]);
    res.json({ success: true, data: userWithoutPassword });
});
exports.default = router;
