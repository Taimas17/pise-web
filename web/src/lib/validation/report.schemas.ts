import { z } from 'zod';

export const createReportSchema = z.object({
  infrastructure_type_id: z.number().min(1, "Type d'infrastructure requis"),
  criticality: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, 'Description trop courte (min 10 caractères)').max(1000),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  mask_location: z.boolean().default(false),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/).optional().or(z.literal('')),
  photos: z.any().array().max(5, 'Maximum 5 photos').optional(),
});

export const reviewReportSchema = z.object({
  action: z.enum(['approve', 'reject']),
  comment: z.string().min(10).max(500),
});
