// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjVXf6nk1Q9IuKbajJZMnZCrNSnjxf40w",
  authDomain: "items-3b336.firebaseapp.com",
  projectId: "items-3b336",
  storageBucket: "items-3b336.firebasestorage.app",
  messagingSenderId: "629150303098",
  appId: "1:629150303098:web:64b94318209647a2918cc3",
  measurementId: "G-BPMHBJ86KD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);