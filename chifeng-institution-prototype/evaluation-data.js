window.EVALUATION_TASKS = [
  {
    id: "student-2026-h1",
    name: "2026年上半年学生综合素质评价",
    status: "已结束",
    audience: "学生",
    evaluator: "机构教师",
    start: "2026-07-01 08:00",
    end: "2026-08-31 20:00",
    scoring: "打分（0–100分）",
    anonymous: true,
    created: "2026-06-10",
    description: "对学生在上半年的综合素质表现进行全面评价。",
    indicators: [
      { name: "学习态度", weight: 25, description: "学习积极性和主动性" },
      { name: "团队协作", weight: 25, description: "团队合作和沟通能力" },
      { name: "创新能力", weight: 25, description: "创新思维和实践能力" },
      { name: "行为规范", weight: 25, description: "遵守规则和行为表现" }
    ],
    records: [
      { id: "s001-c1", studentId: "s001", name: "李同学", school: "红山实验小学", className: "四年级（2）班", course: "趣味编程", evaluations: [
        { teacher: "王老师", submitted: "2026-08-12 10:25", scores: [92, 88, 90, 94], comment: "课堂参与积极，善于与同伴合作。" },
        { teacher: "陈老师", submitted: "2026-08-16 15:40", scores: [90, 91, 87, 92], comment: "能够主动完成实践任务，表达清晰。" }
      ] },
      { id: "s001-c2", studentId: "s001", name: "李同学", school: "红山实验小学", className: "四年级（2）班", course: "篮球社团", evaluations: [
        { teacher: "王老师", submitted: "2026-08-18 09:05", scores: [85, 89, 82, 90], comment: "积极参与团队训练，建议加强基础动作练习。" }
      ] },
      { id: "s002-c1", studentId: "s002", name: "张同学", school: "红山实验小学", className: "四年级（2）班", course: "科学实验", evaluations: [
        { teacher: "刘老师", submitted: "2026-08-13 09:18", scores: [85, 89, 82, 90], comment: "乐于参与小组活动，建议进一步提升主动表达。" }
      ] },
      { id: "s003-c1", studentId: "s003", name: "赵同学", school: "红山二小", className: "五年级（1）班", course: "创意美术", evaluations: [
        { teacher: "刘老师", submitted: "2026-08-14 14:05", scores: [93, 95, 91, 94], comment: "在团队活动中表现出良好的沟通与组织能力。" },
        { teacher: "孙老师", submitted: "2026-08-20 11:32", scores: [88, 92, 94, 90], comment: "有创新意识，能够提出有建设性的想法。" },
        { teacher: "陈老师", submitted: "2026-08-22 16:10", scores: [91, 90, 92, 93], comment: "遵守活动规则，实践任务完成质量较好。" }
      ] },
      { id: "s004-c1", studentId: "s004", name: "周同学", school: "红山二小", className: "五年级（3）班", course: "趣味编程", evaluations: [] }
    ]
  },
  {
    id: "student-2026-autumn",
    name: "2026年秋季学生实践活动表现评价",
    status: "进行中",
    audience: "学生",
    evaluator: "机构教师",
    start: "2026-11-01 09:00",
    end: "2026-11-30 18:00",
    scoring: "星评（1–5星）",
    anonymous: false,
    created: "2026-10-25",
    description: "评价学生在秋季课后服务实践活动中的参与、协作和安全表现。",
    indicators: [
      { name: "参与积极性", weight: 40, description: "参与活动的主动程度" },
      { name: "协作表现", weight: 30, description: "小组协作与沟通" },
      { name: "安全规范", weight: 30, description: "遵守活动安全要求" }
    ],
    records: [
      { id: "s001-c1", studentId: "s001", name: "李同学", school: "红山实验小学", className: "四年级（2）班", course: "趣味编程", evaluations: [
        { teacher: "王老师", submitted: "2026-11-15 10:25", scores: [5, 4, 5], comment: "积极参与实践活动，能够遵守安全规范。" },
        { teacher: "陈老师", submitted: "2026-11-18 15:40", scores: [4, 5, 5], comment: "小组协作表现突出，乐于帮助同伴。" }
      ] },
      { id: "s001-c2", studentId: "s001", name: "李同学", school: "红山实验小学", className: "四年级（2）班", course: "篮球社团", evaluations: [] },
      { id: "s002-c1", studentId: "s002", name: "张同学", school: "红山实验小学", className: "四年级（2）班", course: "科学实验", evaluations: [] },
      { id: "s005-c1", studentId: "s005", name: "吴同学", school: "红山区第三小学", className: "三年级（1）班", course: "创意美术", evaluations: [
        { teacher: "刘老师", submitted: "2026-11-17 09:18", scores: [4, 4, 5], comment: "能认真完成实践任务，注意安全。" }
      ] }
    ]
  },
  {
    id: "student-2026-winter",
    name: "2026年冬季学生成长表现评价",
    status: "未开始",
    audience: "学生",
    evaluator: "机构教师",
    start: "2026-12-01 09:00",
    end: "2026-12-31 18:00",
    scoring: "打分（0–100分）",
    anonymous: false,
    created: "2026-11-10",
    description: "关注学生在冬季活动中的学习态度、合作能力与行为表现。",
    indicators: [
      { name: "学习态度", weight: 40, description: "学习的主动性" },
      { name: "团队合作", weight: 30, description: "协作交流表现" },
      { name: "行为规范", weight: 30, description: "遵守活动规则" }
    ],
    records: []
  }
];
