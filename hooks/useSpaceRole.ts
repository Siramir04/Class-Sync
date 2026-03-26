import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

/**
 * Hook to resolve and subscribe to a user's role within a specific space.
 * Roles are space-specific and stored in /spaces/{spaceId}/members/{uid}.
 */
export function useSpaceRole(spaceId: string) {
  const user = useAuthStore((s) => s.user);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !spaceId) {
      setRole(null);
      setLoading(false);
      return;
    }

    const memberRef = doc(db, 'spaces', spaceId, 'members', user.uid);
    
    // Subscribe to the member document to get real-time role updates
    const unsub = onSnapshot(memberRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRole(data.role as UserRole);
      } else {
        // If no member doc exists, they have no role in this space
        setRole(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching space role:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid, spaceId]);

  const isMonitor = role === 'monitor';
  const isAssistant = role === 'assistant_monitor';
  const isLecturer = role === 'lecturer';
  const isStudent = role === 'student';

  return {
    role,
    loading,
    // Role flags
    isMonitor,
    isAssistant,
    isLecturer,
    isStudent,
    // Permission flags (based on the approved transition matrix)
    canManageSpace: isMonitor || isAssistant,
    canCreateLecture: isMonitor || isAssistant || isLecturer,
    canCreateNote: !!role, 
    canUploadMaterials: isMonitor || isAssistant || isLecturer || isStudent,
    canPinPost: isMonitor || isAssistant,
    canDeleteSpace: isMonitor, 
    canPromoteMembers: isMonitor, 
    canRemoveMembers: isMonitor || isAssistant,
    canStartAttendance: isMonitor || isAssistant,
  };
}
