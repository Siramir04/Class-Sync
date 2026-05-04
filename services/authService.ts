import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updatePassword,
    User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';
import * as Device from 'expo-device';

/**
 * Get a unique identifier for the current device.
 */
export async function getDeviceId(): Promise<string> {
    // On Android, this is usually constant per installation.
    // On iOS, this is constant per vendor.
    return Device.osInternalBuildId || Device.modelName || 'unknown_device';
}

/**
 * Check if a username is already taken in Firestore.
 */
export async function isUsernameUnique(username: string): Promise<boolean> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase().trim()));
    const snapshot = await getDocs(q);
    return snapshot.empty;
}

/**
 * Register a new user with email/password and create their Firestore profile.
 */
export async function registerUser(
    fullName: string,
    email: string,
    username: string,
    university: string,
    role: UserRole,
    password: string
): Promise<FirebaseUser> {
    // 1. Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    // Phase 1: Capture device ID for binding
    const deviceId = await getDeviceId();

    // 2. Write user doc to Firestore IMMEDIATELY
    await setDoc(doc(db, 'users', uid), {
        uid,
        fullName,
        email,
        username: username.toLowerCase().trim(),
        university,
        role,
        createdAt: serverTimestamp(),
        fcmToken: null,
        deviceId, // Bind user to this device
    });

    return credential.user;
}

/**
 * Log in an existing user.
 */
export async function loginUser(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Check if the user is a student and if they've changed devices
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const currentDeviceId = await getDeviceId();

        // If deviceId exists and doesn't match, we might want to flag it or update it
        // depending on the policy. For now, we update it but in a production environment
        // we might restrict device changes to once per semester.
        if (userData.deviceId && userData.deviceId !== currentDeviceId && userData.role === 'student') {
             console.log('User logged in from a different device');
             await updateDoc(doc(db, 'users', credential.user.uid), { deviceId: currentDeviceId });
        } else if (!userData.deviceId) {
             await updateDoc(doc(db, 'users', credential.user.uid), { deviceId: currentDeviceId });
        }
    }

    return credential.user;
}

/**
 * Log the current user out.
 */
export async function logoutUser(): Promise<void> {
    await signOut(auth);
}

/**
 * Get the current user's Firestore profile.
 */
export async function getCurrentUser(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
        ...data,
        uid: snap.id,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as User;
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Update the user's FCM push token in Firestore.
 */
export async function updateFCMToken(uid: string, token: string): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { fcmToken: token });
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Change the current user's password.
 */
export async function changePassword(newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    await updatePassword(user, newPassword);
}
/**
 * Update the user's Firestore profile.
 */
export async function updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), updates as any);
}
