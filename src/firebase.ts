// Import the functions you need from the SDKs you need
import { FirebaseError, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDN_MOmEmPzsqhx6Ktcb7lvJGYfUT-Mt_M",
  authDomain: "bin-app-ce184.firebaseapp.com",
  projectId: "bin-app-ce184",
  storageBucket: "bin-app-ce184.appspot.com",
  messagingSenderId: "979713128444",
  appId: "1:979713128444:web:ccfaecc838cf6bf233e479",
  measurementId: "G-6CWNL7M2NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db ,FirebaseError,signInWithEmailAndPassword};