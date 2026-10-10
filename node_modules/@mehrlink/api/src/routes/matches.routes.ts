import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middlewares/auth';
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/:assistanceRequestId', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assistanceRequestId } = req.params;

  const request = await prisma.assistanceRequest.findUnique({ 
    where: { id: assistanceRequestId },
    include: { requester: true }
  });
  if (!request) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assistance request not found' } });
    return;
  }

  // Fetch all available donations (only PENDING)
  const whereDonation: any = {
    isDeleted: false,
    status: 'PENDING',
  };
  
  if (req.user!.role !== 'ADMIN') {
    whereDonation.donorId = req.user!.id;
  }

  const donations = await prisma.donation.findMany({
    where: whereDonation
  });

  const matches = donations.map((donation) => {
    let score = 0;
    const explanations: string[] = [];

    // Category compatibility (40 points)
    // For MVP, we assume a match if category strings are equal, or description keywords overlap
    const hasCategoryMatch = donation.category && request.title.toLowerCase().includes(donation.category.toLowerCase());
    if (hasCategoryMatch) {
      score += 40;
      explanations.push('Kategoriya mos keldi');
    }

    // Region compatibility (25 points)
    // Simple substring match on location
    if (request.location && donation.description.toLowerCase().includes(request.location.toLowerCase())) {
      score += 25;
      explanations.push('Manzil mos keldi');
    } else {
      score += 10;
      explanations.push('Manzil qisman mos kelishi mumkin');
    }

    // Quantity compatibility (20 points)
    if (donation.quantity >= 1) {
      score += 20;
      explanations.push('Yetarlicha miqdor mavjud');
    }

    // Description keyword relevance (10 points)
    const reqWords = request.description.toLowerCase().split(' ');
    const hasKeyword = reqWords.some(w => w.length > 3 && donation.description.toLowerCase().includes(w));
    if (hasKeyword) {
      score += 10;
      explanations.push('Ta\'rifidagi so\'zlar mos keldi');
    }

    // MANDATORY FILTER: If neither category nor description keywords match, it's not a real match
    if (!hasCategoryMatch && !hasKeyword) {
      return { donation, score: 0, explanations: [] };
    }

    // Urgency compatibility (5 points)
    if (request.urgency === 'CRITICAL' || request.urgency === 'HIGH') {
      score += 5;
      explanations.push('Zudlik bilan yordam kerakligi sababli tavsiya etildi');
    }

    return {
      donation,
      score,
      explanations,
    };
  });

  // Sort by score descending and filter out zero scores
  const sortedMatches = matches
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...requesterSafe } = request.requester;

  res.json({ 
    success: true, 
    data: { 
      matches: sortedMatches, 
      request: { ...request, requester: requesterSafe } 
    } 
  });
}));

router.post('/confirm', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assistanceRequestId, donationId } = req.body;

  const request = await prisma.assistanceRequest.findUnique({
    where: { id: assistanceRequestId },
    include: { requester: true }
  });

  if (!request) {
    res.status(404).json({ success: false, error: { message: 'So\'rov topilmadi' } });
    return;
  }

  await prisma.assistanceRequest.update({
    where: { id: assistanceRequestId },
    data: { status: 'IN_PROGRESS' }
  });

  await prisma.donation.update({
    where: { id: donationId },
    data: { status: 'ACCEPTED' }
  });

  // Check if a claim already exists
  const existingClaim = await prisma.donationClaim.findFirst({
    where: { donationId, claimerId: request.requesterId }
  });

  if (!existingClaim) {
    // Create a DonationClaim so it shows up in the Dashboard
    await prisma.donationClaim.create({
      data: {
        donationId,
        claimerId: request.requesterId,
        status: 'APPROVED',
        quantity: 1,
        contactName: `${request.requester.firstName} ${request.requester.lastName}`,
        contactPhone: request.requester.phone,
        reason: "Tavsiya (Smart Match) orqali biriktirildi"
      }
    });
  }

  // Notify the requester with donor details
  await prisma.notification.create({
    data: {
      userId: request.requesterId,
      title: 'Yordam topildi!',
      message: `Sizning "${request.title}" so'rovingiz bo'yicha yordam beruvchi topildi. Bog'lanish uchun: ${req.user!.firstName} ${req.user!.lastName}, Tel: ${req.user!.phone}`
    }
  });

  // Notify the donor
  await prisma.notification.create({
    data: {
      userId: req.user!.id,
      title: 'Muvaffaqiyatli bog\'lanish',
      message: `Siz muvaffaqiyatli ravishda "${request.title}" so'rovini tasdiqladingiz. Yordamingiz uchun rahmat!`
    }
  });

  res.json({ success: true, message: 'Muvaffaqiyatli bog\'landi!' });
}));

export default router;
