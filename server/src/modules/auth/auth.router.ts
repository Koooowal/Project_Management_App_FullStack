import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { registerSchema } from './auth.schemas';
import { register } from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), register);

export default router;
