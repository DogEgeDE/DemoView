const evaluationTasks = Array.isArray(window.EVALUATION_TASKS) ? window.EVALUATION_TASKS : [];
const evaluationPath = "/evaluation-tasks";
const evaluationState = { query: "", status: "全部状态", studentQuery: "", studentStatus: "全部评价对象" };

function evaluationElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}

function evaluationButton(label, action, className = "evaluation-link") {
  const button = evaluationElement("button", className, label);
  button.type = "button";
  button.addEventListener("click", action);
  return button;
}

function evaluationSection(title, content, aside) {
  const section = evaluationElement("section", "evaluation-card");
  const heading = evaluationElement("div", "evaluation-card__heading");
  heading.append(evaluationElement("h2", "", title));
  if (aside) heading.append(aside);
  section.append(heading, content);
  return section;
}

function evaluationStatus(status) {
  return evaluationElement("span", `evaluation-status evaluation-status--${status === "进行中" ? "active" : status === "已结束" ? "ended" : "pending"}`, status);
}

function evaluationTable(headers, rows, emptyMessage) {
  const wrap = evaluationElement("div", "evaluation-table-wrap");
  const table = evaluationElement("table", "evaluation-table");
  const head = evaluationElement("thead");
  const headerRow = evaluationElement("tr");
  for (const header of headers) headerRow.append(evaluationElement("th", "", header));
  head.append(headerRow);
  const body = evaluationElement("tbody");
  for (const row of rows) {
    const tr = evaluationElement("tr");
    for (const cell of row) {
      const td = evaluationElement("td");
      if (cell instanceof Node) td.append(cell);
      else td.textContent = String(cell);
      tr.append(td);
    }
    body.append(tr);
  }
  if (!rows.length) {
    const tr = evaluationElement("tr");
    const td = evaluationElement("td", "evaluation-table__empty", emptyMessage);
    td.colSpan = headers.length;
    tr.append(td);
    body.append(tr);
  }
  table.append(head, body);
  wrap.append(table);
  return wrap;
}

function evaluationScore(task, record) {
  const score = task.indicators.reduce((sum, indicator, index) => sum + indicator.weight * record.scores[index] / 100, 0);
  return `${Number(score.toFixed(1))}${task.scoring.includes("星") ? " 星" : " 分"}`;
}

function evaluationSummary(task) {
  const targets = task.records;
  const students = new Set(targets.map(target => target.studentId));
  const rated = targets.filter(target => target.evaluations.length > 0).length;
  const records = targets.reduce((count, target) => count + target.evaluations.length, 0);
  return { studentCount: students.size, targetCount: targets.length, rated, records };
}

function evaluationMetrics(task) {
  const { studentCount, targetCount, records } = evaluationSummary(task);
  const metrics = evaluationElement("div", "evaluation-metrics");
  for (const [label, value] of [["服务学生", studentCount], ["评价对象（学生+课程）", targetCount], ["教师评价记录", records]]) {
    const card = evaluationElement("div", "evaluation-metric");
    card.append(evaluationElement("span", "", label), evaluationElement("strong", "", String(value)));
    metrics.append(card);
  }
  return metrics;
}

function evaluationHeader(title, description) {
  const header = evaluationElement("div", "evaluation-page__header");
  const intro = evaluationElement("div");
  intro.append(evaluationElement("h1", "", title));
  if (description) intro.append(evaluationElement("p", "", description));
  header.append(intro);
  return header;
}

