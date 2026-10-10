import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import { UserRegistrationSchema, UserLoginSchema } from '@mehrlink/shared';
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.post('/register', validate(UserRegistrationSchema), asyncHandler(async (req, res: Response) => {
  const { firstName, lastName, phone, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { phone } });
  if (existingUser) {
    res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'Phone number already registered' } });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      phone,
      password: hashedPassword,
      role: role || 'USER',
    },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user;
  res.status(201).json({ success: true, data: { user: userWithoutPassword, token } });
}));

router.post('/login', validate(UserLoginSchema), asyncHandler(async (req, res: Response) => {
  const { phone, password } = req.body;

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || user.isDeleted) {
    res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone or password' } });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone or password' } });
    return;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: { user: userWithoutPassword, token } });
}));

router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ success: true, data: userWithoutPassword });
});

export default router;
