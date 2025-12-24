import { create } from 'zustand';

export type TimelineViewMode = 'focus' | 'journey' | 'grid';

interface TimelineState {
  viewMode: TimelineViewMode;
  focusedWeek: number;
  expandedWeek: number | null;
  lastViewedWeekByView: Partial<Record<TimelineViewMode, number>>;

  setViewMode: (mode: TimelineViewMode, targetWeek?: number) => void;
  setFocusedWeek: (week: number) => void;
  setExpandedWeek: (week: number | null) => void;
  rememberViewAnchor: (mode: TimelineViewMode, week: number) => void;
}

const clampWeek = (week: number) => Math.max(1, Math.min(40, week));

export const useTimelineStore = create<TimelineState>((set, get) => ({
  viewMode: 'focus',
  focusedWeek: 1,
  expandedWeek: null,
  lastViewedWeekByView: {},

  setViewMode: (mode, targetWeek) => {
    const state = get();
    const resolvedWeek = clampWeek(
      targetWeek ?? state.lastViewedWeekByView[mode] ?? state.focusedWeek
    );
    set({
      viewMode: mode,
      focusedWeek: resolvedWeek,
      lastViewedWeekByView: {
        ...state.lastViewedWeekByView,
        [mode]: resolvedWeek,
      },
    });
  },

  setFocusedWeek: (week) => {
    const clamped = clampWeek(week);
    const state = get();
    set({
      focusedWeek: clamped,
      lastViewedWeekByView: {
        ...state.lastViewedWeekByView,
        [state.viewMode]: clamped,
      },
    });
  },

  setExpandedWeek: (week) => set({ expandedWeek: week }),

  rememberViewAnchor: (mode, week) =>
    set({
      lastViewedWeekByView: {
        ...get().lastViewedWeekByView,
        [mode]: clampWeek(week),
      },
    }),
}));