function evaluationList() {
  renderBreadcrumb(["评价任务"]);
  document.title = "评价任务 · XXXXX机构";
  const page = evaluationElement("div", "evaluation-page");
  const filters = evaluationElement("div", "evaluation-filters");
  const search = evaluationElement("input", "evaluation-input");
  search.type = "search";
  search.placeholder = "搜索评价任务名称";
  search.setAttribute("aria-label", "搜索评价任务名称");
  search.value = evaluationState.query;
  const select = evaluationElement("select", "evaluation-select");
  select.setAttribute("aria-label", "按任务状态筛选");
  for (const label of ["全部状态", "进行中", "未开始", "已结束"]) select.append(evaluationElement("option", "", label));
  select.value = evaluationState.status;
  filters.append(search, select);
  const results = evaluationElement("div");
  function refresh() {
    const tasks = evaluationTasks.filter(task => task.audience === "学生" && task.name.includes(evaluationState.query.trim()) && (evaluationState.status === "全部状态" || evaluationState.status === task.status));
    const rows = tasks.map(task => [
      evaluationElement("strong", "evaluation-table__name", task.name),
      evaluationStatus(task.status),
      `${task.start} — ${task.end}`,
      `${task.indicators.length} 项`,
      `${evaluationSummary(task).studentCount} 人`,
      evaluationButton("查看详情", () => { window.location.hash = `#${evaluationPath}/${task.id}`; })
    ]);
    results.replaceChildren(evaluationTable(["评价任务名称", "状态", "评价窗口期", "评价指标", "服务学生", "操作"], rows, "没有符合条件的评价任务"));
  }
  search.addEventListener("input", () => { evaluationState.query = search.value; refresh(); });
  select.addEventListener("change", () => { evaluationState.status = select.value; refresh(); });
  refresh();
  page.append(evaluationSection("评价任务列表", filters), results);
  pageContent.replaceChildren(page);
  mountEvaluationRules("list", "评价任务列表 - 业务规则", [
    { tag: "数据来源", title: "评价任务来源", content: "评价任务由教育局统一发布，机构端仅接收并查看，不提供创建、编辑、删除或上下架操作。" },
    { tag: "数据隔离", title: "服务学校范围", content: "机构仅能查看本机构服务过的学校及其学生的评价数据；未服务过的学校和学生不出现在列表与详情中。" },
    { tag: "状态流转", title: "任务状态规则", content: "任务状态依据评价窗口期自动判定：未开始 → 进行中 → 已结束；已结束任务仅可查看。" },
    { tag: "统计口径", title: "列表统计说明", content: "服务学生按学生去重统计；同一学生报名多门课程时，按“学生 + 课程”分别作为评价对象，分别统计评价结果。" }
  ]);
}

function evaluationFacts(task) {
  const facts = evaluationElement("dl", "evaluation-facts");
  for (const [label, value] of [["发布单位", "红山区教育局"], ["评价对象", task.audience], ["评价者", task.evaluator], ["评价开始", task.start], ["评价结束", task.end], ["评分形式", task.scoring], ["匿名评价", task.anonymous ? "已开启" : "未开启"], ["创建时间", task.created]]) {
    const group = evaluationElement("div");
    group.append(evaluationElement("dt", "", label), evaluationElement("dd", "", value));
    facts.append(group);
  }
  return facts;
}

function evaluationStudentTable(task) {
  const controls = evaluationElement("div", "evaluation-filters");
  const search = evaluationElement("input", "evaluation-input");
  search.type = "search";
  search.placeholder = "搜索学生、学校或课程";
  search.setAttribute("aria-label", "搜索学生、学校或课程");
  search.value = evaluationState.studentQuery;
  const select = evaluationElement("select", "evaluation-select");
  select.setAttribute("aria-label", "按评价状态筛选");
  for (const label of ["全部评价对象", "已有评价", "暂无评价"]) select.append(evaluationElement("option", "", label));
  select.value = evaluationState.studentStatus;
  controls.append(search, select);
  const results = evaluationElement("div");
  function refresh() {
    const targets = task.records.filter(target => `${target.name} ${target.school} ${target.course}`.includes(evaluationState.studentQuery.trim()) && (evaluationState.studentStatus === "全部评价对象" || (evaluationState.studentStatus === "已有评价") === (target.evaluations.length > 0)));
    const rows = targets.map(target => [
      target.name,
      target.school,
      target.className,
      target.course,
      target.evaluations.length ? "已有评价" : "暂无评价",
      `${target.evaluations.length} 位老师 / ${target.evaluations.length} 条记录`,
      evaluationButton("查看评价", () => { window.location.hash = `#${evaluationPath}/${task.id}/student/${target.id}`; })
    ]);
    results.replaceChildren(evaluationTable(["学生", "学校", "年级班级", "报名课程", "评价状态", "教师评价", "操作"], rows, "没有符合条件的评价对象"));
  }
  search.addEventListener("input", () => { evaluationState.studentQuery = search.value; refresh(); });
  select.addEventListener("change", () => { evaluationState.studentStatus = select.value; refresh(); });
  refresh();
  const area = evaluationElement("div");
  area.append(controls, results);
  return area;
}

