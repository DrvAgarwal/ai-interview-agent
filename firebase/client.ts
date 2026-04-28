// Import the functions you need from the SDKs
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYsd97K0cGboQqHQNiKiliZMOH7VaHtTE",
    authDomain: "intvu-5e55a.firebaseapp.com",
    projectId: "intvu-5e55a",
    storageBucket: "intvu-5e55a.appspot.com", // ✅ Corrected storage bucket
    messagingSenderId: "889606743009",
    appId: "1:889606743009:web:973bfdfdf174f959a368a0",
    measurementId: "G-28LYYMHL25"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
