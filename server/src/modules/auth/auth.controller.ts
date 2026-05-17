import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { toSafeUser } from '../user/user.types';
import { RegisterInput, LoginInput } from './auth.schemas';

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

export async function login(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
}
