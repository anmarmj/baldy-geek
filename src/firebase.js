// src/firebase.js
// Replace the values below with your own Firebase project config
// Get them from: Firebase Console → Project Settings → Your Apps → Web App

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCusL_KxpggzDW_itcypQllbYLzT5LmG8",
    authDomain: "baldy-geek.firebaseapp.com",
    projectId: "baldy-geek",
    storageBucket: "baldy-geek.firebasestorage.app",
    messagingSenderId: "903253310999",
    appId: "1:903253310999:web:a67ae77998506c3b696652",
    measurementId: "G-EJE1XPXGKX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
