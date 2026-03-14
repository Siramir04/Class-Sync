import { useEffect, useState } from 'react';
import { subscribeToPostsByCourse, subscribeToUserRecentPosts } from '../services/postService';
import { Post } from '../types';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to subscribe to posts in a specific course.
 */
export function usePosts(spaceId: string | null, courseId: string | null) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!spaceId || !courseId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToPostsByCourse(spaceId, courseId, (fetchedPosts) => {
            setPosts(fetchedPosts);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [spaceId, courseId]);

    return { posts, loading };
}

/**
 * Hook to subscribe to the user's most recent posts in real-time.
 */
export function useRecentPosts(maxPosts: number = 10) {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToUserRecentPosts(user.uid, (fetchedPosts) => {
            setPosts(fetchedPosts);
            setLoading(false);
        }, maxPosts);

        return () => unsubscribe();
    }, [user?.uid, maxPosts]);

    return { posts, loading };
}
