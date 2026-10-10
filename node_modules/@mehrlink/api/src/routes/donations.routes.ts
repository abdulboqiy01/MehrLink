import { Router, Response } from 'express';
import { prisma } from '../db';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import { CreateDonationSchema, UpdateStatusSchema, Role } from '@mehrlink/shared';
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from '../types';
import { Prisma } from '@prisma/client';

const router = Router();

router.post('/', requireAuth, validate(CreateDonationSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, category, quantity, monetaryValue } = req.body;
  const donorId = req.user!.id;

  const donation = await prisma.donation.create({
    data: {
      title,
      description,
      category,
      quantity,
      monetaryValue: monetaryValue || null,
      donorId,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: donorId,
      action: 'CREATED_DONATION',
      entityId: donation.id,
      entityType: 'Donation',
    }
  });

  res.status(201).json({ success: true, data: donation });
}));

router.get('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, category, page = '1', limit = '10' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: Prisma.DonationWhereInput = {
    isDeleted: false,
  };

  if (status) where.status = status as any;
  
  if (category) {
    const searchCategory = (category as string).toLowerCase().trim();
    
    // Cross-lingual synonym groups
    const synonymGroups = [
      ['kiyim', 'одежда', 'clothes', 'kurtka', 'poyabzal', 'обувь', 'shoes', 'kiyimlar', 'shim', 'ko\'ylak', 'palto', 'куртка', 'пальто'],
      ['ovqat', 'еда', 'food', 'oziq-ovqat', 'продукты', 'non', 'suv', 'ichimlik', 'ovqatlar', 'хлеб', 'вода'],
      ['telefon', 'телефон', 'phone', 'texnika', 'техника', 'tech', 'computer', 'kompyuter', 'компьютер', 'noutbuk', 'ноутбук'],
      ['tibbiyot', 'медицина', 'medical', 'dori', 'лекарства', 'medicine', 'aravacha', 'коляска', 'nogiron', 'аптека', 'dorilar']
    ];

    const matchedGroup = synonymGroups.find(g => g.some(syn => searchCategory.includes(syn) || syn.includes(searchCategory)));

    if (matchedGroup) {
      where.OR = matchedGroup.map(syn => ({
        category: { contains: syn, mode: 'insensitive' }
      }));
    } else {
      where.category = { contains: searchCategory, mode: 'insensitive' };
    }
  }

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { donor: { select: { id: true, firstName: true, lastName: true } } }
    }),
    prisma.donation.count({ where }),
  ]);

  res.json({ success: true, data: { items: donations, total, page: Number(page), limit: Number(limit) } });
}));

router.patch('/:id/status', requireAuth, validate(UpdateStatusSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation || donation.isDeleted) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Donation not found' } });
    return;
  }

  // Only admin, owner, or assigned volunteer can update
  const isAdmin = req.user!.role === Role.ADMIN;
  const isOwner = donation.donorId === req.user!.id;
  
  if (!isAdmin && !isOwner) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to update this donation' } });
    return;
  }

  const updatedDonation = await prisma.donation.update({
    where: { id },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATED_DONATION_STATUS',
      entityId: donation.id,
      entityType: 'Donation',
      details: `Status changed to ${status}`,
    }
  });

  res.json({ success: true, data: updatedDonation });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const donation = await prisma.donation.findUnique({ where: { id } });
  
  if (!donation || donation.isDeleted) {
    res.status(404).json({ success: false, error: { message: 'Donation not found' } });
    return;
  }
  
  if (donation.donorId !== req.user!.id && req.user!.role !== Role.ADMIN) {
    res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    return;
  }
  
  await prisma.donation.update({ where: { id }, data: { isDeleted: true } });
  res.json({ success: true, message: 'Donation deleted successfully' });
}));

export default router;
