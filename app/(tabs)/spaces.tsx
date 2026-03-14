import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';
import { useSpaces } from '../../hooks/useSpace';
import { useSpaceStore } from '../../store/spaceStore';
import { Space } from '../../types';

export default function SpacesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spaces, loading } = useSpaces();
  const { carryoverCourses } = useSpaceStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpaces = spaces.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.spaceCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.title}>Spaces</Text>
          <Text style={styles.subtitle}>{spaces.length} active communities</Text>
        </View>

        <View style={styles.headerActions}>
           <View style={styles.searchCircle}>
             <LucideIcons.Search size={18} color="#000" />
           </View>
           <Pressable 
             onPress={() => router.push('/join')}
             style={styles.joinCircle}
           >
             <LucideIcons.Plus size={18} color="white" />
           </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <LucideIcons.Search size={16} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput 
            placeholder="Search your spaces..."
            placeholderTextColor={Colors.textTertiary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 104 }}
      >
        <View style={styles.listContainer}>
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
                   pressed && { backgroundColor: 'rgba(0,0,0,0.02)' }
                 ]}
                 onPress={() => router.push(`/space/${space.id}`)}
               >
                 <View style={[
                   styles.iconTile, 
                   { backgroundColor: index % 2 === 0 ? Colors.primaryNavy : Colors.accentBlue }
                 ]}>
                   <Text style={styles.tileInitials}>{initials}</Text>
                 </View>

                 <View style={styles.spaceInfo}>
                    <Text style={styles.courseCode}>{space.spaceCode}</Text>
                    <Text style={styles.courseName} numberOfLines={1}>{space.name}</Text>
                    <View style={styles.memberRow}>
                       <LucideIcons.Users size={12} color={Colors.textTertiary} />
                       <Text style={styles.memberCount}>{space.memberCount || 0} members</Text>
                    </View>
                 </View>

                 <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
               </Pressable>
             );
          })}

          {carryoverCourses.length > 0 && (
            <View style={styles.carryoverSection}>
              <Text style={styles.sectionLabel}>Carryover courses</Text>
              {carryoverCourses.map((course) => (
                <Pressable 
                  key={course.id} 
                  style={styles.spaceRow}
                  onPress={() => router.push(`/space/${course.id}`)}
                >
                  <View style={[styles.iconTile, { backgroundColor: Colors.carryover }]}>
                    <Text style={styles.tileInitials}>
                      {course.courseName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.spaceInfo}>
                    <Text style={[styles.courseCode, { color: Colors.carryover }]}>{course.fullCode}</Text>
                    <Text style={styles.courseName}>{course.courseName}</Text>
                    <Text style={styles.memberCount}>Personal space</Text>
                  </View>
                  <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
                </Pressable>
              ))}
            </View>
          )}

          {filteredSpaces.length === 0 && !loading && (
             <View style={styles.emptyState}>
               <Text style={styles.emptyText}>No spaces found matching "{searchQuery}"</Text>
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
    backgroundColor: Colors.background,
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
    color: '#000',
    letterSpacing: -1,
    fontFamily: Typography.family.extraBold,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
    fontFamily: Typography.family.regular,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchCircle: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
  },
  joinCircle: {
    width: 36,
    height: 36,
    backgroundColor: Colors.accentBlue,
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
    backgroundColor: '#E3E3E8',
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
    color: '#000',
    fontFamily: Typography.family.regular,
  },
  listContainer: {
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.separator,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingLeft: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
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
    color: 'white',
    letterSpacing: -0.5,
    fontFamily: Typography.family.bold,
  },
  spaceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  courseCode: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentBlue,
    marginBottom: 2,
    fontFamily: Typography.family.bold,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: Typography.family.bold,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
  carryoverSection: {
    marginTop: 20,
    backgroundColor: Colors.background,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontFamily: Typography.family.semiBold,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontFamily: Typography.family.regular,
  },
});
