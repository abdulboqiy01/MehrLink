import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middlewares/auth';
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: notifications });
}));

router.patch('/:id/read', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    return;
  }

  if (notification.userId !== req.user!.id) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    return;
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  res.json({ success: true, data: updatedNotification });
}));

export default router;
