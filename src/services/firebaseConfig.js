//import delle funzioni
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getDatabase } from 'firebase/database'; 
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyCEKMOHKpJtjBh4illvLsEeyh_4gVbhvYU",
  authDomain: "musicapp-9ef42.firebaseapp.com",
  projectId: "musicapp-9ef42",
  storageBucket: "musicapp-9ef42.appspot.com",
  messagingSenderId: "447872928262",
  appId: "1:447872928262:web:a6384747121c1f5d1dd187",
  measurementId: "G-4Y6GWWL5RD"
};
// Inizializzo
const app = initializeApp(firebaseConfig);
// configuro servizi firebase
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
export { auth, db, storage};