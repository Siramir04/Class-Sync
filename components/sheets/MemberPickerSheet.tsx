import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import ActionSheet from '../ui/ActionSheet';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import * as LucideIcons from 'lucide-react-native';
import { getSpaceMembers } from '../../services/spaceService';
import { getCurrentUser } from '../../services/authService';
import { CourseMember, User } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';

interface MemberPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  spaceId: string;
  onSelect: (user: { uid: string; fullName: string }) => void;
  title?: string;
}

export default function MemberPickerSheet({
  visible,
  onClose,
  spaceId,
  onSelect,
  title = "Select Lecturer",
}: MemberPickerSheetProps) {
  const [members, setMembers] = useState<{ uid: string; fullName: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && spaceId) {
      loadMembers();
    }
  }, [visible, spaceId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const spaceMembers = await getSpaceMembers(spaceId);
      // Filter for lecturers only
      const lecturers = spaceMembers.filter(m => m.role === 'lecturer');
      
      const memberDetails = await Promise.all(
        lecturers.map(async (m) => {
          const u = await getCurrentUser(m.uid);
          return {
            uid: m.uid,
            fullName: u?.fullName || 'Unknown User',
            role: m.role,
          };
        })
      );
      
      setMembers(memberDetails);
    } catch (error) {
      console.error("Error loading members for picker:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionSheet 
      visible={visible} 
      onClose={onClose} 
      title={title}
    >
      <View style={styles.content}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FlatList 
            data={members}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <Pressable 
                style={({ pressed }) => [
                  styles.memberRow,
                  pressed && { backgroundColor: Colors.surfaceSecondary }
                ]}
                onPress={() => {
                  onSelect({ uid: item.uid, fullName: item.fullName });
                  onClose();
                }}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.fullName[0].toUpperCase()}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.memberName}>{item.fullName}</Text>
                  <Text style={styles.memberRole}>{item.role}</Text>
                </View>
                <LucideIcons.ChevronRight size={20} color={Colors.textTertiary} />
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LucideIcons.Users size={48} color={Colors.separatorOpaque} />
                <Text style={styles.emptyText}>No lecturers found in this space</Text>
              </View>
            }
          />
        )}
      </View>
    </ActionSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentBlueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accentBlue,
    fontFamily: Typography.family.bold,
  },
  textContainer: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: Typography.family.semiBold,
  },
  memberRole: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
});
