import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import type { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import {
  OnboardingScreen,
  ContractionTimerScreen,
  KickCounterScreen,
  HospitalBagScreen,
  EmergencyContactsScreen,
  MilestoneScreen,
  AddMilestoneScreen,
  AchievementsScreen,
  AIConfigScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isFirstLaunch: boolean;
}

export function RootNavigator({ isFirstLaunch }: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isFirstLaunch ? 'Onboarding' : 'Main'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Settings" component={AIConfigScreen} />
        <Stack.Screen name="ContractionTimer" component={ContractionTimerScreen} />
        <Stack.Screen name="KickCounter" component={KickCounterScreen} />
        <Stack.Screen name="HospitalBag" component={HospitalBagScreen} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
        <Stack.Screen name="Milestone" component={MilestoneScreen} />
        <Stack.Screen
          name="AddMilestone"
          component={AddMilestoneScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
