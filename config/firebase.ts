import { FirebaseApp, initializeApp } from 'firebase/app';
// @ts-ignore
import { Auth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDb0d-h1lPXiep8RBo1GB8SkoIRp3AjEKA",
  authDomain: "class-sync-79c1e.firebaseapp.com",
  projectId: "class-sync-79c1e",
  storageBucket: "class-sync-79c1e.firebasestorage.app",
  messagingSenderId: "889927986862",
  appId: "1:889927986862:web:d5572d2f3c8d274897873f",
  measurementId: "G-B56X5G7GJ2",
};

let app: FirebaseApp = undefined as any;
let auth: Auth = undefined as any;
let db: Firestore = undefined as any;

try {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { auth, db };
export default app;
