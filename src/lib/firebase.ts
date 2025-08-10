// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCT4L-qmDlZP-cbPAfDuDoNttxjGxHk5sg",
  authDomain: "belajar-466d6.firebaseapp.com",
  projectId: "belajar-466d6",
  storageBucket: "belajar-466d6.appspot.com",
  messagingSenderId: "472113462161",
  appId: "1:472113462161:web:fe6ca1776b3083a54bb830"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
