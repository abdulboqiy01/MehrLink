import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

vi.mock('../db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    assistanceRequest: {
      findUnique: vi.fn(),
    },
    donation: {
      findMany: vi.fn(),
    }
  }
}));

describe('Smart Matching API', () => {
  const mockUser = {
    id: 'user-id-123',
    role: 'USER',
  };

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(jwt, 'verify').mockReturnValue({ userId: mockUser.id } as any);
    // @ts-ignore
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
  });

  it('should calculate matching scores correctly', async () => {
    const requestItem = {
      id: 'req-1',
      title: 'Need clothes',
      description: 'Need winter jackets in Tashkent',
      location: 'Tashkent',
      urgency: 'HIGH',
    };

    const donations = [
      {
        id: 'don-1',
        title: 'Winter clothes',
        description: 'Tashkent pickup, warm jackets',
        category: 'clothes', // 40 points
        quantity: 2, // 20 points
        status: 'PENDING',
      },
      {
        id: 'don-2',
        title: 'Books',
        description: 'Samarkand',
        category: 'books', // 0 points
        quantity: 1, // 20 points
        status: 'PENDING',
      }
    ];

    // @ts-ignore
    vi.mocked(prisma.assistanceRequest.findUnique).mockResolvedValue(requestItem);
    // @ts-ignore
    vi.mocked(prisma.donation.findMany).mockResolvedValue(donations);

    const res = await request(app)
      .get('/api/v1/matches/req-1')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);

    // don-1 should have higher score
    const bestMatch = res.body.data[0];
    expect(bestMatch.donation.id).toBe('don-1');
    
    // Category(40) + Region(25) + Quantity(20) + Keyword(10) + Urgency(5) = 100
    expect(bestMatch.score).toBeGreaterThan(60); 
    
    // Check explanations
    expect(bestMatch.explanations).toContain('Category matches request title');
    expect(bestMatch.explanations).toContain('Region match found');
  });
});
