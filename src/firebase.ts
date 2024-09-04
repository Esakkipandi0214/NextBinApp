// Import the functions you need from the SDKs you need
import { FirebaseError, initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHz2w8Kywgyn_9IivAHbCNApM5zWwx7Sc",
  authDomain: "bin-app-ce184.firebaseapp.com",
  projectId: "bin-app-ce184",
  storageBucket: "bin-app-ce184.appspot.com",
  messagingSenderId: "979713128444",
  appId: "1:979713128444:web:ff04f587dc10047233e479",
  measurementId: "G-7ZRPRKNWCK"
};

// Initialize Firebase (only if no app is already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db, FirebaseError, signInWithEmailAndPassword };