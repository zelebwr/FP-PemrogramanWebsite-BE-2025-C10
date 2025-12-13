import z from 'zod';

import {
  fileSchema,
  StringToBooleanSchema,
  StringToObjectSchema,
} from '@/common';

/**
 * Schema for a single clue in a category (update)
 */
const ClueSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  answer: z.string().min(1, 'Answer is required').max(255),
  value: z.number().int().positive('Value must be positive'),
  media_url: z.string().url().optional().nullable(),
  is_daily_double: z.boolean().default(false),
});

/**
 * Schema for a category with its clues (update)
 */
const CategorySchema = z.object({
  title: z.string().min(1, 'Category title is required').max(100),
  clues: z
    .array(ClueSchema)
    .min(1, 'At least 1 clue per category is required')
    .max(10, 'Maximum 10 clues per category'),
});

/**
 * Schema for a round (update)
 */
const RoundSchema = z.object({
  type: z.enum(['jeopardy', 'double', 'final']),
  name: z.string().min(1, 'Round name is required').max(50),
  categories: z
    .array(CategorySchema)
    .min(1, 'At least 1 category per round is required')
    .max(6, 'Maximum 6 categories per round'),
});

/**
 * Schema for game settings (update)
 */
const SettingsSchema = z.object({
  time_limit_per_clue: z.number().int().min(0).max(300).default(30),
  allow_daily_double: z.boolean().default(true),
  double_jeopardy_multiplier: z.number().int().min(1).max(5).default(2),
  max_teams: z.number().int().min(1).max(10).default(4),
  starting_score: z.number().int().min(0).default(0),
});

/**
 * Schema for updating a Jeopardy game
 */
export const UpdateJeopardySchema = z.object({
  name: z.string().min(1).max(128).trim().optional(),
  description: z.string().max(256).trim().optional(),
  thumbnail_image: fileSchema({}).optional(),
  is_publish: StringToBooleanSchema.optional(),
  // When present, instructs the service to publish immediately
  is_publish_immediately: StringToBooleanSchema.optional(),
  settings: StringToObjectSchema(SettingsSchema).optional(),
  rounds: StringToObjectSchema(
    z
      .array(RoundSchema)
      .min(1, 'At least 1 round is required')
      .max(3, 'Maximum 3 rounds allowed'),
  ).optional(),
});

export type IUpdateJeopardy = z.infer<typeof UpdateJeopardySchema>;
