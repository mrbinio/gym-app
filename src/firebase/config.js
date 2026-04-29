import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: 'AIzaSyAvU2-_YtSeYzEQj3p4GT88lKCI_nIp_fs',
  authDomain: 'gym-biniarz.firebaseapp.com',
  projectId: 'gym-biniarz',
  storageBucket: 'gym-biniarz.firebasestorage.app',
  messagingSenderId: '1044686972971',
  appId: '1:1044686972971:web:75839a139607b8a395a26e',
  measurementId: 'G-RHL93X5GVG'
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();