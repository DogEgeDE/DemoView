window.MENU_CONFIG = [
  { id: "courses", label: "课程管理", route: "/courses" },
  { id: "materials", label: "物料管理", route: "/materials" },
  { id: "member-cards", label: "会员卡管理", route: "/member-cards" },
  { id: "care-activities", label: "托管活动", children: [
    { id: "venues", label: "场地管理", route: "/care-activities/venues" },
    { id: "care-activity-management", label: "托管活动管理", route: "/care-activities/management" }
  ] },
  { id: "task-marketplace", label: "任务广场", route: "/task-marketplace" },
  { id: "teaching-schedule", label: "教学课表", route: "/teaching-schedule" },
  { id: "teachers", label: "教师管理", route: "/teachers" },
  { id: "evaluation-tasks", label: "评价任务", route: "/evaluation-tasks" },
  { id: "customer-service", label: "客服管理", route: "/customer-service" },
  { id: "order-management", label: "订单管理", children: [
    { id: "order-care-activities", label: "托管活动", route: "/order-management/care-activities" }
  ] },
  { id: "order-center", label: "订单中心", children: [
    { id: "afterschool-orders", label: "订单管理（课后）", route: "/order-center/afterschool-orders" },
    { id: "registrations", label: "报名管理", route: "/order-center/registrations" }
  ] },
  { id: "finance", label: "财务管理", children: [
    { id: "class-hours", label: "课时总表", route: "/finance/class-hours" },
    { id: "afterschool-bills", label: "课后账单汇总", route: "/finance/afterschool-bills" },
    { id: "attendance-records", label: "上课记录", route: "/finance/attendance-records" },
    { id: "class-hour-deduction", label: "消课管理", route: "/finance/class-hour-deduction" },
    { id: "settlement-bills", label: "结算账单", route: "/finance/settlement-bills" },
    { id: "management-fee-bills", label: "管理费账单", route: "/finance/management-fee-bills" }
  ] },
  { id: "research-reports", label: "报表管理（研）", children: [
    { id: "care-attendance-report", label: "托管点名报表", route: "/research-reports/care-attendance" }
  ] },
  { id: "care-settlement", label: "托管活动结算", route: "/care-settlement" },
  { id: "reports", label: "报表管理", children: [
    { id: "card-attendance-report", label: "销卡点名报表", route: "/reports/card-attendance" },
    { id: "student-class-hours-report", label: "学生课时报表", route: "/reports/student-class-hours" },
    { id: "student-course-reviews", label: "学生评课程", route: "/reports/student-course-reviews" },
    { id: "student-organization-reviews", label: "学生评机构", route: "/reports/student-organization-reviews" },
    { id: "course-evaluation-report", label: "课程考评报表", route: "/reports/course-evaluation" },
    { id: "member-card-report", label: "会员卡报表", route: "/reports/member-cards" }
  ] },
  { id: "school-scheduling", label: "学校排课明细", route: "/school-scheduling" },
  { id: "system-settings", label: "系统设置", children: [
    { id: "accounts", label: "账号管理", route: "/system-settings/accounts" },
    { id: "roles", label: "角色管理", route: "/system-settings/roles" },
    { id: "basic-info", label: "基础信息", route: "/system-settings/basic-info" }
  ] },
  { id: "feedback", label: "意见反馈", route: "/feedback" }
];
