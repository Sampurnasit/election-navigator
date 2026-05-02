import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, logEvent, isSupported, Analytics } from "firebase/analytics";
import { getPerformance, FirebasePerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_mock_key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ballot-buddy-494818",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

let app: FirebaseApp | undefined;
let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

const isMockKey = firebaseConfig.apiKey === "AIzaSy_mock_key";

try {
  if (typeof window !== "undefined") {
    // Only initialize if not already initialized and not using a mock key
    if (getApps().length === 0) {
      if (!isMockKey) {
        app = initializeApp(firebaseConfig);
        
        isSupported().then(yes => {
          if (yes && app) analytics = getAnalytics(app);
        });
        
        performance = getPerformance(app);
      } else {
        console.info("Firebase: Using mock API key. Analytics and Performance are disabled.");
      }
    }
  }
} catch (e) {
  console.warn("Firebase initialization failed:", e);
}

/**
 * Log a custom event to Firebase Analytics
 */
export const trackEvent = (eventName: string, params?: object) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  } else {
    // Optional: Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Analytics Mock] Event: ${eventName}`, params);
    }
  }
};

export { app, analytics, performance };
