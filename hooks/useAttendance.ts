import { useEffect, useState } from 'react';
import { 
  collectionGroup, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AttendanceSession } from '../types';
import { useSpaceStore } from '../store/spaceStore';

/**
 * Hook to detect active attendance sessions in the user's spaces.
 */
export function useActiveAttendance() {
  const { spaces } = useSpaceStore();
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spaces.length === 0) {
      setLoading(false);
      return;
    }

    const spaceIds = spaces.map(s => s.id);
    
    // Use collectionGroup to find all 'attendance' subcollections
    const attendanceQuery = query(
      collectionGroup(db, 'attendance'),
      where('isOpen', '==', true)
    );

    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      const sessions = snapshot.docs
        .map(doc => doc.data() as AttendanceSession)
        .filter(session => spaceIds.includes(session.spaceId));
      
      setActiveSessions(sessions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [spaces]);

  return { activeSessions, loading };
}
