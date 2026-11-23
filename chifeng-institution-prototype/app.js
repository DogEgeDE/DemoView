const menu = Array.isArray(window.MENU_CONFIG) ? window.MENU_CONFIG : [];
const navigation = document.getElementById("navigation");
const breadcrumb = document.getElementById("breadcrumb");
const pageContent = document.getElementById("page-content");
const mainContent = document.getElementById("main-content");
const toast = document.getElementById("toast");
const knownRoutes = new Map();
const openedGroups = new Set();
let activeRoute = null;
let toastTimer;

function validLabel(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validRoute(value) {
  return typeof value === "string" && /^\/[a-z0-9/-]+$/.test(value) && !value.includes("//") && value !== "/";
}

function collectRoutes() {
  const seenIds = new Set();
  for (const parent of menu) {
    if (!parent || !validLabel(parent.label) || !validLabel(parent.id) || seenIds.has(parent.id)) continue;
    seenIds.add(parent.id);
    const children = Array.isArray(parent.children) ? parent.children : [];
    const entries = children.length ? children : [parent];
    for (const node of entries) {
      if (!node || !validLabel(node.label) || !validLabel(node.id) || !validRoute(node.route) || knownRoutes.has(node.route)) continue;
      if (node !== parent && seenIds.has(node.id)) continue;
      if (node !== parent) seenIds.add(node.id);
      knownRoutes.set(node.route, { node, parent: children.length ? parent : null });
    }
  }
}

function currentRoute() {
  const hash = window.location.hash;
  if (!hash) return null;
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return "";
  }
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function makeNavLink(node, isChild, selected) {
  const link = createElement("a", `nav-item${isChild ? " nav-item--child" : ""}${selected ? " nav-item--active" : ""}`);
  link.href = `#${node.route}`;
  if (selected) link.setAttribute("aria-current", "page");
  link.append(createElement("span", "nav-item__dot"), createElement("span", "nav-item__label", node.label));
  return link;
}

function renderNavigation() {
  const fragment = document.createDocumentFragment();
  for (const group of menu) {
    if (!group || !validLabel(group.label) || !validLabel(group.id)) continue;
    const children = Array.isArray(group.children) ? group.children : [];
    if (!children.length) {
      if (knownRoutes.get(group.route)?.node === group) fragment.append(makeNavLink(group, false, activeRoute === group.route));
      continue;
    }
    const validChildren = children.filter(child => knownRoutes.get(child.route)?.node === child);
    if (!validChildren.length) continue;
    const wrapper = createElement("div", "nav-group");
    const hasActiveChild = validChildren.some(child => child.route === activeRoute);
    if (hasActiveChild) openedGroups.add(group.id);
    const expanded = openedGroups.has(group.id);
    const trigger = createElement("button", `nav-item nav-item--parent${hasActiveChild ? " nav-item--parent-open" : ""}`);
    trigger.type = "button";
    trigger.setAttribute("aria-expanded", String(expanded));
    trigger.setAttribute("aria-controls", `children-${group.id}`);
    trigger.append(createElement("span", "nav-item__dot"), createElement("span", "nav-item__label", group.label), createElement("span", "nav-item__chevron"));
    trigger.addEventListener("click", () => {
      if (openedGroups.has(group.id)) openedGroups.delete(group.id);
      else openedGroups.add(group.id);
      const isExpanded = openedGroups.has(group.id);
      trigger.setAttribute("aria-expanded", String(isExpanded));
      childContainer.hidden = !isExpanded;
    });
    const childContainer = createElement("div", "nav-children");
    childContainer.id = `children-${group.id}`;
    childContainer.hidden = !expanded;
    for (const child of validChildren) childContainer.append(makeNavLink(child, true, activeRoute === child.route));
    wrapper.append(trigger, childContainer);
    fragment.append(wrapper);
  }
  navigation.replaceChildren(fragment);
}

function renderBreadcrumb(labels, routes = []) {
  const items = ["工作台", ...labels];
  const itemRoutes = ["/", ...routes];
  const fragment = document.createDocumentFragment();
  items.forEach((label, index) => {
    if (index) fragment.append(createElement("span", "breadcrumb__separator", "/"));
    const isCurrent = index === items.length - 1;
    const route = isCurrent ? null : itemRoutes[index];
    if (route) {
      const link = createElement("a", "breadcrumb__link", label);
      link.href = `#${route}`;
      fragment.append(link);
    } else {
      fragment.append(createElement("span", isCurrent ? "breadcrumb__current" : "", label));
    }
  });
  breadcrumb.replaceChildren(fragment);
}

function makePanel(eyebrow, title, description) {
  const panel = createElement("section", "panel");
  if (eyebrow) panel.append(createElement("div", "panel__eyebrow", eyebrow));
  panel.append(createElement("h1", "", title));
  if (description) panel.append(createElement("p", "panel__description", description));
  return panel;
}

function renderHome() {
  renderBreadcrumb([]);
  const panel = makePanel("", "工作台");
  pageContent.replaceChildren(panel);
  document.title = "工作台 · XXXXX机构";
}

function renderPlaceholder(entry) {
  const { node, parent } = entry;
  renderBreadcrumb(parent ? [parent.label, node.label] : [node.label]);
  const panel = makePanel("", node.label);
  panel.append(createElement("div", "panel__rule"));
  const placeholder = createElement("div", "placeholder");
  const inside = createElement("div");
  inside.append(createElement("div", "placeholder__symbol", "·"), createElement("h2", "", "功能建设中"));
  placeholder.append(inside);
  panel.append(placeholder);
  pageContent.replaceChildren(panel);
  document.title = `${node.label} · XXXXX机构`;
}

function renderNotFound() {
  renderBreadcrumb(["页面未找到"]);
  const panel = makePanel("", "页面未找到");
  panel.append(createElement("div", "panel__rule"));
  const placeholder = createElement("div", "placeholder");
  const inside = createElement("div");
  inside.append(createElement("div", "placeholder__symbol", "?"), createElement("h2", "", "无法访问此页面"));
  placeholder.append(inside);
  panel.append(placeholder);
  pageContent.replaceChildren(panel);
  document.title = "页面未找到 · XXXXX机构";
}

function render() {
  const route = currentRoute();
  if (route === "/evaluation-tasks" || route?.startsWith("/evaluation-tasks/")) {
    renderEvaluation(route);
    return;
  }
  document.querySelectorAll(".rule-panel").forEach(panel => panel.remove());
  const entry = knownRoutes.get(route);
  activeRoute = entry ? route : null;
  if (entry?.parent) openedGroups.add(entry.parent.id);
  renderNavigation();
  if (route === null || route === "/") renderHome();
  else if (entry) renderPlaceholder(entry);
  else renderNotFound();
  mainContent.scrollTo(0, 0);
}

function initializeApp() {
  collectRoutes();
  window.addEventListener("hashchange", render);
  document.getElementById("logout-button").addEventListener("click", () => {
    toast.textContent = "当前为演示原型，暂未接入账号登出功能";
    toast.classList.add("toast--visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("toast--visible"), 3500);
  });
  render();
}
