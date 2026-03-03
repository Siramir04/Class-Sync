import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updatePassword,
    User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';

/**
 * Register a new user with email/password and create their Firestore profile.
 */
export async function registerUser(
    email: string,
    password: string,
    fullName: string,
    university: string,
    role: UserRole
): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    const userData: User = {
        uid,
        fullName,
        email,
        university,
        role,
        createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', uid), {
        ...userData,
        createdAt: serverTimestamp(),
    });

    return userData;
}

/**
 * Log in an existing user.
 */
export async function loginUser(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
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
