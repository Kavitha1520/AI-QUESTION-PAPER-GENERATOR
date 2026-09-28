import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// The Firebase configuration provided by the user
export const defaultFirebaseConfig = {
  apiKey: "AIzaSyDUBNt4SAQs8-gVGPjIQRVx_pUm7UDxUvc",
  authDomain: "ai-question-paper-genera-3d772.firebaseapp.com",
  projectId: "ai-question-paper-genera-3d772",
  storageBucket: "ai-question-paper-genera-3d772.firebasestorage.app",
  messagingSenderId: "980136260538",
  appId: "1:980136260538:web:93c4bb1ea041798ca9e383",
  measurementId: "G-NW3MSGZGZX"
};

// Allow custom config override from localStorage if desired
export function getStoredFirebaseConfig() {
  try {
    const custom = localStorage.getItem("custom_firebase_config");
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse custom config", e);
  }
  return defaultFirebaseConfig;
}

export const activeConfig = getStoredFirebaseConfig();

// Initialize Firebase app singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper function to map Firebase Auth error codes to friendly strings
export function getAuthErrorMessage(error: any): string {
  if (!error) return "An unknown error occurred.";
  const code = error.code || "";
  
  switch (code) {
    case "auth/invalid-email":
      return "The email address is improperly formatted.";
    case "auth/user-disabled":
      return "This account has been disabled by an administrator.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again or reset your password.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please verify your credentials.";
    case "auth/email-already-in-use":
      return "An account is already registered with this email address.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters with numbers or symbols.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled in your Firebase console. Please enable it under Firebase Console -> Authentication -> Sign-in method.";
    case "auth/too-many-requests":
      return "Access to this account has been temporarily disabled due to many failed login attempts. You can restore it immediately by resetting your password or try again later.";
    case "auth/network-request-failed":
      return "A network error occurred. Please check your internet connection.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing the sign-in.";
    case "auth/cancelled-popup-request":
      return "Sign-in popup request was cancelled.";
    case "auth/requires-recent-login":
      return "This operation requires recent authentication. Please sign out and log back in.";
    default:
      return error.message || "An authentication error occurred. Please try again.";
  }
}
