import { z } from 'zod';

const OfflineClueSchema = z.object({
  question: z.string().trim().min(1, 'Pertanyaan wajib diisi'),
  answer: z.string().trim().min(1, 'Jawaban wajib diisi'),
  value: z.coerce.number().int().min(0).default(100),
});

const OfflineCategorySchema = z.object({
  title: z.string().trim().min(1, 'Kategori wajib diisi'),
  clues: z.array(OfflineClueSchema).min(1, 'Minimal satu clue per kategori'),
});

export const CreateOfflineJeopardySchema = z.object({
  name: z.string().trim().min(1, 'Nama permainan wajib diisi'),
  description: z
    .string()
    .trim()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  categories: z.array(OfflineCategorySchema).min(1, 'Minimal satu kategori'),
});

export const UpdateOfflineJeopardySchema = z.object({
  name: z.string().trim().min(1, 'Nama permainan wajib diisi').optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  categories: z.array(OfflineCategorySchema).min(1, 'Minimal satu kategori').optional(),
});

export type ICreateOfflineJeopardy = z.infer<typeof CreateOfflineJeopardySchema>;
export type IUpdateOfflineJeopardy = z.infer<typeof UpdateOfflineJeopardySchema>;
export type IOfflineCategoryInput = z.infer<typeof OfflineCategorySchema>;
export type IOfflineClueInput = z.infer<typeof OfflineClueSchema>;
