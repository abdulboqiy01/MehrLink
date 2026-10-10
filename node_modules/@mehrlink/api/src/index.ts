import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Role } from '@mehrlink/shared';

import authRoutes from './routes/auth.routes';
import donationsRoutes from './routes/donations.routes';
import requestsRoutes from './routes/requests.routes';
import claimsRoutes from './routes/claims.routes';
import tasksRoutes from './routes/tasks.routes';
import matchesRoutes from './routes/matches.routes';
import notificationsRoutes from './routes/notifications.routes';
import { errorHandler } from './middlewares/error';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Rate Limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } }
});

app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/donations', donationsRoutes);
app.use('/api/v1/assistance-requests', requestsRoutes);
app.use('/api/v1/claims', claimsRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/matches', matchesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'MehrLink API is running.', roleEnumAvailable: Role.USER });
});

// Error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
