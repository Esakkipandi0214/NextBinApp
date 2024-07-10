// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7Xz2MHIGoxiblKQZ_6rK9nESn9Pb-Ygs",
  authDomain: "binapp-e80a0.firebaseapp.com",
  projectId: "binapp-e80a0",
  storageBucket: "binapp-e80a0.appspot.com",
  messagingSenderId: "650390557145",
  appId: "1:650390557145:web:960b01f5c4f65e391089c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };