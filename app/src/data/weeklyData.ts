/**
 * 40周孕期静态数据
 * 数据来源: doc/开发进度/20251219-40周数据完整版.md
 */

export interface WeekData {
  week: number;
  trimester: 1 | 2 | 3;
  baby: {
    sizeCm: number;
    weightG: number;
    comparison: string;
    keyDevelopment: string;
  };
  momSymptoms: Array<{
    symptom: string;
    dadAction: string;
  }>;
  warningSigns: Array<{
    symptom: string;
    urgency: 'EMERGENCY' | 'HIGH' | 'MEDIUM';
    action: string;
  }>;
  dadDaily: {
    morning: string;
    evening: string;
  };
  weekTasks: string[];
  tip: string;
}

export const WEEKLY_DATA: WeekData[] = [
  {
    week: 1,
    trimester: 1,
    baby: { sizeCm: 0, weightG: 0, comparison: '还只是个想法', keyDevelopment: '末次月经开始，尚未受孕' },
    momSymptoms: [{ symptom: '月经期', dadAction: '记录月经开始日期，这将用于计算预产期' }],
    warningSigns: [],
    dadDaily: { morning: '如果在备孕，确保她在服用叶酸', evening: '营造轻松氛围，减少压力' },
    weekTasks: ['记录末次月经日期', '确认叶酸补充'],
    tip: '从今天开始，叶酸就是最重要的营养素',
  },
  {
    week: 2,
    trimester: 1,
    baby: { sizeCm: 0, weightG: 0, comparison: '一颗等待成熟的卵子', keyDevelopment: '卵子在卵巢中成熟，子宫内膜增厚' },
    momSymptoms: [{ symptom: '排卵期症状', dadAction: '如果在备孕，这是最佳时机' }],
    warningSigns: [],
    dadDaily: { morning: '准备健康早餐', evening: '安排轻松的约会时间' },
    weekTasks: ['注意排卵期', '继续补充叶酸'],
    tip: '放松比焦虑更有助于受孕',
  },
  {
    week: 3,
    trimester: 1,
    baby: { sizeCm: 0.01, weightG: 0.001, comparison: '一个微小的细胞', keyDevelopment: '受精卵形成，开始细胞分裂' },
    momSymptoms: [{ symptom: '可能没有任何感觉', dadAction: '保持正常生活，避免剧烈活动和饮酒' }],
    warningSigns: [{ symptom: '剧烈腹痛', urgency: 'HIGH', action: '如有剧烈疼痛需就医' }],
    dadDaily: { morning: '准备健康早餐', evening: '陪她散步放松' },
    weekTasks: ['继续叶酸', '避免烟酒和有害物质'],
    tip: '此刻可能正在发生奇迹，但你们还不知道',
  },
  {
    week: 4,
    trimester: 1,
    baby: { sizeCm: 0.1, weightG: 0.01, comparison: '一颗芝麻', keyDevelopment: '囊胚着床子宫内膜，胚胎开始分化' },
    momSymptoms: [
      { symptom: '着床出血', dadAction: '观察量和持续时间，必要时咨询医生' },
      { symptom: '轻微腹痛/坠胀', dadAction: '让她多休息，不要搬重物' },
    ],
    warningSigns: [{ symptom: '大量出血伴剧痛', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备清淡早餐+温水', evening: '减少剧烈活动，保持轻松' },
    weekTasks: ['继续叶酸', '购买验孕棒备用'],
    tip: '着床期要格外温柔，避免剧烈运动',
  },
  {
    week: 5,
    trimester: 1,
    baby: { sizeCm: 0.25, weightG: 0.05, comparison: '一颗小米粒', keyDevelopment: '神经管即将闭合，心脏原型开始形成' },
    momSymptoms: [
      { symptom: '月经推迟/验孕阳性', dadAction: '一起面对这个消息，给她一个拥抱' },
      { symptom: '恶心/食欲改变', dadAction: '少量多餐，避免油腻味道' },
    ],
    warningSigns: [{ symptom: '大量出血伴腹痛', urgency: 'EMERGENCY', action: '立即就医检查' }],
    dadDaily: { morning: '准备小零食，提醒吃叶酸', evening: '减少刺激气味，帮她早点休息' },
    weekTasks: ['预约首次产检（6-8周内）', '了解产检医院信息'],
    tip: '验孕阳性的那一刻，你就是爸爸了',
  },
  {
    week: 6,
    trimester: 1,
    baby: { sizeCm: 0.6, weightG: 1, comparison: '一颗扁豆', keyDevelopment: '心管开始跳动，神经管闭合，面部轮廓出现' },
    momSymptoms: [
      { symptom: '孕吐/恶心', dadAction: '准备苏打饼干放床头，避免油烟味' },
      { symptom: '极度疲劳', dadAction: '让她多休息，主动承担家务' },
    ],
    warningSigns: [
      { symptom: '阴道出血（鲜红色）', urgency: 'EMERGENCY', action: '立即去医院妇产科急诊' },
      { symptom: '剧烈单侧下腹痛+头晕', urgency: 'EMERGENCY', action: '立即拨打120' },
    ],
    dadDaily: { morning: '准备苏打饼干和温水放床头', evening: '提前准备好第二天的简单早餐' },
    weekTasks: ['预约第一次产检', '确认她每天在吃叶酸'],
    tip: '这周你能做的最重要的事：什么都别说，就陪着她',
  },
  {
    week: 7,
    trimester: 1,
    baby: { sizeCm: 1.0, weightG: 0.1, comparison: '一颗蓝莓', keyDevelopment: '心跳清晰可检测，大脑快速分化' },
    momSymptoms: [
      { symptom: '孕吐/呕吐', dadAction: '少量多餐，避免强烈气味' },
      { symptom: '极度疲劳/嗜睡', dadAction: '让她多休息，不要安排社交' },
    ],
    warningSigns: [{ symptom: '大量出血/剧痛', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备温水+清淡早餐，提醒叶酸', evening: '减少刺激气味，帮她早睡' },
    weekTasks: ['完成首次产检', '准备产检预约单/建档材料'],
    tip: '看到第一次胎心，是最好的安心剂',
  },
  {
    week: 8,
    trimester: 1,
    baby: { sizeCm: 1.6, weightG: 0.3, comparison: '一颗覆盆子', keyDevelopment: '四肢分化，手指脚趾开始形成' },
    momSymptoms: [
      { symptom: '孕吐/呕吐', dadAction: '准备清淡食物，保持空气流通' },
      { symptom: '情绪波动', dadAction: '耐心倾听，不要讲道理' },
    ],
    warningSigns: [{ symptom: '大量出血伴剧痛', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备小零食，通风', evening: '早点休息，减少屏幕时间' },
    weekTasks: ['确认叶酸继续服用'],
    tip: '她越难受，你越耐心，这是此阶段最好的支持',
  },
  {
    week: 9,
    trimester: 1,
    baby: { sizeCm: 2.3, weightG: 2.0, comparison: '一颗樱桃', keyDevelopment: '心脏四腔形成，听觉开始发育' },
    momSymptoms: [
      { symptom: '孕吐/呕吐', dadAction: '少量多餐，避免油炸' },
      { symptom: '疲劳', dadAction: '让她多休息' },
    ],
    warningSigns: [{ symptom: '出血或剧烈腹痛', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备清淡早餐+叶酸', evening: '陪她散步聊天' },
    weekTasks: ['关注预约下次产检时间'],
    tip: '按时做产检是最直接的爱护',
  },
  {
    week: 10,
    trimester: 1,
    baby: { sizeCm: 3.5, weightG: 4.0, comparison: '一颗大草莓', keyDevelopment: '胚胎期结束进入胎儿期，指甲芽出现' },
    momSymptoms: [
      { symptom: '孕吐可能开始稳定', dadAction: '继续少量多餐' },
      { symptom: '晕眩/头痛', dadAction: '提醒补水，休息' },
    ],
    warningSigns: [{ symptom: '出血/剧痛', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备温水+小零食', evening: '提前休息，减少屏幕' },
    weekTasks: ['预约12周NT筛查'],
    tip: '提前把NT预约搞定，这是给她的安全感',
  },
  {
    week: 11,
    trimester: 1,
    baby: { sizeCm: 4.5, weightG: 7.0, comparison: '一颗无花果', keyDevelopment: '头部占比缩小，身体比例更协调' },
    momSymptoms: [
      { symptom: '孕吐可能开始缓解', dadAction: '继续清淡饮食' },
      { symptom: '疲劳', dadAction: '让她多休息' },
    ],
    warningSigns: [{ symptom: '出血/剧痛', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备温和早餐+温水', evening: '确认NT检查材料齐全' },
    weekTasks: ['确认NT预约时间、交通及证件'],
    tip: '把NT细节安排好，任何恐慌都能被准备化解',
  },
  {
    week: 12,
    trimester: 1,
    baby: { sizeCm: 6.0, weightG: 14, comparison: '一颗李子', keyDevelopment: '关键器官已形成，神经系统高速发育' },
    momSymptoms: [
      { symptom: '孕吐开始减轻', dadAction: '循序渐进恢复饮食' },
      { symptom: '腹部微微隆起', dadAction: '陪她买孕妇裤，不要评价身材' },
    ],
    warningSigns: [{ symptom: '大量阴道出血+剧烈腹痛', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '观察她的状态', evening: '陪她涂抹妊娠纹霜' },
    weekTasks: ['陪同做NT检查', '商量官宣方式'],
    tip: '这周是里程碑——流产风险大幅下降',
  },
  {
    week: 13,
    trimester: 2,
    baby: { sizeCm: 7.4, weightG: 23, comparison: '一个小桃子', keyDevelopment: '器官形成完毕，胎盘接管激素分泌' },
    momSymptoms: [
      { symptom: '恶心减轻', dadAction: '保持小份清淡零食' },
      { symptom: '轻微疲劳/头痛', dadAction: '督促补水，安静休息' },
    ],
    warningSigns: [{ symptom: '出血或痉挛', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备水+轻食', evening: '短距离散步后早点休息' },
    weekTasks: ['与医生复查NT/早筛结果'],
    tip: '第二孕期开始了——保持稳定，不要让支持松懈',
  },
  {
    week: 14,
    trimester: 2,
    baby: { sizeCm: 8.7, weightG: 43, comparison: '一个柠檬', keyDevelopment: '颈部伸长，早期听觉敏感，胎毛开始生长' },
    momSymptoms: [
      { symptom: '食欲增加', dadAction: '准备均衡零食，避免血糖飙升' },
      { symptom: '圆韧带刺痛', dadAction: '提醒慢动作，热敷' },
    ],
    warningSigns: [{ symptom: '出血或液体泄漏', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备蛋白质+水果零食', evening: '设置加湿器和舒适枕头' },
    weekTasks: ['预约大排畸（18-22周）', '购买孕妇睡眠枕'],
    tip: '用你的声音——宝宝可能开始听到了',
  },
  {
    week: 15,
    trimester: 2,
    baby: { sizeCm: 10.1, weightG: 70, comparison: '一个苹果', keyDevelopment: '中耳骨骼硬化，四肢伸长，味蕾形成' },
    momSymptoms: [
      { symptom: '圆韧带疼痛', dadAction: '提醒慢慢变换姿势，热敷' },
      { symptom: '食欲增大', dadAction: '均衡饮食，避免垃圾食品' },
    ],
    warningSigns: [
      { symptom: '出血/液体泄漏', urgency: 'EMERGENCY', action: '立即就医' },
      { symptom: '剧烈头痛/视力变化', urgency: 'HIGH', action: '紧急就医' },
    ],
    dadDaily: { morning: '准备水+蛋白质零食', evening: '散步并对肚子说话' },
    weekTasks: ['确认大排畸预约'],
    tip: '现在就预约大排畸——名额很快满',
  },
  {
    week: 16,
    trimester: 2,
    baby: { sizeCm: 11.6, weightG: 100, comparison: '一个牛油果', keyDevelopment: '面部表情更丰富，可能开始感受到胎动' },
    momSymptoms: [
      { symptom: '第一次胎动', dadAction: '当她说感觉到了，立刻放下手机去感受' },
      { symptom: '鼻塞/流鼻血', dadAction: '准备湿纸巾' },
    ],
    warningSigns: [{ symptom: '排尿疼痛', urgency: 'HIGH', action: '多喝水，及时就医' }],
    dadDaily: { morning: '提醒吃复合维生素', evening: '对着肚子轻声说话' },
    weekTasks: ['预约唐筛/无创DNA'],
    tip: '胎动是分水岭。如果她今天感受到了，记录下来',
  },
  {
    week: 17,
    trimester: 2,
    baby: { sizeCm: 13.0, weightG: 140, comparison: '一个萝卜', keyDevelopment: '骨骼骨化，听力更敏锐' },
    momSymptoms: [
      { symptom: '早期胎动可能', dadAction: '创造安静时间让她感受' },
      { symptom: '背部/臀部酸痛', dadAction: '使用枕头，休息' },
    ],
    warningSigns: [{ symptom: '出血或液体泄漏', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备水+均衡零食', evening: '帮她按摩背部' },
    weekTasks: ['确认大排畸日期', '熟悉医院路线'],
    tip: '保持晚上安静，让她能感受胎动',
  },
  {
    week: 18,
    trimester: 2,
    baby: { sizeCm: 14.2, weightG: 190, comparison: '一个红薯', keyDevelopment: '大排畸窗口开始，感官完善' },
    momSymptoms: [
      { symptom: '胎动更清晰', dadAction: '和她一起记录规律' },
      { symptom: '腿抽筋', dadAction: '帮她拉伸小腿，温水泡脚' },
    ],
    warningSigns: [{ symptom: '出血/液体泄漏', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '补水+钙/蛋白质零食', evening: '按摩背部/小腿' },
    weekTasks: ['参加大排畸检查', '列出检查时要问的问题'],
    tip: '在大排畸时全神贯注——倾听并记笔记',
  },
  {
    week: 19,
    trimester: 2,
    baby: { sizeCm: 15.3, weightG: 240, comparison: '一个芒果', keyDevelopment: '肾脏产生尿液，动作更强' },
    momSymptoms: [
      { symptom: '更强烈的胎动', dadAction: '分享这一刻，注意变化' },
      { symptom: '胃灼热', dadAction: '少食多餐，睡觉时垫高头部' },
    ],
    warningSigns: [{ symptom: '出血/液体泄漏', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '准备水+均衡零食', evening: '清淡晚餐，垫高床头' },
    weekTasks: ['确保大排畸完成', '与医生复查结果'],
    tip: '重视她对胎动的更新——你的关注带来安心',
  },
  {
    week: 20,
    trimester: 2,
    baby: { sizeCm: 25.6, weightG: 300, comparison: '一根香蕉', keyDevelopment: '吞咽羊水练习消化，生殖器官可辨别' },
    momSymptoms: [
      { symptom: '胃口大增', dadAction: '帮忙准备健康零食' },
      { symptom: '四肢抽筋', dadAction: '睡前帮她按摩小腿，确保补钙' },
    ],
    warningSigns: [{ symptom: '全身瘙痒', urgency: 'HIGH', action: '如果痒在手脚最严重，需就医检查' }],
    dadDaily: { morning: '确认产检材料', evening: '帮她按摩腿部' },
    weekTasks: ['陪同大排畸检查', '开始考虑宝宝名字'],
    tip: '恭喜过半了！大排畸通过是巨大的胜利',
  },
  {
    week: 21,
    trimester: 2,
    baby: { sizeCm: 26.7, weightG: 360, comparison: '一捆胡萝卜', keyDevelopment: '味蕾活跃，踢腿更强' },
    momSymptoms: [
      { symptom: '背部/臀部疼痛', dadAction: '姿势支撑，定时休息' },
      { symptom: '假性宫缩', dadAction: '补水，休息，如果增加要计时' },
    ],
    warningSigns: [{ symptom: '规律疼痛性宫缩', urgency: 'HIGH', action: '联系医生/医院' }],
    dadDaily: { morning: '准备水+蛋白质零食', evening: '调整枕头，轻度拉伸' },
    weekTasks: ['完成或复查大排畸结果'],
    tip: '姿势和枕头是这周最好的工具',
  },
  {
    week: 22,
    trimester: 2,
    baby: { sizeCm: 27.8, weightG: 430, comparison: '一个西葫芦', keyDevelopment: '肺表面活性剂开始产生，对声音反应更强' },
    momSymptoms: [
      { symptom: '背痛/腿抽筋', dadAction: '托腹带，小腿拉伸' },
      { symptom: '轻微水肿', dadAction: '抬高腿部，提醒补水' },
    ],
    warningSigns: [{ symptom: '持续剧烈头痛/视力变化', urgency: 'HIGH', action: '紧急就医' }],
    dadDaily: { morning: '准备水+钙/蛋白质零食', evening: '足部/腿部护理' },
    weekTasks: ['预约孕产课程/医院参观'],
    tip: '每晚抬高她的腿——小习惯能缓解水肿',
  },
  {
    week: 23,
    trimester: 2,
    baby: { sizeCm: 28.9, weightG: 500, comparison: '一个大葡萄柚', keyDevelopment: '听觉对声音敏感，脂肪层开始堆积' },
    momSymptoms: [
      { symptom: '更明显的踢腿', dadAction: '每天安静时间注意规律' },
      { symptom: '轻微水肿/腿抽筋', dadAction: '抬高腿部，拉伸小腿' },
    ],
    warningSigns: [{ symptom: '胎动明显减少', urgency: 'HIGH', action: '联系医生' }],
    dadDaily: { morning: '补水+均衡零食', evening: '对宝宝说话/唱歌' },
    weekTasks: ['计划糖耐量测试预约'],
    tip: '开始每晚对宝宝说话的仪式',
  },
  {
    week: 24,
    trimester: 2,
    baby: { sizeCm: 30, weightG: 600, comparison: '一根玉米棒', keyDevelopment: '内耳发育完成能听到外界声音，眉毛睫毛清晰可见' },
    momSymptoms: [
      { symptom: '腰背疼痛', dadAction: '准备热敷袋，睡前帮她热敷腰部' },
      { symptom: '小腿抽筋', dadAction: '睡前帮她用温水泡脚+按摩' },
    ],
    warningSigns: [
      { symptom: '头痛+视力模糊+脸/手突然水肿', urgency: 'EMERGENCY', action: '立即去医院' },
      { symptom: '胎动明显减少', urgency: 'HIGH', action: '先喝冷水、吃点东西、侧卧数胎动，仍少则就医' },
    ],
    dadDaily: { morning: '准备一杯水+小份早餐', evening: '温水泡脚+小腿按摩，对着肚子说话' },
    weekTasks: ['预约或完成糖耐量测试', '购买孕妇枕', '开始每天数胎动'],
    tip: '从这周开始，宝宝能听到你的声音了。每天花5分钟对着肚子说说话',
  },
  {
    week: 25,
    trimester: 2,
    baby: { sizeCm: 34.6, weightG: 660, comparison: '一个花菜', keyDevelopment: '皮下毛细血管形成，手可以握拳' },
    momSymptoms: [
      { symptom: '痔疮/便秘', dadAction: '买高纤维零食和马桶脚凳' },
      { symptom: '不宁腿综合征', dadAction: '睡前帮她按摩小腿' },
    ],
    warningSigns: [{ symptom: '规律性痉挛（每小时>4次）', urgency: 'EMERGENCY', action: '立即联系医生' }],
    dadDaily: { morning: '帮她灌满水杯', evening: '负责开车（她反应变慢）' },
    weekTasks: ['在医院登记分娩', '预约糖耐量测试'],
    tip: '糖耐测试很难受。测完后给她准备高蛋白食物',
  },
  {
    week: 26,
    trimester: 2,
    baby: { sizeCm: 35.6, weightG: 760, comparison: '一把羽衣甘蓝', keyDevelopment: '眼睛睁开，睫毛形成，惊吓反射活跃' },
    momSymptoms: [
      { symptom: '背痛（重心转移）', dadAction: '帮她做骨盆倾斜运动' },
      { symptom: '肋骨疼', dadAction: '理解她的痛苦，这是宝宝在踢肋骨' },
    ],
    warningSigns: [{ symptom: '高烧（>38°C）', urgency: 'HIGH', action: '联系医生' }],
    dadDaily: { morning: '帮她系鞋带', evening: '给肚子放音乐' },
    weekTasks: ['参观医院'],
    tip: '不要摔门。宝宝现在能听到大声响会吓一跳',
  },
  {
    week: 27,
    trimester: 2,
    baby: { sizeCm: 36.6, weightG: 875, comparison: '一个大花菜', keyDevelopment: '脑电波可测量，练习呼吸' },
    momSymptoms: [
      { symptom: '打鼾', dadAction: '戴耳塞。不要叫醒她抱怨' },
      { symptom: '仰卧头晕', dadAction: '确保她侧睡' },
    ],
    warningSigns: [],
    dadDaily: { morning: '观察她的情绪', evening: '调整枕头' },
    weekTasks: ['接种百白破疫苗（爸爸也需要）'],
    tip: '黄金期结束。享受第二孕期的最后一周',
  },
  {
    week: 28,
    trimester: 3,
    baby: { sizeCm: 37.6, weightG: 1000, comparison: '一个大茄子', keyDevelopment: '眼睛睁开能眨眼，可能在做梦' },
    momSymptoms: [
      { symptom: '耻骨疼痛', dadAction: '帮她穿托腹带' },
      { symptom: '气短', dadAction: '放慢走路速度，让她休息' },
    ],
    warningSigns: [{ symptom: '视力模糊+头痛', urgency: 'HIGH', action: '可能妊娠高血压，联系医生' }],
    dadDaily: { morning: '提醒她慢动作', evening: '陪她做呼吸练习' },
    weekTasks: ['开始准备待产包', '每两周一次产检'],
    tip: '第三孕期开始了。从现在起，每次产检都要陪同',
  },
  {
    week: 29,
    trimester: 3,
    baby: { sizeCm: 38.6, weightG: 1150, comparison: '一个南瓜', keyDevelopment: '肌肉和肺部继续发育' },
    momSymptoms: [
      { symptom: '失眠', dadAction: '营造安静环境，热牛奶' },
      { symptom: '烧心', dadAction: '少食多餐，避免辛辣' },
    ],
    warningSigns: [{ symptom: '持续腹痛', urgency: 'HIGH', action: '联系医生' }],
    dadDaily: { morning: '准备清淡早餐', evening: '帮她放松入睡' },
    weekTasks: ['学习新生儿护理基础'],
    tip: '她可能睡不好。你的理解比任何建议都重要',
  },
  {
    week: 30,
    trimester: 3,
    baby: { sizeCm: 39.9, weightG: 1300, comparison: '一颗大白菜', keyDevelopment: '大脑快速发育，能区分光明和黑暗' },
    momSymptoms: [
      { symptom: '呼吸困难', dadAction: '让她坐直或半躺' },
      { symptom: '疲劳', dadAction: '减少外出活动' },
    ],
    warningSigns: [{ symptom: '严重头痛+视力问题', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '帮她穿鞋', evening: '按摩肿胀的脚' },
    weekTasks: ['完成待产包准备'],
    tip: '她的肺被挤压了。让她慢慢来',
  },
  {
    week: 31,
    trimester: 3,
    baby: { sizeCm: 41.1, weightG: 1500, comparison: '一个椰子', keyDevelopment: '五感基本发育完成' },
    momSymptoms: [
      { symptom: '频尿', dadAction: '陪她夜间起夜' },
      { symptom: '腰背痛', dadAction: '热敷，按摩' },
    ],
    warningSigns: [{ symptom: '阴道出血', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '确认产检预约', evening: '帮她泡脚' },
    weekTasks: ['安装婴儿汽车座椅'],
    tip: '汽车座椅现在就装好，临产时你没时间',
  },
  {
    week: 32,
    trimester: 3,
    baby: { sizeCm: 42.4, weightG: 1700, comparison: '一颗哈密瓜', keyDevelopment: '练习呼吸动作，可能已经头朝下' },
    momSymptoms: [
      { symptom: '假性宫缩增多', dadAction: '帮她计时，如果规律要警惕' },
      { symptom: '漏尿', dadAction: '理解她，不要开玩笑' },
    ],
    warningSigns: [{ symptom: '规律宫缩（每10分钟1次）', urgency: 'EMERGENCY', action: '可能早产，立即去医院' }],
    dadDaily: { morning: '检查待产包', evening: '练习去医院的路线' },
    weekTasks: ['熟悉分娩流程', '确认医院电话'],
    tip: '现在开始，随时可能有情况。保持手机畅通',
  },
  {
    week: 33,
    trimester: 3,
    baby: { sizeCm: 43.7, weightG: 1900, comparison: '一个菠萝', keyDevelopment: '免疫系统发育，骨骼继续硬化' },
    momSymptoms: [
      { symptom: '骨盆压力', dadAction: '让她多休息' },
      { symptom: '脚踝水肿', dadAction: '帮她抬高双脚' },
    ],
    warningSigns: [{ symptom: '突然严重水肿', urgency: 'HIGH', action: '可能子痫前期，联系医生' }],
    dadDaily: { morning: '准备轻食', evening: '帮她抬脚放松' },
    weekTasks: ['确认分娩计划细节'],
    tip: '她可能开始焦虑分娩。倾听她的担忧',
  },
  {
    week: 34,
    trimester: 3,
    baby: { sizeCm: 45, weightG: 2100, comparison: '一个哈密瓜', keyDevelopment: '指甲长出来了，肺部几乎成熟' },
    momSymptoms: [
      { symptom: '疲劳加重', dadAction: '承担更多家务' },
      { symptom: '失眠', dadAction: '营造舒适睡眠环境' },
    ],
    warningSigns: [{ symptom: '胎动明显减少', urgency: 'HIGH', action: '立即就医' }],
    dadDaily: { morning: '提醒数胎动', evening: '帮她放松' },
    weekTasks: ['准备新生儿用品'],
    tip: '现在开始，每天数胎动变得更重要',
  },
  {
    week: 35,
    trimester: 3,
    baby: { sizeCm: 46.2, weightG: 2400, comparison: '一个蜜瓜', keyDevelopment: '肾脏发育成熟，大部分器官准备就绪' },
    momSymptoms: [
      { symptom: '骨盆疼痛加重', dadAction: '帮她使用托腹带' },
      { symptom: '便秘', dadAction: '准备高纤维食物' },
    ],
    warningSigns: [{ symptom: '持续腹痛或出血', urgency: 'EMERGENCY', action: '立即就医' }],
    dadDaily: { morning: '检查待产包', evening: '陪她散步' },
    weekTasks: ['确认医院路线和备用路线'],
    tip: '每周产检开始了。每次都要陪同',
  },
  {
    week: 36,
    trimester: 3,
    baby: { sizeCm: 47.4, weightG: 2600, comparison: '一颗罗马生菜', keyDevelopment: '胎位开始固定，脂肪继续堆积' },
    momSymptoms: [
      { symptom: '骨盆压迫感', dadAction: '让她多休息' },
      { symptom: '频繁假性宫缩', dadAction: '帮她区分真假宫缩' },
    ],
    warningSigns: [{ symptom: '破水', urgency: 'EMERGENCY', action: '立即去医院' }],
    dadDaily: { morning: '确认手机充满电', evening: '复习分娩知识' },
    weekTasks: ['确认胎位', '讨论分娩计划'],
    tip: '学会区分假性宫缩和真宫缩',
  },
  {
    week: 37,
    trimester: 3,
    baby: { sizeCm: 48.6, weightG: 2900, comparison: '一颗瑞士甜菜', keyDevelopment: '足月了！随时准备，所有器官功能正常' },
    momSymptoms: [
      { symptom: '骨盆下坠感', dadAction: '宝宝在入盆，让她休息' },
      { symptom: '焦虑', dadAction: '陪伴她，倾听她的担忧' },
    ],
    warningSigns: [{ symptom: '规律宫缩/破水', urgency: 'EMERGENCY', action: '准备去医院' }],
    dadDaily: { morning: '检查待产包', evening: '练习呼吸法' },
    weekTasks: ['随时准备去医院', '确认联系人名单'],
    tip: '足月了！从现在起，随时可能迎接宝宝',
  },
  {
    week: 38,
    trimester: 3,
    baby: { sizeCm: 49.8, weightG: 3000, comparison: '一颗韭葱', keyDevelopment: '握力增加，完全准备好出生' },
    momSymptoms: [
      { symptom: '宫颈可能开始软化', dadAction: '注意见红等信号' },
      { symptom: '假性宫缩频繁', dadAction: '帮她计时' },
    ],
    warningSigns: [{ symptom: '规律宫缩/破水/见红', urgency: 'EMERGENCY', action: '准备去医院' }],
    dadDaily: { morning: '确认待产包在车上', evening: '陪她放松' },
    weekTasks: ['保持手机畅通', '随时待命'],
    tip: '任何时候都可能接到她的电话。保持警觉',
  },
  {
    week: 39,
    trimester: 3,
    baby: { sizeCm: 50.7, weightG: 3300, comparison: '一个小西瓜', keyDevelopment: '所有器官准备就绪，随时可以出生' },
    momSymptoms: [
      { symptom: '强烈的骨盆压力', dadAction: '让她多休息' },
      { symptom: '情绪波动', dadAction: '理解她的紧张' },
    ],
    warningSigns: [{ symptom: '破水/规律宫缩/大量见红', urgency: 'EMERGENCY', action: '立即去医院' }],
    dadDaily: { morning: '确认一切准备就绪', evening: '陪伴她' },
    weekTasks: ['随时准备出发'],
    tip: '她可能很焦虑。你的冷静是她最大的支持',
  },
  {
    week: 40,
    trimester: 3,
    baby: { sizeCm: 51.2, weightG: 3500, comparison: '一个小南瓜', keyDevelopment: '准备来到这个世界' },
    momSymptoms: [
      { symptom: '可能过期待产', dadAction: '遵医嘱，可能需要催产' },
      { symptom: '极度焦虑', dadAction: '陪伴她，告诉她一切都会好' },
    ],
    warningSigns: [{ symptom: '破水/规律宫缩', urgency: 'EMERGENCY', action: '立即去医院' }],
    dadDaily: { morning: '与医生保持联系', evening: '陪伴她等待' },
    weekTasks: ['遵医嘱随访', '准备迎接宝宝'],
    tip: '恭喜你，准爸爸！你即将成为真正的爸爸',
  },
];

export function getWeekData(week: number): WeekData | undefined {
  return WEEKLY_DATA.find(w => w.week === week);
}

export function getWeeksByTrimester(trimester: 1 | 2 | 3): WeekData[] {
  return WEEKLY_DATA.filter(w => w.trimester === trimester);
}
