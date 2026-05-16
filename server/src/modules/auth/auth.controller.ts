import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../utils/hash';
import { toSafeUser } from '../user/user.types';
import { RegisterInput } from './auth.schemas';

export async function register(
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, name, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });

    res.status(201).json({ user: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
}
