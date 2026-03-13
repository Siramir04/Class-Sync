import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useAuthStore } from '../store/authStore';
import { updateFCMToken } from '../services/authService';

/**
 * Check if we are running inside Expo Go.
 * Push notifications are NOT supported in Expo Go since SDK 53.
 */
function isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
}

/**
 * Register for push notifications and return the Expo push token.
 * Returns null when running in Expo Go or on a simulator.
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (isExpoGo()) {
        console.log('Push notifications are not supported in Expo Go — skipping.');
        return null;
    }

    if (!Device.isDevice) {
        console.log('Push notifications require a physical device.');
        return null;
    }

    try {
        // Dynamically import expo-notifications only when NOT in Expo Go
        // This avoids the side-effect crash from DevicePushTokenAutoRegistration.fx.js
        const Notifications = await import('expo-notifications');

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permission not granted.');
            return null;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#3B82F6',
            });
        }

        return tokenData.data;
    } catch (error) {
        console.log('Error registering for push notifications:', error);
        return null;
    }
}

/**
 * Hook to handle push notification registration, token saving,
 * and incoming notification listeners.
 * Gracefully no-ops when running in Expo Go.
 */
export function usePushNotifications() {
    const { user } = useAuthStore();
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

    useEffect(() => {
        // Skip entirely in Expo Go — even dynamic import can trigger side effects
        if (isExpoGo()) return;

        let notificationSub: { remove: () => void } | undefined;
        let responseSub: { remove: () => void } | undefined;

        (async () => {
            try {
                const Notifications = await import('expo-notifications');

                // Set default handler
                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: false,
                        shouldShowBanner: true,
                        shouldShowList: true,
                    }),
                });

                // Register and save token
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    setExpoPushToken(token);
                    if (user?.uid) {
                        try {
                            await updateFCMToken(user.uid, token);
                        } catch (err) {
                            console.error('Error saving push token:', err);
                        }
                    }
                }

                // Listener: notification received while app is foregrounded
                notificationSub = Notifications.addNotificationReceivedListener((n) => {
                    console.log('Notification received:', n.request.content.title);
                });

                // Listener: user tapped on a notification
                responseSub = Notifications.addNotificationResponseReceivedListener((r) => {
                    console.log('Notification tapped, data:', r.notification.request.content.data);
                });
            } catch (error) {
                console.log('Push notifications unavailable:', error);
            }
        })();

        return () => {
            notificationSub?.remove();
            responseSub?.remove();
        };
    }, [user?.uid]);

    return { expoPushToken };
}
