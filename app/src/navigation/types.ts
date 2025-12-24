import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Onboarding: undefined;
  Emergency: { symptomId?: string };
  FoodDetail: { foodId: string };
  WeekDetail: { week: number };
  SymptomChecker: { symptomId?: string };
  Settings: undefined;
  ContractionTimer: undefined;
  KickCounter: undefined;
  HospitalBag: undefined;
  EmergencyContacts: undefined;
  Milestone: undefined;
  AddMilestone: { id?: number } | undefined;
  Achievements: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Timeline: undefined;
  Tools: undefined;
  Assistant: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
