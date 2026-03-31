import { 
    collectionGroup, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit, 
    startAfter, 
    doc, 
    getDoc,
    Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Post, FeedPost } from '../types';

const METADATA_CACHE: Record<string, string> = {};

/**
 * Service to aggregate posts from multiple courses client-side.
 * Optimized for Firebase Spark (Free Tier) to minimize read counts.
 */
export const feedService = {
    /**
     * Fetches a paginated feed of posts for the user.
     * Replaces the Cloud Function approach for cost savings.
     */
    async fetchUserFeed(
        user: User, 
        lastVisible: number | null = null, 
        pageSize: number = 20
    ): Promise<{ posts: FeedPost[], nextCursor: number | null }> {
        // 1. Collect all course IDs (Primary + Carryover)
        const enrolledCourseIds = user.enrolledCourses.map(c => c.courseId);
        const carryoverCourseIds = user.carryoverEnrollments
            .filter(c => c.status === 'active')
            .map(c => c.courseId);
        
        const allCourseIds = Array.from(new Set([...enrolledCourseIds, ...carryoverCourseIds]));
        
        if (allCourseIds.length === 0 && !user.primarySpaceId) {
            return { posts: [], nextCursor: null };
        }

        // 2. Define historical limit (Spark Plan Optimizer: last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const dateLimit = Timestamp.fromDate(weekAgo);

        // 3. Query course posts in batches of 30 (Firestore 'in' limit)
        const courseBatches = this.chunkArray(allCourseIds, 30);
        const postQueries = courseBatches.map(async (batch) => {
            let q = query(
                collectionGroup(db, 'posts'),
                where('courseId', 'in', batch),
                where('createdAt', '>', dateLimit),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastVisible) {
                q = query(q, startAfter(Timestamp.fromMillis(lastVisible)));
            }

            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
        });

        // 4. Query GENERAL posts for user's spaces
        const spaceIds = Array.from(new Set([
            user.primarySpaceId, 
            ...user.carryoverEnrollments.map(c => c.spaceId)
        ])).filter(Boolean) as string[];

        const generalQueries = spaceIds.map(async (sId) => {
            let q = query(
                collectionGroup(db, 'posts'),
                where('spaceId', '==', sId),
                where('courseId', '==', 'GENERAL'),
                where('createdAt', '>', dateLimit),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastVisible) {
                q = query(q, startAfter(Timestamp.fromMillis(lastVisible)));
            }

            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
        });

        // 5. Execute all queries and merge
        const results = await Promise.all([...postQueries, ...generalQueries]);
        const allPosts = results.flat();

        // 6. Deduplicate and Sort
        const uniquePosts = Array.from(new Map(allPosts.map(p => [p.id, p])).values());
        uniquePosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        const pagedPosts = uniquePosts.slice(0, pageSize);

        // 7. Enrich with metadata (Space/Course names) using Cache to save reads
        const enrichedPosts = await Promise.all(
            pagedPosts.map(async (post) => {
                const isCarryover = user.carryoverEnrollments.some(e => e.courseId === post.courseId);
                const spaceName = await this.getSpaceName(post.spaceId);
                
                return {
                    ...post,
                    isCarryover,
                    spaceName,
                    courseCode: post.courseCode || 'GENERAL'
                } as FeedPost;
            })
        );

        const nextCursor = enrichedPosts.length > 0 
            ? enrichedPosts[enrichedPosts.length - 1].createdAt.getTime() 
            : null;

        return { posts: enrichedPosts, nextCursor };
    },

    /**
     * Helper to get Space names with local caching to minimize document reads.
     */
    async getSpaceName(spaceId: string): Promise<string> {
        if (METADATA_CACHE[spaceId]) return METADATA_CACHE[spaceId];

        try {
            const snap = await getDoc(doc(db, 'spaces', spaceId));
            if (snap.exists()) {
                const name = snap.data().name;
                METADATA_CACHE[spaceId] = name;
                return name;
            }
        } catch (e) {
            console.error('Error fetching space metadata:', e);
        }
        return 'Unknown Space';
    },

    chunkArray<T>(arr: T[], size: number): T[][] {
        return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
            arr.slice(i * size, i * size + size)
        );
    }
};
