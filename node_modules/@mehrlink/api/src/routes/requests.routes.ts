import { Router, Response } from 'express';
import { prisma } from '../db';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import { CreateAssistanceRequestSchema, UpdateStatusSchema, Role } from '@mehrlink/shared';
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from '../types';
import { Prisma } from '@prisma/client';

const router = Router();

router.post('/', requireAuth, validate(CreateAssistanceRequestSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, urgency, location } = req.body;
  const requesterId = req.user!.id;

  const request = await prisma.assistanceRequest.create({
    data: {
      title,
      description,
      urgency,
      location,
      requesterId,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: requesterId,
      action: 'CREATED_ASSISTANCE_REQUEST',
      entityId: request.id,
      entityType: 'AssistanceRequest',
    }
  });

  res.status(201).json({ success: true, data: request });
}));

router.get('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, urgency, page = '1', limit = '10' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: Prisma.AssistanceRequestWhereInput = {
    isDeleted: false,
  };

  if (status) where.status = status as any;
  if (urgency) where.urgency = urgency as any;

  const [requests, total] = await Promise.all([
    prisma.assistanceRequest.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { requester: { select: { id: true, firstName: true, lastName: true } } }
    }),
    prisma.assistanceRequest.count({ where }),
  ]);

  res.json({ success: true, data: { items: requests, total, page: Number(page), limit: Number(limit) } });
}));

router.patch('/:id/status', requireAuth, validate(UpdateStatusSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const request = await prisma.assistanceRequest.findUnique({ where: { id } });
  if (!request || request.isDeleted) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assistance Request not found' } });
    return;
  }

  const isAdmin = req.user!.role === Role.ADMIN;
  // Checking volunteer assignment would require looking up VolunteerTasks
  // For simplicity based on prompt: Admin or Assigned Volunteer.
  const tasks = await prisma.volunteerTask.findMany({ where: { assistanceRequestId: id, volunteerId: req.user!.id } });
  const isAssigned = tasks.length > 0;
  
  if (!isAdmin && !isAssigned) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to update this request' } });
    return;
  }

  const updatedRequest = await prisma.assistanceRequest.update({
    where: { id },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATED_REQUEST_STATUS',
      entityId: request.id,
      entityType: 'AssistanceRequest',
      details: `Status changed to ${status}`,
    }
  });

  res.json({ success: true, data: updatedRequest });
}));

export default router;
