import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase not initialized");
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOut = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    // No Firebase on server - call with null and return noop
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const getIdToken = async (): Promise<string | null> => {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

export const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth();
  return auth?.currentUser ?? null;
};
