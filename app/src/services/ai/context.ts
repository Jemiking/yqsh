import type { PregnancyContext } from './types';
import type { FoodItem, SymptomDecisionTree, EmotionalScenario, EmergencyProcedure } from '../../types';
import { getBabySizeComparison, getTrimesterName } from '../../lib/pregnancy';

export interface KbPayload {
  foods?: FoodItem[];
  symptoms?: SymptomDecisionTree[];
  emotional?: EmotionalScenario[];
  emergency?: EmergencyProcedure;
}

export function buildSystemPrompt(context: PregnancyContext): string {
  const babySize = getBabySizeComparison(context.currentWeek);
  const trimesterName = getTrimesterName(context.trimester);

  const warningSignsSection = context.warningSignsThisWeek?.length
    ? `本周需要注意的危险信号：
${context.warningSignsThisWeek.map((s) => `- ${s}`).join('\n')}`
    : '';

  return `你是"伴生"，一个专为准爸爸设计的孕期助手。你的角色是可靠的大哥——简洁、专业、给出可行动的建议。

## 当前状态
- 孕周：第${context.currentWeek}周第${context.currentDay}天（${trimesterName}）
- 距离预产期：${context.daysUntilDue}天
- 宝宝大小：${babySize.size}（${babySize.comparison}，约${babySize.weight}）

${warningSignsSection}

## 回复原则
1. 简洁直接，不说废话。每句话都要有价值。
2. 给出具体可行动的建议，告诉他"现在就可以做什么"。
3. 涉及危险信号时，立即给出行动指令，不要犹豫。
4. 语气温暖但不啰嗦，像一个靠谱的老大哥。
5. 用"你"称呼用户，用"她"称呼他的伴侣。
6. 不要使用emoji，保持专业。

## 回复格式
- 如果是简单问题，直接回答。
- 如果涉及症状，先判断紧急程度，再给建议。
- 如果需要多步骤，用数字列表。
- 重要信息可以用"⚠️"或"✅"标注。`;
}

export function buildContextSummary(context: PregnancyContext): string {
  const babySize = getBabySizeComparison(context.currentWeek);
  return `第${context.currentWeek}周第${context.currentDay}天 • ${babySize.comparison}`;
}

export function injectContext(
  userMessage: string,
  context: PregnancyContext
): { systemPrompt: string; contextSummary: string } {
  return {
    systemPrompt: buildSystemPrompt(context),
    contextSummary: buildContextSummary(context),
  };
}

function formatFood(item: FoodItem): string {
  const safety = item.safetyLevel;
  let line = `- 【${item.name}】安全等级：${safety}`;
  if (item.reason) line += `｜${item.reason}`;
  if (item.dadTip) line += `｜爸提示：${item.dadTip}`;
  return line;
}

function formatSymptom(tree: SymptomDecisionTree): string {
  const firstQ = tree.questions?.[0] ?? '';
  const paths = tree.decisionPaths
    .slice(0, 2)
    .map((p) => `${p.condition}→${p.action}(${p.urgency})`)
    .join('；');
  return `- 【${tree.symptomName}】首问：${firstQ}｜决策：${paths}`;
}

function formatEmotional(scenario: EmotionalScenario): string {
  let line = `- 【${scenario.scenarioName}】正确回应：${scenario.rightResponse}`;
  if (scenario.followUpActions) line += `｜后续：${scenario.followUpActions}`;
  return line;
}

function formatEmergency(emergency: EmergencyProcedure): string {
  const signs = (emergency.recognitionSigns ?? []).slice(0, 3).join('；');
  const actions = (emergency.immediateActions ?? []).slice(0, 4).join('；');
  return `⚠️【紧急：${emergency.emergencyName}】识别：${signs}｜立即执行：${actions}`;
}

export function buildKbAugmentedPrompt(context: PregnancyContext, kbPayload: KbPayload): string {
  const base = buildSystemPrompt(context);

  const hasKb =
    kbPayload.emergency ||
    kbPayload.foods?.length ||
    kbPayload.symptoms?.length ||
    kbPayload.emotional?.length;

  if (!hasKb) return base;

  const sections: string[] = [];

  if (kbPayload.emergency) {
    sections.push(formatEmergency(kbPayload.emergency));
  }
  if (kbPayload.foods?.length) {
    kbPayload.foods.slice(0, 5).forEach((f) => sections.push(formatFood(f)));
  }
  if (kbPayload.symptoms?.length) {
    kbPayload.symptoms.slice(0, 3).forEach((s) => sections.push(formatSymptom(s)));
  }
  if (kbPayload.emotional?.length) {
    kbPayload.emotional.slice(0, 3).forEach((e) => sections.push(formatEmotional(e)));
  }

  const kbSection = `

## 知识库参考数据
${sections.join('\n')}

使用说明：
- 仅基于上述事实回答，勿编造。
- 若包含紧急信息，先给行动指令，再解释。
- 无匹配项时按常规知识简洁回答。`;

  return base + kbSection;
}
