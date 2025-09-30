import { z } from 'zod';

// Deposit validation
export const depositSchema = z.object({
  amount: z.number()
    .min(1, 'Amount must be at least $1')
    .max(1000000, 'Amount cannot exceed $1,000,000'),
  note: z.string()
    .trim()
    .min(1, 'Note is required')
    .max(500, 'Note cannot exceed 500 characters'),
});

// Withdrawal validation
export const withdrawalSchema = z.object({
  amount: z.number()
    .min(1, 'Amount must be at least $1'),
  destinationNote: z.string()
    .trim()
    .min(1, 'Destination note is required')
    .max(500, 'Destination note cannot exceed 500 characters'),
});

// Plan validation
export const planSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  price: z.number()
    .min(1, 'Price must be at least $1')
    .max(100000, 'Price cannot exceed $100,000'),
  roiPercent: z.number()
    .min(0.1, 'ROI must be at least 0.1%')
    .max(1000, 'ROI cannot exceed 1000%'),
  durationDays: z.number()
    .min(1, 'Duration must be at least 1 day')
    .max(3650, 'Duration cannot exceed 3650 days'),
});

// User profile validation
export const profileSchema = z.object({
  fullName: z.string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name cannot exceed 100 characters'),
  phone: z.string()
    .trim()
    .optional()
    .refine((phone) => !phone || phone.length >= 10, 'Phone number must be at least 10 digits'),
});

// User creation/update validation (admin)
export const userSchema = z.object({
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  fullName: z.string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name cannot exceed 100 characters'),
  phone: z.string()
    .trim()
    .optional(),
  role: z.enum(['ADMIN', 'USER'] as const, {
    errorMap: () => ({ message: 'Role must be either ADMIN or USER' })
  }),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'DISABLED'] as const, {
    errorMap: () => ({ message: 'Invalid status' })
  }),
});

export type DepositFormData = z.infer<typeof depositSchema>;
export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;
export type PlanFormData = z.infer<typeof planSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type UserFormData = z.infer<typeof userSchema>;