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
import { onAuthChange, signInWithGoogle, signOut, isFirebaseConfigured } from "@/lib/auth";

type AuthState = {
  readonly user: User | null;
  readonly loading: boolean;
  readonly signIn: () => Promise<void>;
  readonly logOut: () => Promise<void>;
  readonly isDevMode: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
  isDevMode: false,
});

export const useAuth = (): AuthState => useContext(AuthContext);

type AuthProviderProps = {
  readonly children: ReactNode;
};

/**
 * Mock user for development when Firebase is not configured.
 * Satisfies the minimum User interface shape needed by the app.
 */
const MOCK_USER = {
  uid: "dev-user-001",
  email: "dev@example.com",
  displayName: "Dev User",
  photoURL: null,
  emailVerified: true,
  getIdToken: async () => "dev-mock-token",
} as unknown as User;

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Firebase not configured — use mock user for development
      console.warn("[AuthProvider] Firebase not configured. Using dev mode with mock user.");
      setUser(MOCK_USER);
      setIsDevMode(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    if (isDevMode) {
      setUser(MOCK_USER);
      return;
    }
    await signInWithGoogle();
  }, [isDevMode]);

  const logOut = useCallback(async () => {
    if (isDevMode) {
      setUser(null);
      return;
    }
    await signOut();
  }, [isDevMode]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut, isDevMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
