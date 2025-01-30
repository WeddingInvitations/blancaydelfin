// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
// import { enableLogging } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZ3WZC8ikafILAri8d_uQr2fEkNKP9zeY",
  authDomain: "blancaydelfinwedding.firebaseapp.com",
  projectId: "blancaydelfinwedding",
  storageBucket: "blancaydelfinwedding.firebasestorage.app",
  messagingSenderId: "173716631756",
  appId: "1:173716631756:web:6175ea9d350ae2e01f5269",
  measurementId: "G-L2RF7CVFR7"
};


export const firebaseApp = initializeApp(firebaseConfig);
// enableLogging(true);