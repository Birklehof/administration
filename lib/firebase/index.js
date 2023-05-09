// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, OAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDGdpWSq4zcSck0N4iR_CYvVwMuCPJsv9w',
  authDomain: 'birklehof-f1931.firebaseapp.com',
  projectId: 'birklehof-f1931',
  storageBucket: 'birklehof-f1931.appspot.com',
  messagingSenderId: '486146853469',
  appId: '1:486146853469:web:85d8e99ff62c2df28ddbb4',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const microsoftOAuthProvider = new OAuthProvider('microsoft.com');
microsoftOAuthProvider.setCustomParameters({
  prompt: 'consent',
  tenant: '89cd34a8-db37-49d2-a4f9-9231b59f7e1a',
});

export { app, db, auth, microsoftOAuthProvider };
