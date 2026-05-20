/* 原型主逻辑（按截图重构）：统一列表 + 筛选区 + 申请转账弹窗 + 详情抽屉 */

(function () {
  const { ROLE, computePublicStatus, isVisibleToRole, isTodoForRole, canWithdraw, applyAction, getCurrentNodeLabel } =
    window.DemoRules;

  const ROLE_LABEL = {
    [ROLE.ops]: "平台运营",
    [ROLE.county_finance]: "区县财务",
    [ROLE.city_finance]: "市局财务",
    [ROLE.city_cashier]: "市局出纳",
  };

  // 目标教育局下拉：按“驻马店市局直属 / 下属区县教育局”分组展示
  const TARGET_CITY_DIRECT = [{ type: "city", name: "驻马店市教育局", payer: "驻马店市教育局监管账户（固定）" }];
  const TARGET_COUNTIES = [
    { type: "county", name: "驿城区教育局", payer: "驿城区教育局监管账户（固定）" },
    { type: "county", name: "遂平县教育局", payer: "遂平县教育局监管账户（固定）" },
    { type: "county", name: "上蔡县教育局", payer: "上蔡县教育局监管账户（固定）" },
    { type: "county", name: "汝南县教育局", payer: "汝南县教育局监管账户（固定）" },
    { type: "county", name: "平舆县教育局", payer: "平舆县教育局监管账户（固定）" },
  ];

  // 发起弹窗：付款账户固定，不与目标教育局绑定
  const PAYER_FIXED = { bank: "邮储", account: "天中教育监管户" };

  // 收款账户改为可选（仅原型演示：可在此处替换为真实账户清单）
  const PAYEE_OPTIONS = [
    { bank: "邮储", accounts: ["智教创新结算账户", "智教创新备付金账户"] },
    { bank: "工行", accounts: ["智教创新结算账户（工行）"] },
    { bank: "建行", accounts: ["智教创新结算账户（建行）"] },
  ];

  const state = {
    role: localStorage.getItem("transfer_approval_role") || ROLE.ops,
    query: {
      start: "",
      end: "",
      status: "",
      target: "",
    },
    modalCityFiles: [],
    modalCountyFiles: [],
    transferAppId: null,
    resubmitDraft: null, // { id, cityFiles: [{name}], countyFiles: [{name}] }
    rejectDraft: null, // { id, act }
  };

  const els = {
    role: document.getElementById("role"),
    btnResetData: document.getElementById("btnResetData"),
    btnApply: document.getElementById("btnApply"),
    btnResetFilters: document.getElementById("btnResetFilters"),
    btnSearch: document.getElementById("btnSearch"),
    btnExport: document.getElementById("btnExport"),
    fStart: document.getElementById("fStart"),
    fEnd: document.getElementById("fEnd"),
    fStatus: document.getElementById("fStatus"),
    fTarget: document.getElementById("fTarget"),
    count: document.getElementById("count"),
    tableBody: document.getElementById("tableBody"),
    empty: document.getElementById("empty"),
    toast: document.getElementById("toast"),

    // modal
    modalMask: document.getElementById("modalMask"),
    modalClose: document.getElementById("modalClose"),
    modalCancel: document.getElementById("modalCancel"),
    applyForm: document.getElementById("applyForm"),
    mTarget: document.getElementById("mTarget"),
    mPayer: document.getElementById("mPayer"),
    mPayeeBank: document.getElementById("mPayeeBank"),
    mPayeeAccount: document.getElementById("mPayeeAccount"),
    mAmount: document.getElementById("mAmount"),
    mRemark: document.getElementById("mRemark"),
    countyUploadRow: document.getElementById("countyUploadRow"),
    mCityFiles: document.getElementById("mCityFiles"),
    btnUploadCity: document.getElementById("btnUploadCity"),
    mCityFileList: document.getElementById("mCityFileList"),
    mCountyFiles: document.getElementById("mCountyFiles"),
    btnUploadCounty: document.getElementById("btnUploadCounty"),
    mCountyFileList: document.getElementById("mCountyFileList"),

    // drawer
    drawerMask: document.getElementById("drawerMask"),
    drawerClose: document.getElementById("drawerClose"),
    drawerTitle: document.getElementById("drawerTitle"),
    drawerBody: document.getElementById("drawerBody"),

    // reject modal (finance)
    rejectMask: document.getElementById("rejectMask"),
    rejectClose: document.getElementById("rejectClose"),
    rejectCancel: document.getElementById("rejectCancel"),
    rejectConfirm: document.getElementById("rejectConfirm"),
    rejectReason: document.getElementById("rejectReason"),

    // transfer modal (cashier)
    transferMask: document.getElementById("transferMask"),
    transferClose: document.getElementById("transferClose"),
    transferCancel: document.getElementById("transferCancel"),
    transferConfirm: document.getElementById("transferConfirm"),
    tId: document.getElementById("tId"),
    tApplicant: document.getElementById("tApplicant"),
    tCreatedAt: document.getElementById("tCreatedAt"),
    tApprovedAt: document.getElementById("tApprovedAt"),
    tPayerBank: document.getElementById("tPayerBank"),
    tPayerName: document.getElementById("tPayerName"),
    tPayerNo: document.getElementById("tPayerNo"),
    tPayeeBank: document.getElementById("tPayeeBank"),
    tPayeeName: document.getElementById("tPayeeName"),
    tPayeeNo: document.getElementById("tPayeeNo"),
    tAmount: document.getElementById("tAmount"),
    tAmount2: document.getElementById("tAmount2"),
  };

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setToast(msg, detail) {
    els.toast.hidden = false;
    els.toast.innerHTML = `<div>${escapeHtml(msg)}</div>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}`;
    setTimeout(() => (els.toast.hidden = true), 2200);
  }

  function formatMoney(n) {
    const v = Number(n || 0);
    return v.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("zh-CN");
    } catch {
      return iso || "—";
    }
  }

  function parseLines(text) {
    return String(text || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function guessType(name) {
    const n = String(name || "").toLowerCase();
    if (n.endsWith(".zip")) return "zip";
    if (n.endsWith(".doc") || n.endsWith(".docx")) return "word";
    if (n.endsWith(".xls") || n.endsWith(".xlsx")) return "excel";
    if (n.endsWith(".pdf")) return "pdf";
    if (n.endsWith(".png")) return "png";
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "jpeg";
    return "file";
  }

  function renderStatusBadge(status) {
    if (status === "已完成") return `<span class="badge badge--ok"><span class="dot"></span>已完成</span>`;
    if (status === "已撤回") return `<span class="badge badge--warn"><span class="dot"></span>已撤回</span>`;
    if (status === "被驳回") return `<span class="badge badge--bad"><span class="dot"></span>被驳回</span>`;
    if (status === "待转账") return `<span class="badge badge--warn"><span class="dot"></span>待转账</span>`;
    return `<span class="badge badge--ing"><span class="dot"></span>审批中</span>`;
  }

  // 状态展示需要“按角色”差异化：
  // - 区县财务：只要区县节点已处理（通过/驳回），在其视角下展示为“已完成”
  // - 市局财务：只要市局节点已处理（通过/驳回），在其视角下展示为“已完成”
  //   （不影响运营/出纳等其他角色的对外状态：仍可能为审批中/被驳回）
  function statusForRole(app, role) {
    const base = computePublicStatus(app);
    if (base === "已撤回" || base === "已完成") return base;
    if (role === ROLE.county_finance && app.targetBureauType === "county" && app.countyDecision !== "none") {
      return "已完成";
    }
    if (role === ROLE.city_finance && app.cityDecision !== "none") {
      return "已完成";
    }
    return base;
  }

  function nodeForRole(app, role) {
    if (role === ROLE.county_finance && app.targetBureauType === "county" && app.countyDecision !== "none") {
      return "区县审批已处理";
    }
    if (role === ROLE.city_finance && app.cityDecision !== "none") {
      return "市局审批已处理";
    }
    return getCurrentNodeLabel(app);
  }

  function buildStatusOptions() {
    const role = state.role;
    const opts = [];
    // 默认“全部”
    opts.push({ value: "", label: "全部" });
    if (role === ROLE.ops) {
      opts.push({ value: "审批中", label: "审批中" });
      opts.push({ value: "被驳回", label: "被驳回" });
      opts.push({ value: "待转账", label: "待转账" });
      opts.push({ value: "已完成", label: "已完成" });
      opts.push({ value: "已撤回", label: "已撤回" });
    } else if (role === ROLE.city_cashier) {
      opts.push({ value: "待转账", label: "待转账" });
      opts.push({ value: "已完成", label: "已完成" });
    } else {
      opts.push({ value: "待我处理", label: "待我处理" });
      opts.push({ value: "已完成", label: "已完成" });
    }
    els.fStatus.innerHTML = opts.map((o) => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join("");
  }

  function getFilteredApps() {
    const role = state.role;
    const all = window.DemoStore.list().filter((a) => isVisibleToRole(a, role));

    // 文本筛选：目标账户
    let rows = all;
    if (state.query.target) {
      const q = state.query.target.trim();
      rows = rows.filter((a) => String(a.targetBureauName || "").includes(q));
    }

    // 状态筛选（依角色语义不同）
    if (state.query.status) {
      if (role === ROLE.ops) {
        rows = rows.filter((a) => computePublicStatus(a) === state.query.status);
      } else if (state.query.status === "待我处理") {
        rows = rows.filter((a) => isTodoForRole(a, role));
      } else if (state.query.status === "已完成") {
        rows = rows.filter((a) => statusForRole(a, role) === "已完成");
      }
    }

    // 时间筛选：使用 createdAt（原型）
    if (state.query.start) {
      const s = new Date(state.query.start + "T00:00:00").getTime();
      rows = rows.filter((a) => new Date(a.createdAt).getTime() >= s);
    }
    if (state.query.end) {
      const e = new Date(state.query.end + "T23:59:59").getTime();
      rows = rows.filter((a) => new Date(a.createdAt).getTime() <= e);
    }

    // 排序：更新时间倒序
    rows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return rows;
  }

  function renderTable() {
    const rows = getFilteredApps();
    els.count.textContent = String(rows.length);

    if (!rows.length) {
      els.tableBody.innerHTML = "";
      els.empty.hidden = false;
      return;
    }
    els.empty.hidden = true;

    const role = state.role;
    els.tableBody.innerHTML = rows
      .map((a, idx) => {
        const status = statusForRole(a, role);
        // 按截图：统一为“查看详情”，详情内再根据角色展示审批按钮
        const opLabel = "查看详情";
        const targetAccountNo = a.targetAccountNo || a.payeeAccountLabel || "——";
        const remark = (a.remark || "").trim();
        return `<tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(a.targetBureauName || "—")}</td>
          <td>${escapeHtml(targetAccountNo)}</td>
          <td>${escapeHtml(formatMoney(a.amount))}</td>
          <td>${renderStatusBadge(status)}</td>
          <td>${escapeHtml(a.applicantName || "—")}</td>
          <td class="td-remark">${remark ? escapeHtml(remark) : "—"}</td>
          <td><button class="op-btn" type="button" data-open="${escapeHtml(a.id)}">${escapeHtml(opLabel)}</button></td>
        </tr>`;
      })
      .join("");

    els.tableBody.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => openDrawer(btn.getAttribute("data-open")));
    });
  }

  /* ========== 申请转账弹窗 ========== */
  function openModal() {
    if (state.role !== ROLE.ops) {
      setToast("无权限", "仅平台运营可申请转账");
      return;
    }

    // 初始化目标账户下拉
    els.mTarget.innerHTML = buildTargetOptionsHtml();

    els.mTarget.value = "";
    els.mAmount.value = "";
    els.mRemark.value = "";
    els.mPayer.value = `${PAYER_FIXED.bank} · ${PAYER_FIXED.account}`;
    // 收款账户默认：邮储，自动加载对应账户列表
    els.mPayeeBank.value = "邮储";
    syncPayeeAccounts();
    state.modalCityFiles = [];
    state.modalCountyFiles = [];
    syncModalFileList("city");
    syncModalFileList("county");
    els.countyUploadRow.style.display = "none";

    els.modalMask.hidden = false;
  }

  function syncPayeeAccounts() {
    const bank = els.mPayeeBank.value;
    const hit = PAYEE_OPTIONS.find((x) => x.bank === bank);
    const accounts = hit ? hit.accounts : [];
    els.mPayeeAccount.innerHTML =
      `<option value="">请选择收款账户</option>` + accounts.map((a) => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join("");
    // 默认选中第一项（如果存在）
    if (accounts.length) els.mPayeeAccount.value = accounts[0];
  }

  function buildTargetOptionsHtml() {
    const opt = (x) =>
      `<option value="${escapeHtml(x.name)}" data-type="${escapeHtml(x.type)}" data-payer="${escapeHtml(x.payer)}">${escapeHtml(
        x.name
      )}</option>`;

    return (
      `<option value="">请选择</option>` +
      `<optgroup label="驻马店市局直属">${TARGET_CITY_DIRECT.map(opt).join("")}</optgroup>` +
      `<optgroup label="下属区县教育局">${TARGET_COUNTIES.map(opt).join("")}</optgroup>`
    );
  }

  function closeModal() {
    els.modalMask.hidden = true;
  }

  function syncModalFileList(kind) {
    const list = kind === "county" ? state.modalCountyFiles : state.modalCityFiles;
    const el = kind === "county" ? els.mCountyFileList : els.mCityFileList;
    const prefix = kind === "county" ? "c" : "s";

    if (!list.length) {
      el.innerHTML = `<span style="color: var(--muted);">未上传</span>`;
      return;
    }
    el.innerHTML = list
      .map(
        (f, i) =>
          `<span class="file-chip">${escapeHtml(
            f.name
          )}<button type="button" data-rm="${prefix}-${i}" aria-label="移除">×</button></span>`
      )
      .join("");
    el.querySelectorAll("[data-rm]").forEach((b) => {
      b.addEventListener("click", () => {
        const raw = String(b.getAttribute("data-rm"));
        const i = Number(raw.split("-")[1]);
        list.splice(i, 1);
        syncModalFileList(kind);
      });
    });
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    const name = els.mTarget.value;
    const opt = els.mTarget.options[els.mTarget.selectedIndex];
    const type = opt?.getAttribute("data-type");
    const payer = opt?.getAttribute("data-payer");
    const payeeBank = els.mPayeeBank.value;
    const payeeAccount = els.mPayeeAccount.value;
    const amount = Number(els.mAmount.value);
    const remark = String(els.mRemark.value || "").trim();

    if (!name) return setToast("请先选择目标账户");
    if (!payeeAccount) return setToast("请选择收款账户");
    if (!amount || amount <= 0) return setToast("请填写正确的转账金额");
    if (remark.length > 200) return setToast("备注说明不能超过200字");
    if (!state.modalCityFiles.length) return setToast("请上传市局资料");
    if (type === "county" && !state.modalCountyFiles.length) return setToast("目标为区县时，请上传区县资料");

    const appDraft = {
      applicantName: "平台运营",
      remark,
      targetBureauType: type,
      targetBureauName: name,
      amount,
      payerAccountLabel: `${PAYER_FIXED.bank} · ${PAYER_FIXED.account}`,
      payeeAccountLabel: `${payeeBank} · ${payeeAccount}`,
      targetAccountNo: `${payeeBank} · ${payeeAccount}`,
      attachments: {
        cityFiles: state.modalCityFiles.map((f) => ({ name: f.name, type: guessType(f.name) })),
        countyFiles: type === "county" ? state.modalCountyFiles.map((f) => ({ name: f.name, type: guessType(f.name) })) : [],
      },
      countyDecision: "none",
      cityDecision: "none",
      cashierSubmitted: false,
      currentStep: window.DemoRules.getNextStepOnInitialSubmit({ targetBureauType: type }),
      rejectedBy: null,
      countyRejectReason: "",
      cityRejectReason: "",
      withdrawn: false,
    };

    const created = window.DemoStore.create(appDraft);
    setToast("提交成功", `已进入：${getCurrentNodeLabel(created)}`);
    closeModal();
    renderTable();
  }

  /* ========== 详情抽屉 ========== */
  function openDrawer(id) {
    const app = window.DemoStore.get(id);
    if (!app) return setToast("未找到记录");
    if (!isVisibleToRole(app, state.role)) return setToast("无权限", "该记录对当前角色不可见");

    // 运营“被驳回”时：初始化再次提交的临时编辑数据（用于删除旧文件/上传新文件）
    if (state.role === ROLE.ops && computePublicStatus(app) === "被驳回") {
      initResubmitDraft(app);
    } else {
      state.resubmitDraft = null;
    }

    els.drawerTitle.textContent = `申请详情 · ${app.id}`;
    els.drawerBody.innerHTML = renderDrawerBody(app);
    els.drawerMask.hidden = false;

    // bind actions
    els.drawerBody.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.getAttribute("data-act");
        handleActionInDrawer(app.id, act);
      });
    });
    bindAttachmentActions();
    const resubmit = els.drawerBody.querySelector("#formResubmit");
    if (resubmit) {
      bindResubmitInteractions(app);
      resubmit.addEventListener("submit", (e) => {
        e.preventDefault();
        const payload = collectResubmitPayload(app);
        try {
          const next = applyAction(app, "ops_resubmit", payload);
          window.DemoStore.upsert(next);
          setToast("已再次提交", `已流转至：${getCurrentNodeLabel(next)}`);
          openDrawer(app.id);
          renderTable();
        } catch (err) {
          setToast("操作失败", err.message || String(err));
        }
      });
    }
  }

  function bindAttachmentActions() {
    els.drawerBody.querySelectorAll("[data-file-action]").forEach((b) => {
      b.addEventListener("click", () => {
        const action = b.getAttribute("data-file-action");
        const name = b.getAttribute("data-file-name") || "附件";
        if (action === "preview") setToast("已触发预览（原型示意）", name);
        if (action === "download") setToast("已触发下载（原型示意）", name);
      });
    });
  }

  function closeDrawer() {
    els.drawerMask.hidden = true;
  }

  function renderDrawerBody(app) {
    const role = state.role;
    const status = statusForRole(app, role);
    const node = nodeForRole(app, role);

    const canOpsResubmit = role === ROLE.ops && status === "被驳回";
    const canOpsWithdraw = role === ROLE.ops && canWithdraw(app);
    const canCounty = role === ROLE.county_finance && app.currentStep === "county_review";
    const canCity = role === ROLE.city_finance && app.currentStep === "city_review";
    const canCashier = role === ROLE.city_cashier && app.currentStep === "cashier_submit";
    const showOpsActionSection = !(role === ROLE.ops && status === "被驳回");

    return `
      <div class="section">
        <h3 class="section-title">申请信息</h3>
        <div class="kv">
          <div>目标教育局</div><div><b>${escapeHtml(app.targetBureauName)}</b></div>
          <div>转账金额</div><div><b>${escapeHtml(formatMoney(app.amount))}</b></div>
          <div>付款账户</div><div>${escapeHtml(app.payerAccountLabel)}</div>
          <div>收款账户</div><div>${escapeHtml(app.payeeAccountLabel)}</div>
          <div>申请人</div><div>${escapeHtml(app.applicantName || "—")}</div>
          <div>备注</div><div>${app.remark ? escapeHtml(app.remark) : "—"}</div>
          <div>状态/节点</div><div>${renderStatusBadge(status)} <span style="margin-left:8px;color:var(--muted);">${escapeHtml(
      node
    )}</span></div>
        </div>
      </div>

      ${
        (app.countyRejectReason || app.cityRejectReason)
          ? `<div class="section">
              <h3 class="section-title">驳回信息</h3>
              <div class="kv">
                <div>区县驳回理由</div><div>${app.countyRejectReason ? escapeHtml(app.countyRejectReason) : "—"}</div>
                <div>市局驳回理由</div><div>${app.cityRejectReason ? escapeHtml(app.cityRejectReason) : "—"}</div>
              </div>
            </div>`
          : ``
      }

      ${
        role === ROLE.county_finance
          ? ``
          : `<div class="section">
              <h3 class="section-title">流程时间轴</h3>
              ${renderTimeline(app, role)}
            </div>`
      }

      <div class="section">
        <h3 class="section-title">申请资料</h3>
        ${renderAttachments(app)}
      </div>

      ${
        showOpsActionSection
          ? `<div class="section">
              <h3 class="section-title">${
                role === ROLE.county_finance || role === ROLE.city_finance ? "操作区" : `操作区（${escapeHtml(ROLE_LABEL[role])}）`
              }</h3>
              <div class="drawer-actions">
                ${canOpsWithdraw ? `<button class="btn btn--ghost" data-act="ops_withdraw" type="button">撤回</button>` : ""}
                ${
                  canCounty
                    ? `<button class="btn btn--primary" data-act="county_approve" type="button">通过</button>
                       <button class="btn btn--ghost" data-act="county_reject" type="button">驳回</button>`
                    : ""
                }
                ${
                  canCity
                    ? `<button class="btn btn--primary" data-act="city_approve" type="button">通过</button>
                       <button class="btn btn--ghost" data-act="city_reject" type="button">驳回</button>`
                    : ""
                }
                ${canCashier ? `<button class="btn btn--primary" data-act="cashier_go" type="button">去转账</button>` : ""}
              </div>
            </div>`
          : ``
      }

      ${canOpsResubmit ? renderResubmitEditor(app) : ""}
    `;
  }

  function renderAttachments(app) {
    // 展示规则：
    // - 上传虽然分区县/市局分开上传
    // - 展示时混合在一起，不用标题区分
    // - 区县财务查看时，过滤掉市局资料（只看区县资料）
    const role = state.role;
    const county = app.attachments?.countyFiles || [];
    const city = app.attachments?.cityFiles || [];
    const visible = role === ROLE.county_finance ? county : [...county, ...city];

    return `
      <ul class="td-files" style="margin:0;padding-left:18px;color:var(--muted);font-size:12px;line-height:1.7;">
        ${
          visible.length
            ? visible
                .map((f) => {
                  const t = guessType(f.name);
                  const canPreview = t === "pdf" || t === "png" || t === "jpeg";
                  const canDownload = ["pdf", "png", "jpeg", "excel", "zip", "word"].includes(t);
                  return `<li>
                      <span>${escapeHtml(f.name)}</span>
                      <span class="file-actions">
                        ${canPreview ? `<button class="link-btn" type="button" data-file-action="preview" data-file-name="${escapeHtml(
                          f.name
                        )}">预览</button>` : ""}
                        ${canDownload ? `<button class="link-btn" type="button" data-file-action="download" data-file-name="${escapeHtml(
                          f.name
                        )}">下载</button>` : ""}
                      </span>
                    </li>`;
                })
                .join("")
            : `<li>（无）</li>`
        }
      </ul>
    `;
  }

  function renderTimeline(app, role) {
    const steps = [];
    const onlyCountyView = role === ROLE.county_finance;
    if (app.targetBureauType === "county") {
      steps.push({
        key: "county",
        title: "区县财务审核",
        decision: app.countyDecision,
        current: app.currentStep === "county_review",
      });
    }
    // 区县财务详情中不展示市局流程时间轴
    if (!onlyCountyView) {
      steps.push({
        key: "city",
        title: "市局财务审批",
        decision: app.cityDecision,
        current: app.currentStep === "city_review",
      });
      steps.push({
        key: "cashier",
        title: "市局出纳提交网银申请",
        decision: app.cashierSubmitted ? "approved" : "none",
        current: app.currentStep === "cashier_submit",
      });
    }

    if (!steps.length) {
      return `<div class="form-tip">（无）</div>`;
    }

    return `<ol class="timeline">
      ${steps
        .map((s) => {
          const cls = ["t-item", s.current ? "is-current" : "", s.decision === "approved" ? "is-done" : "", s.decision === "rejected" ? "is-rejected" : ""]
            .filter(Boolean)
            .join(" ");
          let badge = `<span class="badge"><span class="dot"></span>未到达</span>`;
          if (s.current) badge = `<span class="badge badge--ing"><span class="dot"></span>当前</span>`;
          if (s.decision === "approved") badge = `<span class="badge badge--ok"><span class="dot"></span>通过</span>`;
          if (s.decision === "rejected") badge = `<span class="badge badge--bad"><span class="dot"></span>驳回</span>`;
          if (s.key === "cashier" && app.cashierSubmitted) badge = `<span class="badge badge--ok"><span class="dot"></span>已提交</span>`;

          return `<li class="${cls}">
            <div class="t-dot"></div>
            <div class="t-card">
              <div class="t-title"><b>${escapeHtml(s.title)}</b>${badge}</div>
            </div>
          </li>`;
        })
        .join("")}
    </ol>`;
  }

  // 原型简化：流程时间轴不展示说明文字（只保留节点名称与状态）

  function renderResubmitEditor(app) {
    const showCounty = app.targetBureauType === "county";
    const hint =
      app.rejectedBy === "county"
        ? "区县驳回：再次提交后回到区县财务重审（区县结论会被清空为待审）。"
        : "市局驳回：区县通过结果保留；再次提交后直接回到市局财务复审。";

    const draft = state.resubmitDraft && state.resubmitDraft.id === app.id ? state.resubmitDraft : null;
    const cityList = draft ? draft.cityFiles : app.attachments?.cityFiles || [];
    const countyList = draft ? draft.countyFiles : app.attachments?.countyFiles || [];

    return `
      <div class="section">
        <h3 class="section-title">补充资料并再次提交</h3>
        <div class="form-tip">${escapeHtml(hint)}</div>
        <form id="formResubmit" style="margin-top:10px;">
          <div class="form-row">
            <label class="form-label"><span class="req">*</span>市局资料（可删除旧文件后上传新文件）</label>
            <div class="upload-line">
              <input id="resCityFiles" class="file-input" type="file" multiple
                accept=".zip,.doc,.docx,.xls,.xlsx,.pdf,.png,.jpg,.jpeg" />
              <button id="btnResUploadCity" class="btn btn--primary btn--mini" type="button">上传新资料</button>
              <button id="btnResClearCity" class="btn btn--ghost btn--mini" type="button">清空</button>
              <div id="resCityList" class="file-list">
                ${renderChips(cityList, "res-city")}
              </div>
            </div>
          </div>
          ${
            showCounty
              ? `<div class="form-row">
                  <label class="form-label"><span class="req">*</span>区县资料（目标=区县时必传）</label>
                  <div class="upload-line">
                    <input id="resCountyFiles" class="file-input" type="file" multiple
                      accept=".zip,.doc,.docx,.xls,.xlsx,.pdf,.png,.jpg,.jpeg" />
                    <button id="btnResUploadCounty" class="btn btn--primary btn--mini" type="button">上传新资料</button>
                    <button id="btnResClearCounty" class="btn btn--ghost btn--mini" type="button">清空</button>
                    <div id="resCountyList" class="file-list">
                      ${renderChips(countyList, "res-county")}
                    </div>
                  </div>
                </div>`
              : ""
          }
          <div class="modal__foot" style="padding-top:12px;">
            <button class="btn btn--primary" type="submit">确认再次提交</button>
          </div>
        </form>
      </div>
    `;
  }

  function collectResubmitPayload(app) {
    const draft = state.resubmitDraft && state.resubmitDraft.id === app.id ? state.resubmitDraft : null;
    const cityFiles = draft ? draft.cityFiles : [];
    const countyFiles = draft ? draft.countyFiles : [];
    if (!cityFiles.length) throw new Error("请上传市局资料（至少1项）");
    if (app.targetBureauType === "county" && !countyFiles.length) throw new Error("目标为区县时，请上传区县资料（至少1项）");
    return {
      attachments: {
        cityFiles: cityFiles.map((f) => ({ name: f.name, type: guessType(f.name) })),
        countyFiles: countyFiles.map((f) => ({ name: f.name, type: guessType(f.name) })),
      },
    };
  }

  function initResubmitDraft(app) {
    if (state.resubmitDraft && state.resubmitDraft.id === app.id) return;
    state.resubmitDraft = {
      id: app.id,
      cityFiles: (app.attachments?.cityFiles || []).map((f) => ({ name: f.name })),
      countyFiles: (app.attachments?.countyFiles || []).map((f) => ({ name: f.name })),
    };
  }

  function renderChips(files, prefix) {
    const list = files && files.length ? files : [];
    if (!list.length) return `<span style="color: var(--muted);">未上传</span>`;
    return list
      .map(
        (f, i) =>
          `<span class="file-chip">${escapeHtml(f.name)}<button type="button" data-rm="${escapeHtml(
            prefix
          )}-${i}" aria-label="移除">×</button></span>`
      )
      .join("");
  }

  function rerenderResubmitLists(app) {
    const draft = state.resubmitDraft && state.resubmitDraft.id === app.id ? state.resubmitDraft : null;
    if (!draft) return;
    const cityEl = els.drawerBody.querySelector("#resCityList");
    const countyEl = els.drawerBody.querySelector("#resCountyList");
    if (cityEl) cityEl.innerHTML = renderChips(draft.cityFiles, "res-city");
    if (countyEl) countyEl.innerHTML = renderChips(draft.countyFiles, "res-county");

    // 重新绑定删除按钮
    els.drawerBody.querySelectorAll("[data-rm^='res-city-'],[data-rm^='res-county-']").forEach((b) => {
      b.addEventListener("click", () => {
        const raw = String(b.getAttribute("data-rm"));
        const [p1, p2, idxStr] = raw.split("-");
        const idx = Number(idxStr);
        const kind = `${p1}-${p2}`; // res-city / res-county
        if (!Number.isFinite(idx)) return;
        if (kind === "res-city") draft.cityFiles.splice(idx, 1);
        if (kind === "res-county") draft.countyFiles.splice(idx, 1);
        rerenderResubmitLists(app);
      });
    });
  }

  function bindResubmitInteractions(app) {
    const draft = state.resubmitDraft && state.resubmitDraft.id === app.id ? state.resubmitDraft : null;
    if (!draft) return;

    const cityInput = els.drawerBody.querySelector("#resCityFiles");
    const countyInput = els.drawerBody.querySelector("#resCountyFiles");
    const btnUpCity = els.drawerBody.querySelector("#btnResUploadCity");
    const btnUpCounty = els.drawerBody.querySelector("#btnResUploadCounty");
    const btnClearCity = els.drawerBody.querySelector("#btnResClearCity");
    const btnClearCounty = els.drawerBody.querySelector("#btnResClearCounty");

    if (btnUpCity && cityInput) btnUpCity.addEventListener("click", () => cityInput.click());
    if (btnUpCounty && countyInput) btnUpCounty.addEventListener("click", () => countyInput.click());

    if (btnClearCity) {
      btnClearCity.addEventListener("click", () => {
        draft.cityFiles = [];
        rerenderResubmitLists(app);
      });
    }
    if (btnClearCounty) {
      btnClearCounty.addEventListener("click", () => {
        draft.countyFiles = [];
        rerenderResubmitLists(app);
      });
    }

    if (cityInput) {
      cityInput.addEventListener("change", () => {
        const files = Array.from(cityInput.files || []);
        files.forEach((f) => draft.cityFiles.push({ name: f.name }));
        cityInput.value = "";
        rerenderResubmitLists(app);
      });
    }
    if (countyInput) {
      countyInput.addEventListener("change", () => {
        const files = Array.from(countyInput.files || []);
        files.forEach((f) => draft.countyFiles.push({ name: f.name }));
        countyInput.value = "";
        rerenderResubmitLists(app);
      });
    }

    // 初次绑定删除按钮
    rerenderResubmitLists(app);
  }

  function handleActionInDrawer(id, act) {
    const app = window.DemoStore.get(id);
    if (!app) return;
    if (act === "cashier_go") {
      openTransferModal(id);
      return;
    }
    if (act === "county_reject" || act === "city_reject") {
      openRejectModal(id, act);
      return;
    }
    try {
      const next = applyAction(app, act, null);
      window.DemoStore.upsert(next);
      let msg = "操作成功";
      if (act === "ops_withdraw") msg = "已撤回（审批侧不可见）";
      if (act === "cashier_submit") msg = "已提交网银转账申请（已完成）";
      if (act === "county_reject" || act === "city_reject") msg = "已驳回，等待运营补充";
      setToast(msg, `下一节点：${getCurrentNodeLabel(next)}`);
      openDrawer(id);
      renderTable();
    } catch (err) {
      setToast("操作失败", err.message || String(err));
    }
  }

  /* ========== 审批驳回理由弹窗 ========== */
  function openRejectModal(id, act) {
    if (!(state.role === ROLE.county_finance || state.role === ROLE.city_finance)) {
      setToast("无权限");
      return;
    }
    state.rejectDraft = { id, act };
    els.rejectReason.value = "";
    els.rejectMask.hidden = false;
    setTimeout(() => els.rejectReason.focus(), 0);
  }

  function closeRejectModal() {
    els.rejectMask.hidden = true;
    state.rejectDraft = null;
    els.rejectReason.value = "";
  }

  function confirmReject() {
    const draft = state.rejectDraft;
    if (!draft) return;
    const reason = String(els.rejectReason.value || "").trim();
    if (!reason) return setToast("请填写驳回理由");
    if (reason.length > 200) return setToast("驳回理由不能超过200字");

    const app = window.DemoStore.get(draft.id);
    if (!app) return setToast("未找到记录");

    try {
      const next = applyAction(app, draft.act, { reason });
      window.DemoStore.upsert(next);
      setToast("已驳回", "驳回理由已记录");
      closeRejectModal();
      openDrawer(draft.id);
      renderTable();
    } catch (err) {
      setToast("操作失败", err.message || String(err));
    }
  }

  /* ========== 出纳“去转账”弹窗 ========== */
  function parseAccountLabel(label) {
    const s = String(label || "");
    const parts = s.split("·").map((x) => x.trim()).filter(Boolean);
    const bank = parts.length >= 2 ? parts[0] : "邮储";
    const name = parts.length >= 2 ? parts.slice(1).join("·") : s || "—";
    return { bank, name };
  }

  function inferAccountNo(name) {
    const n = String(name || "");
    if (n.includes("天中教育监管户")) return "9411720130003383474";
    if (n.includes("智教创新结算账户")) return "9411720130004059914";
    if (n.includes("智教创新备付金账户")) return "9411720130003383474";
    // fallback：生成一个看起来像账号的字符串
    const r = Math.floor(Math.random() * 1e10)
      .toString()
      .padStart(10, "0");
    return "9411720130" + r;
  }

  function openTransferModal(id) {
    const app = window.DemoStore.get(id);
    if (!app) return setToast("未找到记录");
    if (state.role !== ROLE.city_cashier) return setToast("无权限", "仅市局出纳可转账");

    state.transferAppId = id;

    els.tId.textContent = app.id;
    els.tApplicant.textContent = app.applicantName || "—";
    els.tCreatedAt.textContent = formatTime(app.createdAt);
    els.tApprovedAt.textContent = formatTime(app.updatedAt);

    const payer = parseAccountLabel(app.payerAccountLabel);
    const payee = parseAccountLabel(app.payeeAccountLabel);

    els.tPayerBank.textContent = payer.bank;
    els.tPayerName.textContent = payer.name;
    els.tPayerNo.textContent = inferAccountNo(payer.name);

    els.tPayeeBank.textContent = payee.bank;
    els.tPayeeName.textContent = payee.name;
    els.tPayeeNo.textContent = inferAccountNo(payee.name);

    const amt = `${formatMoney(app.amount)}元`;
    els.tAmount.textContent = amt;
    els.tAmount2.textContent = amt;

    els.transferMask.hidden = false;
  }

  function closeTransferModal() {
    els.transferMask.hidden = true;
    state.transferAppId = null;
  }

  function confirmTransfer() {
    const id = state.transferAppId;
    if (!id) return;
    const app = window.DemoStore.get(id);
    if (!app) return;
    try {
      const next = applyAction(app, "cashier_submit", null);
      window.DemoStore.upsert(next);
      setToast("转账成功", "状态已变更为：已完成");
      closeTransferModal();
      // 刷新详情与列表
      openDrawer(id);
      renderTable();
    } catch (err) {
      setToast("转账失败", err.message || String(err));
    }
  }

  /* ========== 导出（CSV） ========== */
  function exportCsv() {
    const rows = getFilteredApps();
    const header = ["序号", "转账目标账户", "转账目标账号", "转账金额", "状态", "申请人", "备注"];
    const lines = [header.join(",")];
    rows.forEach((a, idx) => {
      const status = statusForRole(a, state.role);
      const targetAccountNo = a.targetAccountNo || a.payeeAccountLabel || "——";
      lines.push(
        [
          idx + 1,
          safeCsv(a.targetBureauName || ""),
          safeCsv(targetAccountNo),
          safeCsv(formatMoney(a.amount)),
          safeCsv(status),
          safeCsv(a.applicantName || ""),
          safeCsv(a.remark || ""),
        ].join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "转账与审批-导出.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast("已导出", `共 ${rows.length} 条`);
  }

  function safeCsv(v) {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
    return s;
  }

  /* ========== 初始化 ========== */
  function syncRoleUi() {
    els.role.value = state.role;
    // 只有运营显示“申请转账”
    els.btnApply.style.display = state.role === ROLE.ops ? "inline-flex" : "none";
    buildStatusOptions();
    // 状态筛选默认“全部”
    state.query.status = "";
    els.fStatus.value = state.query.status;
  }

  function bindEvents() {
    els.role.addEventListener("change", () => {
      state.role = els.role.value;
      localStorage.setItem("transfer_approval_role", state.role);
      setToast("已切换角色", ROLE_LABEL[state.role]);
      syncRoleUi();
      renderTable();
    });

    els.btnResetData.addEventListener("click", () => {
      window.DemoStore.reset();
      setToast("已重置演示数据");
      renderTable();
    });

    els.btnApply.addEventListener("click", openModal);
    els.modalClose.addEventListener("click", closeModal);
    els.modalCancel.addEventListener("click", closeModal);
    els.modalMask.addEventListener("click", (e) => {
      if (e.target === els.modalMask) closeModal();
    });

    els.mTarget.addEventListener("change", () => {
      const opt = els.mTarget.options[els.mTarget.selectedIndex];
      const type = opt?.getAttribute("data-type") || "";
      els.countyUploadRow.style.display = type === "county" ? "block" : "none";
    });

    els.mPayeeBank.addEventListener("change", () => {
      syncPayeeAccounts();
    });

    els.btnUploadCity.addEventListener("click", () => els.mCityFiles.click());
    els.mCityFiles.addEventListener("change", () => {
      const files = Array.from(els.mCityFiles.files || []);
      files.forEach((f) => state.modalCityFiles.push({ name: f.name }));
      els.mCityFiles.value = "";
      syncModalFileList("city");
    });

    els.btnUploadCounty.addEventListener("click", () => els.mCountyFiles.click());
    els.mCountyFiles.addEventListener("change", () => {
      const files = Array.from(els.mCountyFiles.files || []);
      files.forEach((f) => state.modalCountyFiles.push({ name: f.name }));
      els.mCountyFiles.value = "";
      syncModalFileList("county");
    });

    els.applyForm.addEventListener("submit", handleModalSubmit);

    els.drawerClose.addEventListener("click", closeDrawer);
    els.drawerMask.addEventListener("click", (e) => {
      if (e.target === els.drawerMask) closeDrawer();
    });

    // reject modal events
    els.rejectClose.addEventListener("click", closeRejectModal);
    els.rejectCancel.addEventListener("click", closeRejectModal);
    els.rejectConfirm.addEventListener("click", confirmReject);
    els.rejectMask.addEventListener("click", (e) => {
      if (e.target === els.rejectMask) closeRejectModal();
    });

    // transfer modal events
    els.transferClose.addEventListener("click", closeTransferModal);
    els.transferCancel.addEventListener("click", closeTransferModal);
    els.transferConfirm.addEventListener("click", confirmTransfer);
    els.transferMask.addEventListener("click", (e) => {
      if (e.target === els.transferMask) closeTransferModal();
    });

    els.btnResetFilters.addEventListener("click", () => {
      state.query = { start: "", end: "", status: "", target: "" };
      els.fStart.value = "";
      els.fEnd.value = "";
      els.fTarget.value = "";
      syncRoleUi();
      renderTable();
    });

    els.btnSearch.addEventListener("click", () => {
      state.query.start = els.fStart.value || "";
      state.query.end = els.fEnd.value || "";
      state.query.status = els.fStatus.value || "";
      state.query.target = els.fTarget.value || "";
      renderTable();
    });

    els.btnExport.addEventListener("click", exportCsv);
  }

  function init() {
    window.DemoStore.seed();
    syncRoleUi();
    syncModalFileList("city");
    syncModalFileList("county");
    bindEvents();
    // 保证初始默认关闭
    els.modalMask.hidden = true;
    els.drawerMask.hidden = true;
    els.transferMask.hidden = true;
    els.rejectMask.hidden = true;
    renderTable();
  }

  init();
})();