function evaluationDetail(task) {
  renderBreadcrumb(["评价任务", task.name], [evaluationPath]);
  document.title = `${task.name} · XXXXX机构`;
  const page = evaluationElement("div", "evaluation-page");
  page.append(evaluationHeader(task.name), evaluationMetrics(task));
  const basics = evaluationElement("div");
  basics.append(evaluationFacts(task), evaluationElement("h3", "evaluation-subtitle", "任务简介"), evaluationElement("p", "evaluation-description", task.description));
  page.append(evaluationSection("基本信息", basics, evaluationStatus(task.status)));
  const indicatorRows = task.indicators.map((indicator, index) => [index + 1, indicator.name, `${indicator.weight}%`, indicator.description]);
  const indicators = evaluationElement("div");
  indicators.append(evaluationTable(["序号", "指标名称", "权重", "指标说明"], indicatorRows, "暂无评价指标"), evaluationElement("p", "evaluation-note", `权重合计：${task.indicators.reduce((sum, indicator) => sum + indicator.weight, 0)}%`));
  page.append(evaluationSection(`评价指标 · 共 ${task.indicators.length} 项`, indicators));
  page.append(evaluationSection("本机构服务学生", evaluationStudentTable(task)));
  pageContent.replaceChildren(page);
  mountEvaluationRules("detail", "评价任务详情 - 业务规则", [
    { tag: "数据来源", title: "任务信息只读", content: "任务名称、评价时间、评分形式、评价指标及权重均来源于教育局发布内容，机构端不可修改；指标权重合计为 100%。" },
    { tag: "数据隔离", title: "服务学校范围", content: "“本机构服务学生”仅包含本机构服务过的学校学生，不展示其他机构或其他学校的学生数据。" },
    { tag: "评价对象", title: "学生+课程构成", content: "每条评价对象记录由“学生 + 报名课程”构成；同一学生在本机构报名多门课程时，按课程分别生成评价对象，需分别评价。" },
    { tag: "统计口径", title: "统计指标说明", content: "服务学生按学生去重统计；评价对象按学生+课程记录数统计；教师评价记录按每位教师的每条评价分别计数。" },
    { tag: "评价窗口", title: "评价提交限制", content: "仅进行中的任务可接收教师评价；未开始任务无学生评价数据；已结束任务不可再提交，仅可查看。" }
  ]);
}

function evaluationStudent(task, target) {
  const targetLabel = `${target.name}（${target.course}）`;
  renderBreadcrumb(["评价任务", task.name, targetLabel], [evaluationPath, `${evaluationPath}/${task.id}`]);
  document.title = `${targetLabel} · 评价结果 · XXXXX机构`;
  const page = evaluationElement("div", "evaluation-page");
  page.append(evaluationHeader(`${targetLabel}的评价结果`));
  const records = evaluationElement("div", "evaluation-records");
  if (!target.evaluations.length) records.append(evaluationElement("div", "evaluation-empty", "本机构老师尚未对该评价对象提交评价。"));
  target.evaluations.forEach((record, index) => {
    const card = evaluationElement("article", "evaluation-record");
    const header = evaluationElement("div", "evaluation-record__header");
    const identity = evaluationElement("div");
    identity.append(evaluationElement("strong", "", task.anonymous ? `教师评价 ${index + 1}` : record.teacher), evaluationElement("span", "", `提交于 ${record.submitted}`));
    header.append(identity, evaluationElement("strong", "evaluation-record__score", evaluationScore(task, record)));
    const rows = task.indicators.map((indicator, indicatorIndex) => [indicator.name, `${indicator.weight}%`, `${record.scores[indicatorIndex]}${task.scoring.includes("星") ? " 星" : " 分"}`]);
    card.append(header, evaluationTable(["评价指标", "权重", "教师评分"], rows, "暂无指标评分"), evaluationElement("p", "evaluation-record__comment", `评价内容：${record.comment || "未填写"}`));
    records.append(card);
  });
  page.append(evaluationSection(`教师评价记录 · ${target.evaluations.length} 条`, records));
  pageContent.replaceChildren(page);
  mountEvaluationRules("student", `${target.name} ${target.course} - 评价结果业务规则`, [
    { tag: "评价对象", title: "学生+课程独立评价", content: "评价对象由“学生 + 报名课程”构成；同一学生报名多门课程时，各课程分别评价，互不合并。" },
    { tag: "多人评价", title: "多名教师独立评价", content: "同一评价对象可由多位本机构教师分别评价，每条记录独立展示，不合并、不覆盖。" },
    { tag: "得分计算", title: "综合得分口径", content: "综合得分 = Σ(指标权重 × 该教师评分)，按任务评分形式显示为分数或星数。" },
    { tag: "匿名规则", title: "匿名评价展示", content: "匿名任务隐藏教师姓名，仅以“教师评价 N”标识；非匿名任务展示教师姓名及提交时间。" },
    { tag: "数据隔离", title: "评价数据范围", content: "仅展示本机构教师提交的评价记录，其他机构或学校的评价数据不可见。" },
    { tag: "空态处理", title: "暂无评价", content: "评价对象暂无教师评价时展示空状态，不生成默认分数。" }
  ]);
}

