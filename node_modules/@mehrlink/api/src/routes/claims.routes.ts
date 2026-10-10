import { Router, Response } from 'express';
import { prisma } from '../db';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import { CreateClaimSchema, UpdateStatusSchema, Role } from '@mehrlink/shared';
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.post('/', requireAuth, validate(CreateClaimSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { donationId, quantity, reason, contactName, contactPhone } = req.body;
  const claimerId = req.user!.id;

  // Use a transaction to prevent over-claiming
  const result = await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
      include: { claims: { where: { status: { in: ['PENDING', 'APPROVED', 'FULFILLED'] } } } },
    });

    if (!donation || donation.isDeleted) {
      throw new Error('DONATION_NOT_FOUND');
    }

    const existingClaim = await tx.donationClaim.findFirst({
      where: { donationId, claimerId, status: { in: ['PENDING', 'APPROVED'] } }
    });
    if (existingClaim) {
      throw new Error('DUPLICATE_CLAIM');
    }

    const claimedQuantity = donation.claims.reduce((sum, claim) => sum + claim.quantity, 0);
    const available = donation.quantity - claimedQuantity;

    if (quantity > available) {
      throw new Error('INSUFFICIENT_QUANTITY');
    }

    const claim = await tx.donationClaim.create({
      data: {
        donationId,
        claimerId,
        quantity,
        reason,
        contactName,
        contactPhone,
        status: 'PENDING',
      },
    });

    return claim;
  });

  await prisma.activityLog.create({
    data: {
      userId: claimerId,
      action: 'CREATED_CLAIM',
      entityId: result.id,
      entityType: 'DonationClaim',
    }
  });

  res.status(201).json({ success: true, data: result });
}));

router.patch('/:id/status', requireAuth, validate(UpdateStatusSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // e.g. APPROVED, REJECTED, FULFILLED

  const claim = await prisma.donationClaim.findUnique({ where: { id }, include: { donation: true } });
  if (!claim) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Claim not found' } });
    return;
  }

  const isAdmin = req.user!.role === Role.ADMIN;
  const isDonor = claim.donation.donorId === req.user!.id;
  
  if (!isAdmin && !isDonor) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to update this claim' } });
    return;
  }

  // Validate status transition loosely here, or strictly
  const updatedClaim = await prisma.donationClaim.update({
    where: { id },
    data: { status },
  });

  if (status === 'FULFILLED') {
    await prisma.donation.update({
      where: { id: claim.donationId },
      data: { status: 'COMPLETED' } // Item is handed over
    });
  } else if (status === 'REJECTED' || status === 'CANCELLED') {
    // If claim is rejected, item becomes available again
    await prisma.donation.update({
      where: { id: claim.donationId },
      data: { status: 'PENDING' }
    });
  }

  res.json({ success: true, data: updatedClaim });
}));

router.get('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const claims = await prisma.donationClaim.findMany({
    where: {
      OR: [
        { claimerId: req.user!.id },
        { donation: { donorId: req.user!.id } }
      ]
    },
    include: {
      donation: {
        include: {
          donor: {
            select: { firstName: true, lastName: true, phone: true }
          }
        }
      },
      claimer: {
        select: { firstName: true, lastName: true, phone: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: claims });
}));

export default router;
