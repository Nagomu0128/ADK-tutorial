"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { onAuthChange, signInWithGoogle, signOut } from "@/lib/auth";

type AuthState = {
  readonly user: User | null;
  readonly loading: boolean;
  readonly signIn: () => Promise<void>;
  readonly logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
});

export const useAuth = (): AuthState => useContext(AuthContext);

type AuthProviderProps = {
  readonly children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const logOut = useCallback(async () => {
    await signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
