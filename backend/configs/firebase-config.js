require("dotenv").config(); // Load environment variables
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");
const {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} = require("firebase/auth"); // Adjust the path for firebase auth
const {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require("firebase/storage");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.firebase_apiKey,
  authDomain: process.env.firebase_authDomain,
  projectId: process.env.firebase_projectId,
  storageBucket: process.env.firebase_storageBucket,
  messagingSenderId: process.env.firebase_messagingSenderId,
  appId: process.env.firebase_appId,
  measurementId: process.env.firebase_measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

module.exports = {
  db,
  auth,
  deleteObject,
  ref,
  signInWithEmailAndPassword,
};
