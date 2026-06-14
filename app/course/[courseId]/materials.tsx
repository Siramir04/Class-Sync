import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/authStore';
import { useSpaceRole } from '../../../hooks/useSpaceRole';
import * as materialService from '../../../services/materialService';
import * as DocumentPicker from 'expo-document-picker';
import { CourseMaterial } from '../../../types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import { formatBytes } from '../../../utils/formatBytes';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Spacing } from '../../../constants/spacing';

export default function CourseMaterialsScreen() {
    const { spaceId, courseId, courseCode } = useLocalSearchParams<{
        spaceId: string;
        courseId: string;
        courseCode: string;
    }>();
    const router = useRouter();
    const { colors: Colors, typography: Typography } = useTheme();
    const { user } = useAuthStore();

    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const themedStyles = styles(Colors, Typography);

    // RBAC
    const { canUploadMaterials } = useSpaceRole(spaceId!);

    useEffect(() => {
        if (!spaceId || !courseId) return;
        loadMaterials();
    }, [spaceId, courseId]);

    const loadMaterials = async () => {
        setLoading(true);
        try {
            const data = await materialService.getMaterials(spaceId!, courseId!);
            setMaterials(data);
        } catch (error) {
            console.error('Error loading materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setUploading(true);
            
            await materialService.uploadMaterial(
                spaceId!,
                courseId!,
                file.uri,
                file.name,
                file.size || 0,
                file.mimeType || 'application/octet-stream',
                user!.uid,
                user!.fullName
            );

            Alert.alert('Success', 'File uploaded successfully');
            loadMaterials();
        } catch (error) {
            Alert.alert('Error', 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (material: CourseMaterial) => {
        try {
            const cacheDir = (FileSystem as any).cacheDirectory || '';
            const fileUri = `${cacheDir}${material.title}`;
            const downloadResumable = FileSystem.createDownloadResumable(
                material.fileUrl,
                fileUri
            );

            const result = await downloadResumable.downloadAsync();
            if (result) {
                await Sharing.shareAsync(result.uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to download file');
        }
    };

    const handleDelete = (material: CourseMaterial) => {
        Alert.alert('Delete Material', `Are you sure you want to delete "${material.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await materialService.deleteMaterial(spaceId!, courseId!, material.id, (material as any).storagePath);
                        setMaterials(prev => prev.filter(m => m.id !== material.id));
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete file');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: CourseMaterial }) => (
        <TouchableOpacity 
            style={themedStyles.materialCard} 
            onPress={() => handleDownload(item)}
            activeOpacity={0.7}
        >
            <View style={[themedStyles.fileIcon, { backgroundColor: getFileColor(item.fileType) + '15' }]}>
                <Ionicons 
                    name={getFileIcon(item.fileType) as any} 
                    size={24} 
                    color={getFileColor(item.fileType)} 
                />
            </View>
            <View style={themedStyles.materialInfo}>
                <Text style={themedStyles.materialTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={themedStyles.materialMeta}>
                    {formatBytes(item.fileSize)} · {item.uploadedByName}
                </Text>
            </View>
            <View style={themedStyles.actions}>
                {item.isPinned && (
                    <Ionicons name="pin" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                )}
                {canUploadMaterials && (
                    <TouchableOpacity 
                        onPress={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                        }}
                        style={themedStyles.deleteBtn}
                    >
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                )}
                <Ionicons name="download-outline" size={20} color={Colors.onSurfaceVariant} />
            </View>
        </TouchableOpacity>
    );

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <SafeAreaView style={themedStyles.container}>
            <View style={themedStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={themedStyles.headerButton}>
                    <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
                <View style={themedStyles.headerTitleContainer}>
                    <Text style={themedStyles.headerTitle}>Course Materials</Text>
                    <Text style={themedStyles.headerSubtitle}>{courseCode}</Text>
                </View>
                {canUploadMaterials ? (
                    <TouchableOpacity 
                        onPress={handleUpload} 
                        style={themedStyles.headerButton}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                            <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 44 }} />
                )}
            </View>

            <FlatList
                data={materials}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={themedStyles.listContent}
                ListEmptyComponent={
                    <View style={themedStyles.emptyContainer}>
                        <EmptyState
                            icon="document-outline"
                            title="No materials yet"
                            subtitle="Shared course documents and PDFs will appear here."
                        />
                    </View>
                }
            />
        </SafeAreaView>
    );
}

function getFileIcon(mimeType: string) {
    if (mimeType.includes('pdf')) return 'document-text';
    if (mimeType.includes('word') || mimeType.includes('officedocument')) return 'document';
    return 'file-tray-full';
}

function getFileColor(mimeType: string) {
    if (mimeType.includes('pdf')) return '#EF4444'; // Red
    if (mimeType.includes('word')) return '#3B82F6'; // Blue
    return '#6B7280'; // Gray
}

const styles = (Colors: any, Typography: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        height: 56,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.outlineVariant,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
    },
    listContent: {
        padding: Spacing.screenPadding,
        paddingBottom: 40,
    },
    materialCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.outlineVariant,
    },
    fileIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    materialInfo: {
        flex: 1,
    },
    materialTitle: {
        fontSize: 15,
        fontFamily: Typography.family.semiBold,
        color: Colors.onSurface,
        marginBottom: 2,
    },
    materialMeta: {
        fontSize: 12,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteBtn: {
        padding: 8,
    },
    emptyContainer: {
        marginTop: 60,
    },
});
