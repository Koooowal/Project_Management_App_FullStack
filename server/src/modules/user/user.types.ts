export type SafeUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toSafeUser(user: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}
