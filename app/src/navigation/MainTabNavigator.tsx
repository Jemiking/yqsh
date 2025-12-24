import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import type { MainTabParamList } from './types';
import {
  HomeScreen,
  TimelineScreen,
  ToolsScreen,
  AssistantScreen,
  ProfileScreen,
} from '../screens';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, { focused: string; unfocused: string }> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Timeline: { focused: 'calendar', unfocused: 'calendar-outline' },
  Tools: { focused: 'construct', unfocused: 'construct-outline' },
  Assistant: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

const tabLabels: Record<keyof MainTabParamList, string> = {
  Home: '首页',
  Timeline: '时间线',
  Tools: '工具',
  Assistant: '助手',
  Profile: '我的',
};

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = tabIcons[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 4),
          height: 56 + Math.max(insets.bottom - 4, 0),
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
        headerShown: false,
        tabBarLabel: tabLabels[route.name],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
      <Tab.Screen name="Tools" component={ToolsScreen} />
      <Tab.Screen name="Assistant" component={AssistantScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
