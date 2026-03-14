import { useEffect, useState } from 'react';
import { useSpaceStore } from '../store/spaceStore';
import { useAuthStore } from '../store/authStore';
import { subscribeToUserSpaces, subscribeToSpaceMembers, getSpaceMembers } from '../services/spaceService';
import { Space, CourseMember } from '../types';

/**
 * Hook to subscribe to the user's spaces in real-time.
 */
export function useSpaces() {
    const { user } = useAuthStore();
    const { spaces, setSpaces } = useSpaceStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToUserSpaces(user.uid, (fetchedSpaces) => {
            setSpaces(fetchedSpaces);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return { spaces, loading };
}

/**
 * Hook to get members of a specific space.
 */
export function useSpaceMembers(spaceId: string | null) {
    const [members, setMembers] = useState<CourseMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!spaceId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToSpaceMembers(spaceId, (m) => {
            setMembers(m);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [spaceId]);

    return { members, loading };
}
