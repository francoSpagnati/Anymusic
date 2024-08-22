// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getDatabase } from 'firebase/database'; 
import { getStorage } from 'firebase/storage';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEKMOHKpJtjBh4illvLsEeyh_4gVbhvYU",
  authDomain: "musicapp-9ef42.firebaseapp.com",
  projectId: "musicapp-9ef42",
  storageBucket: "musicapp-9ef42.appspot.com",
  messagingSenderId: "447872928262",
  appId: "1:447872928262:web:a6384747121c1f5d1dd187",
  measurementId: "G-4Y6GWWL5RD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Configura e esporta i servizi di Firebase che ti servono
const auth = getAuth(app);
const db = getDatabase(app); // Usa il Realtime Database
const storage = getStorage(app);

export { auth, db, storage};