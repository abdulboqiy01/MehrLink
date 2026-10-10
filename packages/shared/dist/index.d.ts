import { z } from 'zod';
export declare const Role: {
    readonly USER: "USER";
    readonly VOLUNTEER: "VOLUNTEER";
    readonly ADMIN: "ADMIN";
};
export type Role = typeof Role[keyof typeof Role];
export declare const DonationStatus: {
    readonly PENDING: "PENDING";
    readonly ACCEPTED: "ACCEPTED";
    readonly ASSIGNED_TO_VOLUNTEER: "ASSIGNED_TO_VOLUNTEER";
    readonly DELIVERED: "DELIVERED";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
};
export type DonationStatus = typeof DonationStatus[keyof typeof DonationStatus];
export declare const AssistanceRequestStatus: {
    readonly PENDING: "PENDING";
    readonly REVIEWING: "REVIEWING";
    readonly APPROVED: "APPROVED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly RESOLVED: "RESOLVED";
    readonly REJECTED: "REJECTED";
};
export type AssistanceRequestStatus = typeof AssistanceRequestStatus[keyof typeof AssistanceRequestStatus];
export declare const UrgencyLevel: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly CRITICAL: "CRITICAL";
};
export type UrgencyLevel = typeof UrgencyLevel[keyof typeof UrgencyLevel];
export declare const UserRegistrationSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodNativeEnum<{
        readonly USER: "USER";
        readonly VOLUNTEER: "VOLUNTEER";
        readonly ADMIN: "ADMIN";
    }>>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    role?: "USER" | "VOLUNTEER" | "ADMIN" | undefined;
}, {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    role?: "USER" | "VOLUNTEER" | "ADMIN" | undefined;
}>;
export declare const UserLoginSchema: z.ZodObject<{
    phone: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    password: string;
}, {
    phone: string;
    password: string;
}>;
export declare const CreateDonationSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
    monetaryValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    category: string;
    quantity: number;
    monetaryValue?: number | null | undefined;
}, {
    title: string;
    description: string;
    category: string;
    quantity?: number | undefined;
    monetaryValue?: number | null | undefined;
}>;
export declare const CreateAssistanceRequestSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    urgency: z.ZodDefault<z.ZodNativeEnum<{
        readonly LOW: "LOW";
        readonly MEDIUM: "MEDIUM";
        readonly HIGH: "HIGH";
        readonly CRITICAL: "CRITICAL";
    }>>;
    location: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    location: string;
}, {
    title: string;
    description: string;
    location: string;
    urgency?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
}>;
export type UserRegistrationDTO = z.infer<typeof UserRegistrationSchema>;
export type UserLoginDTO = z.infer<typeof UserLoginSchema>;
export type CreateDonationDTO = z.infer<typeof CreateDonationSchema>;
export type CreateAssistanceRequestDTO = z.infer<typeof CreateAssistanceRequestSchema>;
export declare const CreateClaimSchema: z.ZodObject<{
    donationId: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
    contactName: z.ZodString;
    contactPhone: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    donationId: string;
    contactName: string;
    contactPhone: string;
    reason?: string | undefined;
}, {
    donationId: string;
    contactName: string;
    contactPhone: string;
    quantity?: number | undefined;
    reason?: string | undefined;
}>;
export type CreateClaimDTO = z.infer<typeof CreateClaimSchema>;
export declare const UpdateStatusSchema: z.ZodObject<{
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: string;
}, {
    status: string;
}>;
