import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['healthcare', 'engineer', 'admin'], {
    message: 'Please select a valid role',
  }),
  institution: z.string().min(2, 'Institution is required'),
  location: z.string().min(2, 'Location is required'),
  expertise: z.string().min(3, 'Expertise/Focus is required'),
});

export const announcementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  domain: z.string().min(2, 'Clinical Domain is required'),
  clinicalContext: z.string().min(10, 'Clinical context is required (min 10 chars)'),
  technicalChallenge: z.string().min(10, 'Technical challenge is required (min 10 chars)'),
  projectStage: z.string().min(2, 'Project Stage is required'),
  commitment: z.string().min(2, 'Commitment Level is required'),
  requirements: z.array(z.string().min(1, 'Requirement cannot be empty')).min(1, 'At least one requirement is needed'),
});

export const meetingSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
