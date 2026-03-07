import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import {
  getFirestore,
  type Firestore
} from "firebase/firestore";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firebaseDb: Firestore | undefined;
let firebaseAnalytics: Analytics | undefined;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDEajXybLBjIgviuR0Pt92riZo5KOiayNo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "foods-e10b7.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "foods-e10b7",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "foods-e10b7.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "141766937292",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:141766937292:web:173727a2011165d4e0d069",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-KXZ864ZVFB"
};

export function getFirebaseApp() {
  if (!firebaseApp) {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
  }
  return firebaseApp;
}

export function getFirebaseAuth() {
  if (!firebaseAuth) {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // ignore persistence errors in non-browser environments
    });
    firebaseAuth = auth;
  }
  return firebaseAuth;
}

export function getDb() {
  if (!firebaseDb) {
    const app = getFirebaseApp();
    firebaseDb = getFirestore(app);
  }
  return firebaseDb;
}

export async function getFirebaseAnalytics() {
  if (firebaseAnalytics) return firebaseAnalytics;
  if (typeof window === "undefined") return undefined;
  if (!(await isSupported())) return undefined;
  const app = getFirebaseApp();
  firebaseAnalytics = getAnalytics(app);
  return firebaseAnalytics;
}

