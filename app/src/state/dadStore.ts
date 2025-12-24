import { create } from 'zustand';
import type { DadGrowth, Achievement, XPEventType } from '../types';

interface DadState {
  growth: DadGrowth;
  achievements: Achievement[];
  recentXpGain: number | null;

  setGrowth: (growth: DadGrowth) => void;
  addXP: (amount: number) => void;
  setAchievements: (achievements: Achievement[]) => void;
  unlockAchievement: (id: string) => void;
  showXpGain: (amount: number) => void;
  clearXpGain: () => void;
}

const LEVELS = [
  { level: 1, title: '预备队员', xp: 0 },
  { level: 2, title: '后勤保障', xp: 100 },
  { level: 3, title: '护航专员', xp: 300 },
  { level: 4, title: '核心指挥', xp: 600 },
  { level: 5, title: '超级奶爸', xp: 1000 },
];

function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      const nextLevel = LEVELS[i + 1];
      return {
        level: LEVELS[i].level,
        title: LEVELS[i].title,
        nextLevelXp: nextLevel?.xp ?? 99999,
      };
    }
  }
  return { level: 1, title: '预备队员', nextLevelXp: 100 };
}

const INITIAL_GROWTH: DadGrowth = {
  xp: 0,
  level: 1,
  title: '预备队员',
  nextLevelXp: 100,
};

export const useDadStore = create<DadState>((set, get) => ({
  growth: INITIAL_GROWTH,
  achievements: [],
  recentXpGain: null,

  setGrowth: (growth) => set({ growth }),

  addXP: (amount) => {
    const { growth } = get();
    const newXp = growth.xp + amount;
    const { level, title, nextLevelXp } = calculateLevel(newXp);

    set({
      growth: { xp: newXp, level, title, nextLevelXp },
      recentXpGain: amount,
    });

    setTimeout(() => {
      set({ recentXpGain: null });
    }, 2500);
  },

  setAchievements: (achievements) => set({ achievements }),

  unlockAchievement: (id) => {
    const { achievements } = get();
    set({
      achievements: achievements.map((a) =>
        a.id === id ? { ...a, completed: true, unlockedAt: new Date().toISOString() } : a
      ),
    });
  },

  showXpGain: (amount) => set({ recentXpGain: amount }),

  clearXpGain: () => set({ recentXpGain: null }),
}));

export { LEVELS };
