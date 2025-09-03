// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2BVNADJQAMCFsYsRomacOhn3xyNLJFqs", //Fine to be exposed to the browser because it does not allow any writing to the firestore database
  authDomain: "fire-homes-course-32c50.firebaseapp.com",
  projectId: "fire-homes-course-32c50",
  storageBucket: "fire-homes-course-32c50.firebasestorage.app",
  messagingSenderId: "764706143222",
  appId: "1:764706143222:web:509cb4c9877abad2afa5d7",
  measurementId: "G-5BJGW1N7RQ"
};

// Initialize Firebase
const currentApps = getApps();
let auth: Auth;
let storage: FirebaseStorage;

if (!currentApps.length) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  // const analytics = getAnalytics(currentApps[0]);
}else {
   const app = currentApps[0];
   auth = getAuth(app);
   storage = getStorage(app);
}

export { auth, storage  };