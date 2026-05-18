import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SafeUser, logoutUser } from '../api/auth';

type AuthState = {
  user: SafeUser | null;
  accessToken: string | null;
};

type AuthContextType = AuthState & {
  login: (token: string, user: SafeUser) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    accessToken: sessionStorage.getItem('accessToken'),
  });

  const login = useCallback((token: string, user: SafeUser) => {
    sessionStorage.setItem('accessToken', token);
    setAuth({ accessToken: token, user });
  }, []);

  const logout = useCallback(async () => {
    await logoutUser().catch(() => {});
    sessionStorage.removeItem('accessToken');
    setAuth({ accessToken: null, user: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...auth, login, logout, isAuthenticated: !!auth.accessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
