// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8sIBjgbchQWZ2re2tcjHThj_ocN-iwX4",
  authDomain: "easynote-b7a57.firebaseapp.com",
  projectId: "easynote-b7a57",
  storageBucket: "easynote-b7a57.appspot.com",
  messagingSenderId: "676050946923",
  appId: "1:676050946923:web:61b680ceac071ad2419a2e",
  measurementId: "G-0PJD1E9Q2Y"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }

