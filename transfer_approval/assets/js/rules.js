/* 规则层：对外状态映射、待我处理判定、按钮权限与流转动作 */

(function () {
  const ROLE = {
    ops: "ops",
    county_finance: "county_finance",
    city_finance: "city_finance",
    city_cashier: "city_cashier",
  };

  const STEP = {
    county_review: "county_review",
    city_review: "city_review",
    cashier_submit: "cashier_submit",
    done: "done",
    ops_fix: "ops_fix",
  };

  // 对外状态：审批中 / 被驳回 / 已撤回 / 已完成
  function computePublicStatus(app) {
    if (app.withdrawn) return "已撤回";
    if (app.cashierSubmitted || app.currentStep === STEP.done) return "已完成";
    if (app.currentStep === STEP.cashier_submit) return "待转账";
    if (app.rejectedBy) return "被驳回";
    return "审批中";
  }

  function hasAnyApprovalAction(app) {
    // 只要区县/市局任一方做过通过/驳回，就认为发生过审批动作
    return (
      (app.countyDecision && app.countyDecision !== "none") ||
      (app.cityDecision && app.cityDecision !== "none")
    );
  }

  function canWithdraw(app) {
    if (app.withdrawn) return false;
    if (computePublicStatus(app) !== "审批中") return false;
    return !hasAnyApprovalAction(app);
  }

  function isVisibleToRole(app, role) {
    if (role === ROLE.ops) return true;
    // 审批方：撤回记录不可见
    if (app.withdrawn) return false;
    // 出纳：只能看到待转账/已完成
    if (role === ROLE.city_cashier) {
      const pub = computePublicStatus(app);
      return pub === "待转账" || pub === "已完成";
    }
    // 市局财务：不需要看到“区县财务尚未审批完成”的申请
    // - 目标=区县且仍处于区县审核环节（county_review）→ 市局财务不可见
    // - 区县驳回回到运营补充（rejectedBy=county）→ 市局财务不可见
    if (role === ROLE.city_finance) {
      if (app.targetBureauType === "county" && app.currentStep === STEP.county_review) return false;
      if (app.rejectedBy === "county") return false;
    }
    return true;
  }

  function isTodoForRole(app, role) {
    if (!isVisibleToRole(app, role)) return false;
    if (computePublicStatus(app) === "已完成") return false;
    if (computePublicStatus(app) === "已撤回") return false;
    if (computePublicStatus(app) === "被驳回") return false; // 待运营补充

    if (role === ROLE.county_finance) return app.currentStep === STEP.county_review;
    if (role === ROLE.city_finance) return app.currentStep === STEP.city_review;
    if (role === ROLE.city_cashier) return app.currentStep === STEP.cashier_submit;
    return false;
  }

  function getCurrentNodeLabel(app) {
    if (app.withdrawn) return "已撤回";
    if (app.cashierSubmitted || app.currentStep === STEP.done) return "已完成";
    if (app.rejectedBy === "county") return "运营补充（区县驳回）";
    if (app.rejectedBy === "city") return "运营补充（市局驳回）";

    if (app.currentStep === STEP.county_review) return "区县财务审核";
    if (app.currentStep === STEP.city_review) return "市局财务审批";
    if (app.currentStep === STEP.cashier_submit) return "市局出纳提交网银";
    return "—";
  }

  function getNextStepOnInitialSubmit(app) {
    // app.targetBureauType: city/county
    return app.targetBureauType === "city" ? STEP.city_review : STEP.county_review;
  }

  function applyAction(app, action, payload) {
    // 返回新的 app（不可变拷贝）
    const next = JSON.parse(JSON.stringify(app));

    function ensureNotWithdrawn() {
      if (next.withdrawn) throw new Error("该申请已撤回，无法操作。");
    }

    switch (action) {
      case "county_approve": {
        ensureNotWithdrawn();
        if (next.currentStep !== STEP.county_review) throw new Error("当前不在区县审核环节。");
        next.countyDecision = "approved";
        next.rejectedBy = null;
        next.currentStep = STEP.city_review;
        return next;
      }
      case "county_reject": {
        ensureNotWithdrawn();
        if (next.currentStep !== STEP.county_review) throw new Error("当前不在区县审核环节。");
        const reason = (payload && payload.reason ? String(payload.reason) : "").trim();
        if (!reason) throw new Error("请填写驳回理由。");
        if (reason.length > 200) throw new Error("驳回理由不能超过200字。");
        next.countyDecision = "rejected";
        next.countyRejectReason = reason;
        next.rejectedBy = "county";
        next.currentStep = STEP.ops_fix;
        return next;
      }
      case "city_approve": {
        ensureNotWithdrawn();
        if (next.currentStep !== STEP.city_review) throw new Error("当前不在市局审批环节。");
        next.cityDecision = "approved";
        next.rejectedBy = null;
        next.currentStep = STEP.cashier_submit;
        return next;
      }
      case "city_reject": {
        ensureNotWithdrawn();
        if (next.currentStep !== STEP.city_review) throw new Error("当前不在市局审批环节。");
        const reason = (payload && payload.reason ? String(payload.reason) : "").trim();
        if (!reason) throw new Error("请填写驳回理由。");
        if (reason.length > 200) throw new Error("驳回理由不能超过200字。");
        next.cityDecision = "rejected";
        next.cityRejectReason = reason;
        next.rejectedBy = "city";
        next.currentStep = STEP.ops_fix;
        return next;
      }
      case "ops_resubmit": {
        ensureNotWithdrawn();
        if (!next.rejectedBy) throw new Error("当前不是驳回待补充状态。");
        // 更新资料（原型：仅替换 attachments）
        if (payload && payload.attachments) next.attachments = payload.attachments;

        if (next.rejectedBy === "county") {
          // 区县驳回：回到区县重审（覆盖区县结果为待审）
          next.countyDecision = "none";
          // 市局尚未发生审批（或者被清空），也保持 none
          next.cityDecision = "none";
          next.currentStep = STEP.county_review;
          next.rejectedBy = null;
          return next;
        }
        if (next.rejectedBy === "city") {
          // 市局驳回：区县通过保留；回到市局重审
          next.cityDecision = "none";
          next.currentStep = STEP.city_review;
          next.rejectedBy = null;
          return next;
        }
        throw new Error("未知驳回来源。");
      }
      case "ops_withdraw": {
        if (!canWithdraw(next)) throw new Error("当前不满足撤回条件（需未发生任何审批动作）。");
        next.withdrawn = true;
        next.currentStep = STEP.ops_fix;
        next.rejectedBy = null;
        return next;
      }
      case "cashier_submit": {
        ensureNotWithdrawn();
        if (next.currentStep !== STEP.cashier_submit) throw new Error("当前不在出纳提交环节。");
        next.cashierSubmitted = true;
        next.currentStep = STEP.done;
        return next;
      }
      default:
        throw new Error("未知动作：" + action);
    }
  }

  window.DemoRules = {
    ROLE,
    STEP,
    computePublicStatus,
    canWithdraw,
    isVisibleToRole,
    isTodoForRole,
    getCurrentNodeLabel,
    getNextStepOnInitialSubmit,
    applyAction,
  };
})();
