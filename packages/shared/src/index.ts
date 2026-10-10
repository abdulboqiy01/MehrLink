import { z } from 'zod';

export const Role = {
  USER: 'USER',
  VOLUNTEER: 'VOLUNTEER',
  ADMIN: 'ADMIN',
} as const;
export type Role = typeof Role[keyof typeof Role];

export const DonationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  ASSIGNED_TO_VOLUNTEER: 'ASSIGNED_TO_VOLUNTEER',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type DonationStatus = typeof DonationStatus[keyof typeof DonationStatus];

export const AssistanceRequestStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const;
export type AssistanceRequestStatus = typeof AssistanceRequestStatus[keyof typeof AssistanceRequestStatus];

export const UrgencyLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type UrgencyLevel = typeof UrgencyLevel[keyof typeof UrgencyLevel];

// Zod Schemas
export const UserRegistrationSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().transform(v => v.replace(/[\s-]/g, '')).refine(v => /^\+998\d{9}$/.test(v), 'Telefon raqam formati noto\'g\'ri (+998XXXXXXXXX)'),
  password: z.string().min(8),
  role: z.nativeEnum(Role).optional(),
});

export const UserLoginSchema = z.object({
  phone: z.string().transform(v => v.replace(/[\s-]/g, '')),
  password: z.string(),
});

export const CreateDonationSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  quantity: z.number().int().min(1).default(1),
  monetaryValue: z.number().optional().nullable(),
});

export const CreateAssistanceRequestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  urgency: z.nativeEnum(UrgencyLevel).default(UrgencyLevel.MEDIUM),
  location: z.string().min(5),
});

// TypeScript Types inferred from Zod
export type UserRegistrationDTO = z.infer<typeof UserRegistrationSchema>;
export type UserLoginDTO = z.infer<typeof UserLoginSchema>;
export type CreateDonationDTO = z.infer<typeof CreateDonationSchema>;
export type CreateAssistanceRequestDTO = z.infer<typeof CreateAssistanceRequestSchema>;

export const CreateClaimSchema = z.object({
  donationId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
  reason: z.string().optional(),
  contactName: z.string().min(2),
  contactPhone: z.string().transform(v => v.replace(/[\s-]/g, '')).refine(v => /^\+998\d{9}$/.test(v), 'Telefon raqam formati noto\'g\'ri'),
});
export type CreateClaimDTO = z.infer<typeof CreateClaimSchema>;

export const UpdateStatusSchema = z.object({
  status: z.string(),
});

