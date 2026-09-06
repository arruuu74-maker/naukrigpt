// ============================================================
// NaukriGPT — Firebase Config ✅ CONNECTED
// Project: naukrigpt | Region: asia-south1 (Mumbai)
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBnTaY5C-d050w4TFzDwFFRRicC9mNr-Zw",
  authDomain: "naukrigpt.firebaseapp.com",
  projectId: "naukrigpt",
  storageBucket: "naukrigpt.firebasestorage.app",
  messagingSenderId: "515745588988",
  appId: "1:515745588988:web:e073e0684a046eb09cd979"
};

// Firebase initialize karo
firebase.initializeApp(FIREBASE_CONFIG);

// Auth (login/signup) aur Database ready
const auth = firebase.auth();
const db = firebase.firestore();

const FIREBASE_READY = true;
console.log("✅ Firebase connected: NaukriGPT");