function mountEvaluationRules(prefix, title, rules) {
  document.querySelectorAll(".rule-panel").forEach(panel => panel.remove());
  const panel = evaluationElement("div", "rule-panel");
  const tab = evaluationElement("button", "rule-panel__tab", "业务规则");
  tab.type = "button";
  tab.setAttribute("aria-expanded", "false");
  const body = evaluationElement("aside", "rule-panel__body");
  body.hidden = true;
  const head = evaluationElement("div", "rule-panel__head");
  const close = evaluationElement("button", "rule-panel__close", "收起");
  close.type = "button";
  head.append(evaluationElement("strong", "", title), close);
  const list = evaluationElement("div", "rule-panel__list");
  for (const rule of rules) {
    const item = evaluationElement("div", "rule-panel__item");
    item.append(evaluationElement("span", "rule-panel__tag", rule.tag), evaluationElement("h3", "", rule.title), evaluationElement("p", "", rule.content));
    list.append(item);
  }
  body.append(head, list);
  panel.append(body, tab);

  const storageKey = `evaluation-rule-panel:${prefix}`;
  const savedTop = Number(localStorage.getItem(storageKey));
  if (savedTop > 0) panel.style.top = `${Math.min(savedTop, window.innerHeight - 120)}px`;

  function setOpen(open) {
    body.hidden = !open;
    panel.classList.toggle("rule-panel--open", open);
    tab.setAttribute("aria-expanded", String(open));
  }

  let dragStartY = 0;
  let startTop = 0;
  let moved = false;
  let suppressClick = false;
  tab.addEventListener("pointerdown", event => {
    dragStartY = event.clientY;
    startTop = panel.getBoundingClientRect().top;
    moved = false;
    tab.setPointerCapture(event.pointerId);
  });
  tab.addEventListener("pointermove", event => {
    if (!tab.hasPointerCapture(event.pointerId)) return;
    const delta = event.clientY - dragStartY;
    if (Math.abs(delta) > 5) moved = true;
    if (!moved) return;
    const top = Math.min(Math.max(startTop + delta, 8), window.innerHeight - 88);
    panel.style.top = `${top}px`;
  });
  tab.addEventListener("pointerup", event => {
    if (!tab.hasPointerCapture(event.pointerId)) return;
    tab.releasePointerCapture(event.pointerId);
    if (!moved) return;
    suppressClick = true;
    localStorage.setItem(storageKey, String(Math.round(panel.getBoundingClientRect().top)));
  });
  tab.addEventListener("click", () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    setOpen(body.hidden);
  });
  close.addEventListener("click", () => setOpen(false));
  document.body.append(panel);
}

function renderEvaluation(route) {
  const parts = route.split("/").filter(Boolean);
  activeRoute = evaluationPath;
  renderNavigation();
  if (parts.length === 1) evaluationList();
  else {
    const task = evaluationTasks.find(item => item.id === parts[1]);
    if (!task || task.audience !== "学生") { renderNotFound(); return; }
    if (parts.length === 2) evaluationDetail(task);
    else if (parts.length === 4 && parts[2] === "student") {
      const target = task.records.find(item => item.id === parts[3]);
      if (target) evaluationStudent(task, target);
      else renderNotFound();
    } else renderNotFound();
  }
  mainContent.scrollTo(0, 0);
}

initializeApp();
