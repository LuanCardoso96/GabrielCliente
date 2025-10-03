// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPbq_QbfznHb3eW0nQNoXeO7OzK0BSfZE",
  authDomain: "imperium7-280a5.firebaseapp.com",
  projectId: "imperium7-280a5",
  storageBucket: "imperium7-280a5.firebasestorage.app",
  messagingSenderId: "24913029027",
  appId: "1:24913029027:web:d73d6571ef2307843e5c16",
  measurementId: "G-CBM4LTJ98C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
