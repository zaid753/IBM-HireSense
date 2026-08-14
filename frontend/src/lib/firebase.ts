import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAtGzAktQfZy1Ern2ZqwtdFJmFHGMszD_k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hiresense-5e81a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hiresense-5e81a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hiresense-5e81a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "409744790508",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:409744790508:web:8eb7c3ee539e4c896626c9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2L9DHGRDBT",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
