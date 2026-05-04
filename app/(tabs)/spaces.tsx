import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSpaces } from '../../hooks/useSpace';
import { useSpaceStore } from '../../store/spaceStore';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';

export default function SpacesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: Colors, typography: Typography } = useTheme();
  const { spaces, loading } = useSpaces();
  const { carryoverCourses } = useSpaceStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpaces = spaces.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.spaceCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={[styles.title, { color: Colors.onSurface, fontFamily: Typography.family.extraBold }]}>Spaces</Text>
          <Text style={[styles.subtitle, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>{spaces.length} active communities</Text>
        </View>

        <View style={styles.headerActions}>
           <View style={[styles.searchCircle, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }]}>
             <LucideIcons.Search size={18} color={Colors.onSurface} />
           </View>
           <Pressable 
             onPress={() => router.push('/join')}
             style={[styles.joinCircle, { backgroundColor: Colors.accentBlue }]}
           >
             <LucideIcons.Plus size={18} color={Colors.white} />
           </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, { backgroundColor: Colors.surfaceVariant }]}>
          <LucideIcons.Search size={16} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput 
            placeholder="Search your spaces..."
            placeholderTextColor={Colors.textTertiary}
            style={[styles.searchInput, { color: Colors.onSurface, fontFamily: Typography.family.regular }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 104 }}
      >
        <View style={[styles.listContainer, { backgroundColor: Colors.surface, borderColor: Colors.separator }]}>
          {filteredSpaces.map((space, index) => {
             const initials = space.name
               .split(' ')
               .map((w) => w.charAt(0))
               .join('')
               .toUpperCase()
               .slice(0, 2);
             
             return (
                <Pressable 
                  key={space.id} 
                  style={({ pressed }) => [
                    styles.spaceRow,
                    { borderBottomColor: Colors.separator },
                    pressed && { backgroundColor: Colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }
                  ]}
                  onPress={() => router.push(`/space/${space.id}`)}
                >
                  <View style={[
                    styles.iconTile, 
                    { backgroundColor: index % 2 === 0 ? Colors.primaryNavy : Colors.accentBlue }
                  ]}>
                    <Text style={[styles.tileInitials, { color: Colors.white, fontFamily: Typography.family.bold }]}>{initials}</Text>
                  </View>

                  <View style={styles.spaceInfo}>
                     <Text style={[styles.courseCode, { color: Colors.accentBlue, fontFamily: Typography.family.bold }]}>{space.spaceCode}</Text>
                     <Text style={[styles.courseName, { color: Colors.onSurface, fontFamily: Typography.family.bold }]} numberOfLines={1}>{space.name}</Text>
                     <View style={styles.memberRow}>
                        <LucideIcons.Users size={12} color={Colors.textTertiary} />
                        <Text style={[styles.memberCount, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>{space.memberCount || 0} members</Text>
                     </View>
                  </View>

                  <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
                </Pressable>
             );
          })}

          {carryoverCourses.length > 0 && (
            <View style={[styles.carryoverSection, { backgroundColor: Colors.background }]}>
              <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]}>Carryover courses</Text>
              {carryoverCourses.map((course) => (
                <Pressable 
                  key={course.id} 
                  style={[styles.spaceRow, { borderBottomColor: Colors.separator }]}
                  onPress={() => router.push(`/space/${course.id}`)}
                >
                  <View style={[styles.iconTile, { backgroundColor: Colors.carryover }]}>
                    <Text style={[styles.tileInitials, { color: Colors.white, fontFamily: Typography.family.bold }]}>
                      {course.courseName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.spaceInfo}>
                    <Text style={[styles.courseCode, { color: Colors.carryover, fontFamily: Typography.family.bold }]}>{course.fullCode}</Text>
                    <Text style={[styles.courseName, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>{course.courseName}</Text>
                    <Text style={[styles.memberCount, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>Personal space</Text>
                  </View>
                  <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
                </Pressable>
              ))}
            </View>
          )}

          {filteredSpaces.length === 0 && !loading && (
             <View style={styles.emptyState}>
               <Text style={[styles.emptyText, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>No spaces found matching "{searchQuery}"</Text>
             </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  joinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchBar: {
    height: 38,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listContainer: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingLeft: 18,
    borderBottomWidth: 0.5,
  },
  iconTile: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileInitials: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  spaceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  courseCode: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 11,
  },
  carryoverSection: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
