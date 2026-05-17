import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.schemas';
import { register, login, logout } from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

export default router;
