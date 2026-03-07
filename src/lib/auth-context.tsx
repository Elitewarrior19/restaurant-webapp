"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { getFirebaseAuth, getDb } from "./firebase";

type Role = "customer" | "kitchen" | "delivery" | "admin";

type AppUser = {
  uid: string;
  email: string | null;
  role: Role;
  name?: string;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signup: (email: string, password: string, role?: Role) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureUserProfile(firebaseUser: User, desiredRole?: Role) {
  const db = getDb();
  const usersCol = collection(db, "users");
  const ref = doc(usersCol, firebaseUser.uid);
  const snap = await getDoc(ref);
  const defaultRole: Role = desiredRole ?? "customer";
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: defaultRole,
      name: firebaseUser.displayName ?? undefined,
      photoURL: firebaseUser.photoURL ?? undefined,
      createdAt: new Date().toISOString()
    });
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: defaultRole,
      name: firebaseUser.displayName ?? undefined
    };
  }
  const data = snap.data() as Partial<AppUser>;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? data.email ?? null,
    role: (data.role as Role) ?? defaultRole,
    name: data.name ?? firebaseUser.displayName ?? undefined
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await ensureUserProfile(firebaseUser);
      setUser(profile);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signup(email: string, password: string, role?: Role) {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await ensureUserProfile(cred.user, role);
    setUser(profile);
  }

  async function login(email: string, password: string) {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await ensureUserProfile(cred.user);
    setUser(profile);
  }

  async function loginWithGoogle() {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const profile = await ensureUserProfile(cred.user);
    setUser(profile);
  }

  async function logout() {
    const auth = getFirebaseAuth();
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useRequireRole(roles: Role[]) {
  const { user, loading } = useAuth();
  const allowed = user && roles.includes(user.role);
  return { user, loading, allowed };
}

