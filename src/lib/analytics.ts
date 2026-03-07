import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "./firebase";

export async function trackEvent(name: string, params?: Record<string, unknown>) {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  logEvent(analytics, name, params);
}

