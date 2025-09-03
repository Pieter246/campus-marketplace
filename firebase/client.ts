// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY "AIzaSyC2BVNADJQAMCFsYsRomacOhn3xyNLJFqs", //Fine to be exposed to the browser because it does not allow any writing to the firestore database
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN "fire-homes-course-32c50.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID "fire-homes-course-32c50",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET "fire-homes-course-32c50.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID "764706143222",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID "1:764706143222:web:509cb4c9877abad2afa5d7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID "G-5BJGW1N7RQ"
};

// Initialize Firebase
const currentApps = getApps();
let auth: Auth;
let storage: FirebaseStorage;

// Only initialise app if one does not exist otherwise use the existing one
if (!currentApps.length) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
}else {
   const app = currentApps[0];
   auth = getAuth(app);
   storage = getStorage(app);
}

export { auth, storage };