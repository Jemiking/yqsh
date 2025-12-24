import type { MilestoneTemplate } from '../types';

export const milestoneTemplates: MilestoneTemplate[] = [
  {
    id: 'first_heartbeat',
    title: 'First heartbeat',
    titleZh: '第一次心跳',
    defaultDescription: '听到了宝宝小小的心跳声，像小马在奔跑！',
    icon: 'heart',
    suggestedWeek: 8,
  },
  {
    id: 'first_ultrasound',
    title: 'First ultrasound',
    titleZh: '第一次B超',
    defaultDescription: '在屏幕上看到了小小的身影，太神奇了！',
    icon: 'image',
    suggestedWeek: 12,
  },
  {
    id: 'first_kick',
    title: 'First kick',
    titleZh: '第一次胎动',
    defaultDescription: '感受到宝宝在动了，像蝴蝶在肚子里扑腾。',
    icon: 'footsteps',
    suggestedWeek: 18,
  },
  {
    id: 'gender_reveal',
    title: 'Gender reveal',
    titleZh: '知道宝宝性别',
    defaultDescription: '揭晓了宝宝的性别，全家都很开心！',
    icon: 'gift',
    suggestedWeek: 20,
  },
  {
    id: 'baby_shopping',
    title: 'First baby shopping',
    titleZh: '第一次囤货',
    defaultDescription: '给宝宝买了第一件小衣服/用品。',
    icon: 'cart',
    suggestedWeek: 22,
  },
  {
    id: 'birth_plan',
    title: 'Birth plan ready',
    titleZh: '分娩计划',
    defaultDescription: '和她一起讨论并制定了分娩计划。',
    icon: 'document-text',
    suggestedWeek: 28,
  },
  {
    id: 'hospital_bag',
    title: 'Hospital bag packed',
    titleZh: '待产包准备好了',
    defaultDescription: '待产包终于收拾完了，随时待命！',
    icon: 'briefcase',
    suggestedWeek: 35,
  },
  {
    id: 'due_date',
    title: 'Due date',
    titleZh: '预产期',
    defaultDescription: '倒计时归零，准备迎接宝宝！',
    icon: 'calendar',
    suggestedWeek: 40,
  },
];

export function getTemplateById(id: string): MilestoneTemplate | undefined {
  return milestoneTemplates.find((t) => t.id === id);
}

export function isHighlightTemplate(templateId?: string): boolean {
  const highlights = ['first_heartbeat', 'first_kick', 'gender_reveal', 'due_date'];
  return templateId ? highlights.includes(templateId) : false;
}
