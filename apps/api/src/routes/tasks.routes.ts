import { Router, Response } from 'express';
import { prisma } from '../db';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import { UpdateStatusSchema, Role } from '@mehrlink/shared';
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const tasks = await prisma.volunteerTask.findMany({
    where: { volunteerId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: tasks });
}));

router.patch('/:id/status', requireAuth, validate(UpdateStatusSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const task = await prisma.volunteerTask.findUnique({ where: { id } });
  if (!task) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    return;
  }

  const isAdmin = req.user!.role === Role.ADMIN;
  const isAssigned = task.volunteerId === req.user!.id;

  if (!isAdmin && !isAssigned) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to update this task' } });
    return;
  }

  const updatedTask = await prisma.volunteerTask.update({
    where: { id },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATED_TASK_STATUS',
      entityId: task.id,
      entityType: 'VolunteerTask',
      details: `Status changed to ${status}`,
    }
  });

  res.json({ success: true, data: updatedTask });
}));

export default router;
