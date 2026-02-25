import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(50, 'Display name too long'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const createClubSchema = z.object({
  name: z.string().min(1, 'Club name is required').max(100, 'Club name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  is_public: z.boolean(),
})

export const joinClubSchema = z.object({
  club_id: z.number().int().positive('Invalid club'),
})

export const createDiscussionSchema = z.object({
  club_id: z.number().int().positive(),
  book_id: z.number().int().positive().optional(),
  chapter_id: z.number().int().positive().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().max(5000, 'Content too long').optional(),
})

export const addCommentSchema = z.object({
  discussion_id: z.number().int().positive(),
  club_id: z.string().min(1),
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
})

export const updateProgressSchema = z.object({
  club_id: z.number().int().positive(),
  book_id: z.number().int().positive(),
  current_chapter: z.number().int().min(0),
  current_page: z.number().int().min(0).optional(),
  total_pages: z.number().int().positive().optional(),
})

export const updateProfileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(50, 'Display name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
})

export const chapterSchema = z.object({
  club_id: z.number().int().positive(),
  book_id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(200),
  chapter_number: z.number().int().min(1, 'Chapter number must be at least 1'),
  start_page: z.number().int().min(0).optional(),
  end_page: z.number().int().min(0).optional(),
})

export const deleteChapterSchema = z.object({
  chapter_id: z.number().int().positive('Invalid chapter'),
  club_id: z.number().int().positive('Invalid club'),
})

