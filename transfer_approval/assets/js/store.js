/* 全局原型数据层：localStorage CRUD + 初始演示数据 */

(function () {
  const KEY = "transfer_approval_demo_v1";

  function nowISO() {
    return new Date().toISOString();
  }

  function uuid() {
    // 原型用途：足够唯一即可
    return "TA-" + Math.random().toString(16).slice(2, 10).toUpperCase();
  }

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function loadRaw() {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  function saveRaw(raw) {
    localStorage.setItem(KEY, JSON.stringify(raw));
  }

  function seed() {
    const t = nowISO();
    const base = [
      // 1) 目标=区县，待区县审批（审批中）
      {
        id: "TA-COUNTY-0001",
        applicantName: "平台运营",
        remark: "区县目标示例：需尽快完成资金请款流程。",
        targetBureauType: "county",
        targetBureauName: "驿城区教育局",
        amount: 120000,
        payerAccountLabel: "驿城区教育局监管账户（固定）",
        payeeAccountLabel: "智教创新结算账户（平台方固定收款户）",
        targetAccountNo: "——",
        attachments: {
          countyFiles: [
            { name: "区县资料-申请说明.pdf", type: "pdf" },
            { name: "区县资料-预算表.xlsx", type: "excel" },
          ],
          cityFiles: [{ name: "市局资料-项目批复.docx", type: "word" }],
        },
        countyDecision: "none",
        cityDecision: "none",
        cashierSubmitted: false,
        currentStep: "county_review",
        rejectedBy: null,
        countyRejectReason: "",
        cityRejectReason: "",
        withdrawn: false,
        createdAt: t,
        updatedAt: t,
      },
      // 2) 目标=市局，待市局审批（审批中）
      {
        id: "TA-CITY-0002",
        applicantName: "平台运营",
        remark: "",
        targetBureauType: "city",
        targetBureauName: "驻马店市教育局",
        amount: 56000,
        payerAccountLabel: "驻马店市教育局监管账户（固定）",
        payeeAccountLabel: "智教创新结算账户（平台方固定收款户）",
        targetAccountNo: "——",
        attachments: {
          countyFiles: [],
          cityFiles: [{ name: "市局资料-合同.zip", type: "zip" }],
        },
        countyDecision: "none",
        cityDecision: "none",
        cashierSubmitted: false,
        currentStep: "city_review",
        rejectedBy: null,
        countyRejectReason: "",
        cityRejectReason: "",
        withdrawn: false,
        createdAt: t,
        updatedAt: t,
      },
      // 3) 目标=区县，区县通过后待市局（审批中）
      {
        id: "TA-COUNTY-0003",
        applicantName: "平台运营",
        remark: "区县已通过，等待市局审批。",
        targetBureauType: "county",
        targetBureauName: "遂平县教育局",
        amount: 88000,
        payerAccountLabel: "遂平县教育局监管账户（固定）",
        payeeAccountLabel: "智教创新结算账户（平台方固定收款户）",
        targetAccountNo: "——",
        attachments: {
          countyFiles: [{ name: "区县资料-请款函.pdf", type: "pdf" }],
          cityFiles: [{ name: "市局资料-项目清单.xlsx", type: "excel" }],
        },
        countyDecision: "approved",
        cityDecision: "none",
        cashierSubmitted: false,
        currentStep: "city_review",
        rejectedBy: null,
        countyRejectReason: "",
        cityRejectReason: "",
        withdrawn: false,
        createdAt: t,
        updatedAt: t,
      },
      // 4) 目标=区县，市局驳回（区县通过保留），待运营补充（被驳回）
      {
        id: "TA-COUNTY-0004",
        applicantName: "平台运营",
        remark: "市局驳回示例。",
        targetBureauType: "county",
        targetBureauName: "上蔡县教育局",
        amount: 31000,
        payerAccountLabel: "上蔡县教育局监管账户（固定）",
        payeeAccountLabel: "智教创新结算账户（平台方固定收款户）",
        targetAccountNo: "——",
        attachments: {
          countyFiles: [{ name: "区县资料-附件包.zip", type: "zip" }],
          cityFiles: [{ name: "市局资料-资金用途说明.docx", type: "word" }],
        },
        countyDecision: "approved",
        cityDecision: "rejected",
        cashierSubmitted: false,
        currentStep: "ops_fix",
        rejectedBy: "city",
        countyRejectReason: "",
        cityRejectReason: "资料不完整，请补充资金用途说明与批示文件。",
        withdrawn: false,
        createdAt: t,
        updatedAt: t,
      },
      // 5) 目标=区县，区县驳回，待运营补充（被驳回）
      {
        id: "TA-COUNTY-0005",
        applicantName: "平台运营",
        remark: "区县驳回示例。",
        targetBureauType: "county",
        targetBureauName: "汝南县教育局",
        amount: 45000,
        payerAccountLabel: "汝南县教育局监管账户（固定）",
        payeeAccountLabel: "智教创新结算账户（平台方固定收款户）",
        targetAccountNo: "——",
        attachments: {
          countyFiles: [{ name: "区县资料-说明.pdf", type: "pdf" }],
          cityFiles: [{ name: "市局资料-批示.png", type: "png" }],
        },
        countyDecision: "rejected",
        cityDecision: "none",
        cashierSubmitted: false,
        currentStep: "ops_fix",
        rejectedBy: "county",
        countyRejectReason: "请补充区县侧盖章材料。",
        cityRejectReason: "",
        withdrawn: false,
        createdAt: t,
        updatedAt: t,
      },
      // 6) 已完成
      {
        id: "TA-DONE-0006",
        applicantName: "平台运营",
        remark: "已完成示例。",
        targetBureauType: "city",
        targetBureauName: "驻马店市教育局",
        amount: 99000,
        payerAccountLabel: "驻马店市教育局监管账户（固定）",
        payeeAccountLabel: "智教创新结算账户（平台方固定收款户）",
        targetAccountNo: "——",
        attachments: {
          countyFiles: [],
          cityFiles: [{ name: "市局资料-结算申请.pdf", type: "pdf" }],
        },
        countyDecision: "none",
        cityDecision: "approved",
        cashierSubmitted: true,
        currentStep: "done",
        rejectedBy: null,
        countyRejectReason: "",
        cityRejectReason: "",
        withdrawn: false,
        createdAt: t,
        updatedAt: t,
      },
      // 6.5) 待出纳提交网银（给市局出纳演示操作用）
      {
        id: "TA-CASHIER-0008",
        applicantName: "平台运营",
        remark: "待出纳转账示例。",
        targetBureauType: "county",
        targetBureauName: "遂平县教育局",
        amount: 76000,
        payerAccountLabel: "邮储 · 天中教育监管户",
        payeeAccountLabel: "邮储 · 智教创新结算账户",
        targetAccountNo: "邮储 · 智教创新结算账户",
        attachments: {
          countyFiles: [{ name: "区县资料-请款函.pdf", type: "pdf" }],
          cityFiles: [{ name: "市局资料-项目批复.docx", type: "word" }],
        },
        countyDecision: "approved",
        cityDecision: "approved",
        cashierSubmitted: false,
        currentStep: "cashier_submit",
        rejectedBy: null,
        countyRejectReason: "",
        cityRejectReason: "",
        withdrawn: false,
        createdAt: t,
        updatedAt: t,
      },
      // 7) 已撤回（仅运营可见）
      {
        id: "TA-WD-0007",
        applicantName: "平台运营",
        remark: "撤回示例。",
        targetBureauType: "county",
        targetBureauName: "平舆县教育局",
        amount: 22000,
        payerAccountLabel: "平舆县教育局监管账户（固定）",
        payeeAccountLabel: "智教创新结算账户（平台方固定收款户）",
        targetAccountNo: "——",
        attachments: {
          countyFiles: [{ name: "区县资料-预算.xlsx", type: "excel" }],
          cityFiles: [{ name: "市局资料-批复.pdf", type: "pdf" }],
        },
        countyDecision: "none",
        cityDecision: "none",
        cashierSubmitted: false,
        currentStep: "ops_fix",
        rejectedBy: null,
        countyRejectReason: "",
        cityRejectReason: "",
        withdrawn: true,
        createdAt: t,
        updatedAt: t,
      },
    ];

    saveRaw({ apps: base });
  }

  function ensure() {
    const raw = loadRaw();
    if (!raw || !raw.apps || !Array.isArray(raw.apps)) {
      seed();
      return loadRaw();
    }
    return raw;
  }

  function list() {
    return clone(ensure().apps);
  }

  function get(id) {
    const raw = ensure();
    const found = raw.apps.find((a) => a.id === id);
    return found ? clone(found) : null;
  }

  function upsert(app) {
    const raw = ensure();
    const idx = raw.apps.findIndex((a) => a.id === app.id);
    const next = clone(app);
    next.updatedAt = nowISO();
    if (idx >= 0) raw.apps[idx] = next;
    else raw.apps.unshift(next);
    saveRaw(raw);
    return clone(next);
  }

  function create(payload) {
    const t = nowISO();
    const app = {
      id: uuid(),
      applicantName: payload.applicantName || "平台运营",
      remark: payload.remark || "",
      targetBureauType: payload.targetBureauType,
      targetBureauName: payload.targetBureauName,
      amount: payload.amount,
      payerAccountLabel: payload.payerAccountLabel,
      payeeAccountLabel: payload.payeeAccountLabel,
      targetAccountNo: payload.targetAccountNo || payload.payeeAccountLabel || payload.payerAccountLabel || "——",
      attachments: payload.attachments,
      countyDecision: payload.countyDecision ?? "none",
      cityDecision: payload.cityDecision ?? "none",
      cashierSubmitted: payload.cashierSubmitted ?? false,
      currentStep: payload.currentStep,
      rejectedBy: payload.rejectedBy ?? null,
      countyRejectReason: payload.countyRejectReason || "",
      cityRejectReason: payload.cityRejectReason || "",
      withdrawn: payload.withdrawn ?? false,
      createdAt: t,
      updatedAt: t,
    };
    return upsert(app);
  }

  function reset() {
    localStorage.removeItem(KEY);
    seed();
  }

  window.DemoStore = {
    KEY,
    seed,
    reset,
    list,
    get,
    upsert,
    create,
    nowISO,
  };
})();
