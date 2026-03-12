import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

const { width, height } = Dimensions.get('window');

interface VideoIntroProps {
    onFinish: () => void;
}

export default function VideoIntro({ onFinish }: VideoIntroProps) {
    const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        setStatus(status);
        if (status.isLoaded && status.didJustFinish) {
            onFinish();
        }
    };

    return (
        <View style={styles.container}>
            <Video
                source={require('../../assets/video/intro.mp4')}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
            
            <TouchableOpacity 
                style={styles.skipButton} 
                onPress={onFinish}
                activeOpacity={0.7}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        width: width,
        height: height,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: Spacing.screenPadding,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    skipText: {
        ...Typography.label,
        color: Colors.white,
        fontFamily: 'DMSans_700Bold',
    },
});
