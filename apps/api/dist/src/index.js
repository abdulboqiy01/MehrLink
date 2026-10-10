"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const shared_1 = require("@mehrlink/shared");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const donations_routes_1 = __importDefault(require("./routes/donations.routes"));
const requests_routes_1 = __importDefault(require("./routes/requests.routes"));
const claims_routes_1 = __importDefault(require("./routes/claims.routes"));
const tasks_routes_1 = __importDefault(require("./routes/tasks.routes"));
const matches_routes_1 = __importDefault(require("./routes/matches.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const error_1 = require("./middlewares/error");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express_1.default.json());
// Rate Limiting for auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } }
});
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/donations', donations_routes_1.default);
app.use('/api/v1/assistance-requests', requests_routes_1.default);
app.use('/api/v1/claims', claims_routes_1.default);
app.use('/api/v1/tasks', tasks_routes_1.default);
app.use('/api/v1/matches', matches_routes_1.default);
app.use('/api/v1/notifications', notifications_routes_1.default);
app.get('/api/v1/health', (req, res) => {
    res.json({ success: true, message: 'MehrLink API is running.', roleEnumAvailable: shared_1.Role.USER });
});
// Error handling middleware
app.use(error_1.errorHandler);
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
exports.default = app;
