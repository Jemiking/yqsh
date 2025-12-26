import dayjs from 'dayjs';

const PREGNANCY_WEEKS = 40;
const DAYS_PER_WEEK = 7;
const TOTAL_PREGNANCY_DAYS = PREGNANCY_WEEKS * DAYS_PER_WEEK;

export interface PregnancyProgress {
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  totalDays: number;
  daysUntilDue: number;
  progressPercent: number;
  gestationalDays: string;
}

export function calculatePregnancyProgress(dueDate: string): PregnancyProgress {
  const due = dayjs(dueDate);
  const today = dayjs().startOf('day');
  const daysUntilDue = due.diff(today, 'day');
  const totalDays = TOTAL_PREGNANCY_DAYS - daysUntilDue;
  const currentWeek = Math.floor(totalDays / DAYS_PER_WEEK) + 1;
  const currentDay = (totalDays % DAYS_PER_WEEK) + 1;
  const clampedWeek = Math.max(1, Math.min(currentWeek, PREGNANCY_WEEKS));
  const trimester = getTrimester(clampedWeek);
  const progressPercent = Math.min(100, Math.max(0, (totalDays / TOTAL_PREGNANCY_DAYS) * 100));
  const startDay = (clampedWeek - 1) * DAYS_PER_WEEK + 1;
  const endDay = clampedWeek * DAYS_PER_WEEK;

  return {
    currentWeek: clampedWeek,
    currentDay: Math.max(1, Math.min(currentDay, DAYS_PER_WEEK)),
    trimester,
    totalDays: Math.max(0, totalDays),
    daysUntilDue: Math.max(0, daysUntilDue),
    progressPercent: Math.round(progressPercent * 10) / 10,
    gestationalDays: `${startDay}-${endDay}`,
  };
}

export function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

export function getTrimesterName(trimester: 1 | 2 | 3): string {
  const names: Record<number, string> = {
    1: '孕早期',
    2: '孕中期',
    3: '孕晚期',
  };
  return names[trimester];
}

const BABY_SIZE_COMPARISONS: Record<number, { size: string; weight: string; comparison: string; emoji: string }> = {
  1: { size: '0.1mm', weight: '-', comparison: '一粒尘埃', emoji: '🌫️' },
  2: { size: '0.2mm', weight: '-', comparison: '一粒罂粟籽', emoji: '🌰' },
  3: { size: '0.3mm', weight: '-', comparison: '一粒芝麻', emoji: '🫘' },
  4: { size: '1mm', weight: '-', comparison: '一粒罂粟籽', emoji: '🌰' },
  5: { size: '2mm', weight: '-', comparison: '一粒芝麻', emoji: '🫘' },
  6: { size: '6mm', weight: '1g', comparison: '一颗扁豆', emoji: '🫛' },
  7: { size: '1cm', weight: '1g', comparison: '一颗蓝莓', emoji: '🫐' },
  8: { size: '1.6cm', weight: '1g', comparison: '一颗覆盆子', emoji: '🍇' },
  9: { size: '2.3cm', weight: '2g', comparison: '一颗樱桃', emoji: '🍒' },
  10: { size: '3.1cm', weight: '4g', comparison: '一颗草莓', emoji: '🍓' },
  11: { size: '4.1cm', weight: '7g', comparison: '一颗无花果', emoji: '🫐' },
  12: { size: '5.4cm', weight: '14g', comparison: '一颗青柠', emoji: '🍋' },
  13: { size: '7.4cm', weight: '23g', comparison: '一个柠檬', emoji: '🍋' },
  14: { size: '8.7cm', weight: '43g', comparison: '一个桃子', emoji: '🍑' },
  15: { size: '10.1cm', weight: '70g', comparison: '一个苹果', emoji: '🍎' },
  16: { size: '11.6cm', weight: '100g', comparison: '一个牛油果', emoji: '🥑' },
  17: { size: '13cm', weight: '140g', comparison: '一个石榴', emoji: '🍎' },
  18: { size: '14.2cm', weight: '190g', comparison: '一个甜椒', emoji: '🫑' },
  19: { size: '15.3cm', weight: '240g', comparison: '一个芒果', emoji: '🥭' },
  20: { size: '16.4cm', weight: '300g', comparison: '一根香蕉', emoji: '🍌' },
  21: { size: '26.7cm', weight: '360g', comparison: '一根胡萝卜', emoji: '🥕' },
  22: { size: '27.8cm', weight: '430g', comparison: '一个木瓜', emoji: '🍈' },
  23: { size: '28.9cm', weight: '500g', comparison: '一个大芒果', emoji: '🥭' },
  24: { size: '30cm', weight: '600g', comparison: '一根玉米棒', emoji: '🌽' },
  25: { size: '34.6cm', weight: '660g', comparison: '一个大头菜', emoji: '🥔' },
  26: { size: '35.6cm', weight: '760g', comparison: '一颗生菜', emoji: '🥬' },
  27: { size: '36.6cm', weight: '875g', comparison: '一颗花椰菜', emoji: '🥦' },
  28: { size: '37.6cm', weight: '1kg', comparison: '一颗茄子', emoji: '🍆' },
  29: { size: '38.6cm', weight: '1.15kg', comparison: '一颗南瓜', emoji: '🎃' },
  30: { size: '39.9cm', weight: '1.3kg', comparison: '一颗大白菜', emoji: '🥬' },
  31: { size: '41.1cm', weight: '1.5kg', comparison: '一个椰子', emoji: '🥥' },
  32: { size: '42.4cm', weight: '1.7kg', comparison: '一颗哈密瓜', emoji: '🍈' },
  33: { size: '43.7cm', weight: '1.9kg', comparison: '一个菠萝', emoji: '🍍' },
  34: { size: '45cm', weight: '2.1kg', comparison: '一个哈密瓜', emoji: '🍈' },
  35: { size: '46.2cm', weight: '2.4kg', comparison: '一个蜜瓜', emoji: '🍈' },
  36: { size: '47.4cm', weight: '2.6kg', comparison: '一颗罗马生菜', emoji: '🥬' },
  37: { size: '48.6cm', weight: '2.9kg', comparison: '一颗瑞士甜菜', emoji: '🥬' },
  38: { size: '49.8cm', weight: '3kg', comparison: '一颗韭葱', emoji: '🧅' },
  39: { size: '50.7cm', weight: '3.3kg', comparison: '一个小西瓜', emoji: '🍉' },
  40: { size: '51.2cm', weight: '3.5kg', comparison: '一个小南瓜', emoji: '🎃' },
};

export function getBabySizeComparison(week: number): { size: string; weight: string; comparison: string; emoji: string } {
  const clampedWeek = Math.max(1, Math.min(week, PREGNANCY_WEEKS));
  return BABY_SIZE_COMPARISONS[clampedWeek] || BABY_SIZE_COMPARISONS[20];
}

export function formatWeekDisplay(week: number, day: number): string {
  return `第${week}周第${day}天`;
}

export function calculateDueDateFromLastPeriod(lastPeriodDate: string): string {
  return dayjs(lastPeriodDate).add(TOTAL_PREGNANCY_DAYS, 'day').format('YYYY-MM-DD');
}

export function isValidDueDate(dueDate: string): boolean {
  const due = dayjs(dueDate);
  const today = dayjs().startOf('day');
  const minDate = today.subtract(2, 'week');
  const maxDate = today.add(TOTAL_PREGNANCY_DAYS, 'day');
  return due.isAfter(minDate) && due.isBefore(maxDate);
}
