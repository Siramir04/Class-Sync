import { create } from 'zustand';
import { FeedPost } from '../types';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface FeedState {
    posts: FeedPost[];
    lastFetch: number | null;
    isLoading: boolean;
    hasMore: boolean;
    cursor: number | null;
    
    setPosts: (posts: FeedPost[], nextCursor: number | null) => void;
    appendPosts: (posts: FeedPost[], nextCursor: number | null) => void;
    setLoading: (loading: boolean) => void;
    clearFeed: () => void;
    isCacheValid: () => boolean;
}

export const useFeedStore = create<FeedState>()((set, get) => ({
    posts: [],
    lastFetch: null,
    isLoading: false,
    hasMore: true,
    cursor: null,

    setPosts: (posts, cursor) => set({ 
        posts, 
        cursor, 
        lastFetch: Date.now(),
        hasMore: posts.length > 0 && !!cursor 
    }),

    appendPosts: (newPosts, cursor) => set((state) => ({
        posts: [...state.posts, ...newPosts],
        cursor,
        hasMore: newPosts.length > 0 && !!cursor
    })),

    setLoading: (isLoading) => set({ isLoading }),

    clearFeed: () => set({ 
        posts: [], 
        lastFetch: null, 
        cursor: null, 
        hasMore: true 
    }),

    isCacheValid: () => {
        const { lastFetch, posts } = get();
        if (!lastFetch || posts.length === 0) return false;
        return (Date.now() - lastFetch) < CACHE_TTL_MS;
    },
}));
