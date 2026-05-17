import jwt from 'jsonwebtoken';

export type JwtPayload = {
  userId: string;
  email: string;
};

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env variable: ${key}`);
  return value;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getEnv('JWT_ACCESS_SECRET'), {
    expiresIn: (getEnv('JWT_ACCESS_EXPIRES_IN') as jwt.SignOptions['expiresIn']),
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, getEnv('JWT_REFRESH_SECRET'), {
    expiresIn: (getEnv('JWT_REFRESH_EXPIRES_IN') as jwt.SignOptions['expiresIn']),
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getEnv('JWT_ACCESS_SECRET')) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, getEnv('JWT_REFRESH_SECRET')) as JwtPayload;
}
