import { Router, RequestHandler } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createTaskSchema, updateTaskSchema } from './task.schemas';
import { createTask, deleteTask, getProjectTasks, updateTask } from './task.controller';

const router = Router();

router.use(requireAuth);

router.get('/projects/:projectId/tasks', getProjectTasks as unknown as RequestHandler);
router.post(
  '/projects/:projectId/tasks',
  validate(createTaskSchema),
  createTask as unknown as RequestHandler,
);
router.put('/tasks/:id', validate(updateTaskSchema), updateTask as unknown as RequestHandler);
router.delete('/tasks/:id', deleteTask as unknown as RequestHandler);

export default router;
