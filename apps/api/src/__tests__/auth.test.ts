import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

vi.mock('../db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    donation: {
      findMany: vi.fn(),
    },
    assistanceRequest: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('Auth API', () => {
  const mockUser = {
    id: 'user-id-123',
    firstName: 'Test',
    lastName: 'User',
    phone: '+998901234567',
    password: 'hashed-password',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    // @ts-ignore
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    // @ts-ignore
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
    
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as any);
    vi.spyOn(jwt, 'sign').mockReturnValue('mock-jwt-token' as any);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        phone: '+998901234567',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('mock-jwt-token');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should fail to register with an existing phone', async () => {
    // @ts-ignore
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Test2',
        lastName: 'User2',
        phone: '+998901234567',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('USER_EXISTS');
  });

  it('should login a user successfully', async () => {
    // @ts-ignore
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
    vi.spyOn(jwt, 'sign').mockReturnValue('mock-jwt-token' as any);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        phone: '+998901234567',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('mock-jwt-token');
  });
});
