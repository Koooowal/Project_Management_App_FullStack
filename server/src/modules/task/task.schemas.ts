import { z } from 'zod';

const taskStatusValues = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(taskStatusValues).optional(),
  assigneeId: z.string().min(1).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(taskStatusValues).optional(),
  assigneeId: z.string().nullable().optional(),
});

export const assignTaskSchema = z.object({
  assigneeId: z.string().min(1).nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
