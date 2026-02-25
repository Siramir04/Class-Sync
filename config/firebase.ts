import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export default app;
