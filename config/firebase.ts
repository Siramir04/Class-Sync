import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import {
    getAuth,
    initializeAuth,
    browserLocalPersistence,
    setPersistence,
    Auth,
} from 'firebase/auth';

// Firebase configuration using environment variables
// Note: EXPO_PUBLIC_ prefix is required for Expo to expose these in the client bundle
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-aware persistence
// Web: browserLocalPersistence (localStorage)
// Native: AsyncStorage via getReactNativePersistence
let auth: Auth;

if (Platform.OS === 'web') {
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch((err) => {
        console.error('Failed to set web auth persistence:', err);
    });
} else {
    // getReactNativePersistence is not in the official firebase/auth TS declarations
    // but is exported at runtime for React Native. Use require to avoid TS and bundler issues.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getReactNativePersistence } = require('firebase/auth') as {
        getReactNativePersistence: (storage: unknown) => import('firebase/auth').Persistence;
    };
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
