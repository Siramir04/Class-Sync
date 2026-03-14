import React from 'react';
import { Tabs } from 'expo-router';
import TabBar from '../../components/layout/TabBar';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Schedule',
                }}
            />
            <Tabs.Screen
                name="spaces"
                options={{
                    title: 'Spaces',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                }}
            />
        </Tabs>
    );
}
