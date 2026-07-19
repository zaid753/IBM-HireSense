import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAtGzAktQfZy1Ern2ZqwtdFJmFHGMszD_k",
  authDomain: "hiresense-5e81a.firebaseapp.com",
  projectId: "hiresense-5e81a",
  storageBucket: "hiresense-5e81a.firebasestorage.app",
  messagingSenderId: "409744790508",
  appId: "1:409744790508:web:8eb7c3ee539e4c896626c9",
  measurementId: "G-2L9DHGRDBT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
