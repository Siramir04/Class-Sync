import { useState, useEffect } from 'react';
import { collectionGroup, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Post } from '../types';
import { useAuthStore } from '../store/authStore';

export function useTracker() {
    const { user } = useAuthStore();
    const [deadlines, setDeadlines] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Query all assignments and tests across all spaces/courses
        const q = query(
            collectionGroup(db, 'posts'),
            where('type', 'in', ['assignment', 'test']),
            where('dueDate', '>', new Date()),
            orderBy('dueDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                dueDate: doc.data().dueDate?.toDate(),
            } as Post));
            
            // In a real app, we might need to filter by user's joined spaces
            // but for now, collectionGroup is efficient
            setDeadlines(items.slice(0, 10)); // Top 10 upcoming
            setLoading(false);
        }, (error) => {
            console.error('Error fetching tracker items:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { deadlines, loading };
}
