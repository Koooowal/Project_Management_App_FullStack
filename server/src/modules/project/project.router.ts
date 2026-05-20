import { Router, RequestHandler } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema } from './project.schemas';
import { getProjects, createProject, updateProject, deleteProject } from './project.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getProjects as unknown as RequestHandler);
router.post('/', validate(createProjectSchema), createProject as unknown as RequestHandler);
router.put('/:id', validate(updateProjectSchema), updateProject as unknown as RequestHandler);
router.delete('/:id', deleteProject as unknown as RequestHandler);

export default router;
