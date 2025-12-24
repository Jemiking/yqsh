import { create } from 'zustand';
import dayjs from 'dayjs';
import type { UserProfile, WeekData } from '../types';
import { PREGNANCY } from '../constants';

interface PregnancyState {
  profile: UserProfile | null;
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysUntilDue: number;
  weekData: WeekData | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateDueDate: (dueDate: string) => void;
  calculateCurrentWeek: () => void;
  setWeekData: (data: WeekData) => void;
  clear: () => void;
}

export const usePregnancyStore = create<PregnancyState>((set, get) => ({
  profile: null,
  currentWeek: 0,
  currentDay: 0,
  trimester: 1,
  daysUntilDue: 0,
  weekData: null,

  setProfile: (profile) => {
    set({ profile });
    get().calculateCurrentWeek();
  },

  updateDueDate: (dueDate) => {
    const profile = get().profile;
    if (profile) {
      set({
        profile: { ...profile, dueDate, updatedAt: new Date().toISOString() },
      });
      get().calculateCurrentWeek();
    }
  },

  calculateCurrentWeek: () => {
    const profile = get().profile;
    if (!profile?.dueDate) return;

    const today = dayjs();
    const dueDate = dayjs(profile.dueDate);
    if (!dueDate.isValid()) return;
    const daysUntilDue = dueDate.diff(today, 'day');

    // 计算当前孕周和天数
    const totalDays = PREGNANCY.TOTAL_WEEKS * PREGNANCY.DAYS_PER_WEEK;
    const daysPassed = totalDays - daysUntilDue;
    const currentWeek = Math.floor(daysPassed / PREGNANCY.DAYS_PER_WEEK) + 1;
    const currentDay = (daysPassed % PREGNANCY.DAYS_PER_WEEK) + 1;

    // 计算孕期
    let trimester: 1 | 2 | 3 = 1;
    if (currentWeek > PREGNANCY.SECOND_TRIMESTER_END) {
      trimester = 3;
    } else if (currentWeek > PREGNANCY.FIRST_TRIMESTER_END) {
      trimester = 2;
    }

    set({
      currentWeek: Math.max(1, Math.min(currentWeek, PREGNANCY.TOTAL_WEEKS)),
      currentDay: Math.max(1, Math.min(currentDay, 7)),
      trimester,
      daysUntilDue: Math.max(0, daysUntilDue),
    });
  },

  setWeekData: (data) => set({ weekData: data }),

  clear: () =>
    set({
      profile: null,
      currentWeek: 0,
      currentDay: 0,
      trimester: 1,
      daysUntilDue: 0,
      weekData: null,
    }),
}));
