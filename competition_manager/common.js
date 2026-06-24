var clients = {
  'center-base': {
    name: '中心基地',
    menu: [
      {id:'event-manage', label:'赛事管理', icon:'🏆', badge:'1', children:[
        {id:'event-list', label:'赛事列表'},
        {id:'review-scoring', label:'评审打分'}
      ]}
    ]
  },
  'education-bureau': {
    name: '教育局',
    menu: [
      {id:'event-manage', label:'赛事管理', icon:'🏆', children:[
        {id:'event-list', label:'赛事列表'},
        {id:'review-scoring', label:'评审打分'}
      ]}
    ]
  },
  'school': {
    name: '学校',
    menu: [
      {id:'event-manage', label:'赛事管理', icon:'🏆', badge:'1', children:[
        {id:'event-list', label:'赛事列表'},
        {id:'review-scoring', label:'评审打分'}
      ]}
    ]
  },
  'organization': {
    name: '机构',
    menu: [
      {id:'review-scoring', label:'评审打分', icon:'📝'}
    ]
  }
};

var currentClient = 'center-base';
var currentPage = 'event-list';
var detailTab = 'info';
var detailEventStage = 'submitting';
var isEditingRules = false;
var eventRecords = [
  {id: 1, name: '赛事比赛活动（乒乓球活动）', date: '2026-05-01 至 2026-07-31', status: '投稿中', statusClass: 'status-submitting', works: 0, online: true, stage: 'submitting', ownerType: 'center-base', ownerLabel: '中心基地'},
  {id: 2, name: '校园科技节创意大赛', date: '2026-06-15 至 2026-08-30', status: '未开始', statusClass: 'status-ended', works: 0, online: false, stage: 'not-started', ownerType: 'school', ownerLabel: '隆昌一小'},
  {id: 3, name: '书法绘画比赛', date: '2026-04-01 至 2026-06-15', status: '评选中', statusClass: 'status-reviewing', works: 156, online: true, stage: 'reviewing', ownerType: 'center-base', ownerLabel: '中心基地'}
];
var ruleConfig = {
  scoringMethod: '百分制',
  dimensions: [
    {name: '创意性', weight: 30, desc: '考察作品的创新思维和独特视角'},
    {name: '技术性', weight: 30, desc: '考察作品的技术实现水平'},
    {name: '艺术性', weight: 25, desc: '考察作品的审美和表现力'},
    {name: '实用性', weight: 15, desc: '考察作品的实际应用价值'}
  ],
  ruleText: '评委根据评分维度对作品进行打分，去掉最高分和最低分后取平均分作为最终得分。获奖名单根据最终得分排名确定。'
};
var roundCount = 3;
var judgeList = [
  {name: '王专家', meta: '高级教师 · 已分配 2 份作品'},
  {name: '李教授', meta: '研究员 · 已分配 1 份作品'}
];
var selectedJudgeName = '王专家';
var studentAssignments = [
  {student: '张三', school: '隆昌一小 / 六年级(1)班', work: '我的乒乓球之旅', judge: '王专家'},
  {student: '李四', school: '隆昌一中 / 初二(3)班', work: '科技小发明-智能垃圾桶', judge: '李教授'},
  {student: '王五', school: '隆昌二小 / 五年级(2)班', work: '环保主题海报设计', judge: ''}
];
var scoringRecords = {
  1: {eventName: '赛事比赛活动（乒乓球活动）', workName: '我的乒乓球之旅', student: '张三 / 隆昌一小 / 六年级(1)班', status: '待评分', scores: {creative: '', technical: '', artistic: '', practical: ''}, comment: '', total: '-'},
  2: {eventName: '校园科技节创意大赛', workName: '科技小发明-智能垃圾桶', student: '李四 / 隆昌一中 / 初二(3)班', status: '已评分', scores: {creative: 28, technical: 29, artistic: 22, practical: 13.5}, comment: '作品结构完整，创意和落地性较好，建议进一步补充应用场景说明。', total: '92.5'}
};
var pendingScoreData = null;
var roundNames = ['初赛', '复赛', '决赛', '半决赛', '加时赛', '终极赛'];
var dimensionNames = ['创意性', '技术性', '艺术性', '实用性', '完整性'];

var businessRules = {
  'event-list': {
    title: '赛事列表 - 业务规则',
    rules: [
      {tag: '数据隔离', title: '数据隔离规则', content: '中心基地创建的赛事只能基地编辑管理，学校创建的赛事只能学校编辑管理。教育局仅能查看所有赛事，不可操作。'},
      {tag: '上下架', title: '上下架规则', content: '上线状态下不可编辑和删除，需先下架后方可进行编辑或删除操作。'},
      {tag: '权限控制', title: '操作权限', content: '中心基地和学校端：查看、上架、下架、编辑、删除；教育局端：仅查看；机构端：无赛事列表。'}
    ]
  },
  'create-event': {
    title: '创建赛事 - 业务规则',
    rules: [
      {tag: '三步式流程', title: '创建流程', content: '基本信息 → 时间与轮次 → 评分与奖项，每步完成后点击下一步进入下一页。'},
      {tag: '轮次配置', title: '轮次规则', content: '支持单轮赛和多轮赛切换；多轮赛时轮次名称可自定义，但不可重复；可添加/删除轮次。'},
      {tag: '评分设置', title: '评分规则', content: '评分方式为全局设置（百分制/星级制）；评分维度可自定义添加，需配置维度名称、权重和说明。'},
      {tag: '特色功能', title: '特色功能', content: '社交化评价：开启后支持作品分享点赞；勋章：开启后可配置获奖勋章；证书：开启后可配置获奖证书。'},
      {tag: '参赛对象', title: '参赛对象', content: '使用复选框选择，支持小学、初中、高中多选项。'}
    ]
  },
  'review-scoring': {
    title: '评审打分 - 业务规则',
    rules: [
      {tag: '评分流程', title: '评分流程', content: '点击"去评分"进入评分页面 → 按维度填写分值 → 提交评分 → 二次确认（输入"确认"）→ 完成。'},
      {tag: '二次确认', title: '确认规则', content: '提交评分后需输入汉字"确认"完成最终提交，确认后不可再次编辑。'},
      {tag: '分值校验', title: '分值规则', content: '各维度分值不能超过该维度满分，系统自动计算总分。'},
      {tag: '查看评分', title: '查看规则', content: '已评分的作品只能查看，不可编辑修改。'}
    ]
  },
  'event-detail': {
    title: '赛事详情 - 业务规则',
    rules: [
      {tag: '评委管理', title: '评委规则', content: '可添加专家评委；为评委分配需评审的学生作品；勾选即确认分配，已分配给其他评委的学生不可再选。'},
      {tag: '规则编辑', title: '规则编辑', content: '仅投稿中阶段可编辑评选规则；进入评选打分阶段后规则锁定，不可修改。'},
      {tag: '作品查看', title: '作品查看', content: '参赛作品列表支持查看学生作品详情，包括作品预览、说明和附件。'},
      {tag: '排行榜', title: '排行榜规则', content: '按总得分排名展示，不显示获奖等级，仅展示排名顺序。'}
    ]
  }
};

function renderRulePanel() {
  var rules = businessRules[currentPage];
  if (!rules) return '';
  
  var ruleHtml = rules.rules.map(function(rule) {
    return '<div class="rule-item">' +
      '<div class="rule-tag">' + rule.tag + '</div>' +
      '<div class="rule-item-title">' + rule.title + '</div>' +
      '<div class="rule-item-content">' + rule.content + '</div>' +
      '</div>';
  }).join('');
  
  return '<div class="rule-panel" id="rule-panel">' +
    '<div class="rule-panel-header" onclick="toggleRulePanel()">' +
    '<span class="rule-panel-icon">📋</span>' +
    '<span class="rule-panel-title">' + rules.title + '</span>' +
    '<span class="rule-panel-toggle">›</span>' +
    '</div>' +
    '<div class="rule-panel-body">' +
    ruleHtml +
    '</div>' +
    '</div>';
}

function toggleRulePanel() {
  var panel = document.getElementById('rule-panel');
  if (panel) {
    panel.classList.toggle('collapsed');
  }
}

function renderSidebar() {
  var menu = clients[currentClient].menu;
  var html = '';
  
  menu.forEach(function(item) {
    var isActive = item.id === currentPage;
    var onClick = item.children ? 'toggleMenu(this)' : 'loadPage(\'' + item.id + '\', \'' + item.label + '\')';
    html += '<div class="menu-item' + (isActive ? ' active' : '') + '" onclick="' + onClick + '">';
    html += '<span class="icon">' + item.icon + '</span>';
    html += '<span>' + item.label + '</span>';
    if (item.badge) {
      html += '<span class="badge">' + item.badge + '</span>';
    }
    html += '</div>';

    if (item.children) {
      html += '<div class="sub-menu">';
      item.children.forEach(function(child) {
        var isChildActive = child.id === currentPage;
        html += '<div class="sub-menu-item' + (isChildActive ? ' active' : '') + '" onclick="loadPage(\'' + child.id + '\', \'' + child.label + '\')">';
        html += '<span>' + child.label + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }
  });

  document.getElementById('menu').innerHTML = html;
}

function toggleMenu(el) {
  el.classList.toggle('active');
}

function loadPage(pageId, pageLabel) {
  currentPage = pageId;
  renderSidebar();
  renderContent();
}

function renderContent() {
  var content = document.getElementById('content-area');
  var mainContent = '';
  switch(currentPage) {
    case 'event-list': mainContent = renderEventList(); break;
    case 'create-event': mainContent = renderCreateEvent(); break;
    case 'review-scoring': mainContent = renderReviewScoring(); break;
    case 'event-detail': mainContent = renderEventDetailPage(); break;
    default: mainContent = renderDefault();
  }
  content.innerHTML = '<div class="main-content-inner">' + mainContent + '</div>' + renderRulePanel();
}

function renderEventList() {
  var createBtn = (currentClient === 'education-bureau' || currentClient === 'organization') ? '' : '<button class="btn btn-primary" onclick="loadPage(\'create-event\', \'创建赛事\')">+ 创建赛事</button>';
  var rows = eventRecords.map(function(event, index) {
    return '<tr><td>' + (index + 1) + '</td><td>' + event.name + '</td><td>' + event.ownerLabel + '</td><td>' + event.date + '</td><td><span class="status-tag ' + event.statusClass + '">' + event.status + '</span></td><td>' + event.works + '</td><td><span class="status-tag ' + (event.online ? 'status-approved' : 'status-ended') + '">' + (event.online ? '已上架' : '已下架') + '</span></td><td class="action-links">' + renderEventActions(event) + '</td></tr>';
  }).join('');
  return '<div class="breadcrumb"><a href="#">首页</a><span>›</span><span>赛事管理</span></div>' +
    '<div class="card">' +
    '<div class="card-header"><div class="title">赛事列表</div>' + createBtn + '</div>' +
    '<div class="card-body">' +
    '<div class="search-bar">' +
    '<div class="search-group"><label>名称</label><input type="text" placeholder="请输入赛事名称进行查找"></div>' +
    '<div class="search-group"><label>起止日期</label><input type="date"><span style="margin:0 8px;">至</span><input type="date"></div>' +
    '<div class="search-group"><label>状态</label><select><option>请选择状态</option><option>未开始</option><option>投稿中</option><option>评选中</option><option>已结束</option></select></div>' +
    '<button class="btn btn-secondary">重置</button>' +
    '<button class="btn btn-primary">查询</button>' +
    '</div>' +
    '<div class="table-wrapper">' +
    '<table>' +
    '<thead><tr><th>序号</th><th>赛事名称</th><th>创建来源</th><th>起止日期</th><th>赛事状态</th><th>参赛作品数</th><th>上架状态</th><th>操作</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div></div>' +
    '<div class="pagination"><div class="info">共 ' + eventRecords.length + ' 条数据</div><div class="controls"><button disabled>上一页</button><button class="active">1</button><button disabled>下一页</button></div></div></div>';
}

function renderEventActions(event) {
  if (currentClient === 'education-bureau') {
    return '<a href="#" onclick="openEventDetailPage(\'' + event.stage + '\');return false;">查看</a>';
  }
  var actions = '<a href="#" onclick="openEventDetailPage(\'' + event.stage + '\');return false;">查看</a>';
  var canManage = event.ownerType === currentClient;
  if ((currentClient === 'center-base' || currentClient === 'school') && canManage) {
    if (event.online) {
      actions += '<a href="#" onclick="toggleEventOnline(' + event.id + ', false);return false;">下架</a>';
      actions += '<span class="action-disabled">编辑</span><span class="action-disabled">删除</span>';
    } else {
      actions += '<a href="#" onclick="toggleEventOnline(' + event.id + ', true);return false;">上架</a>';
      actions += '<a href="#" onclick="openEditEventModal(' + event.id + ');return false;">编辑</a>';
      actions += '<a href="#" onclick="deleteEventRecord(' + event.id + ');return false;">删除</a>';
    }
  } else if (currentClient === 'center-base' || currentClient === 'school') {
    actions += '<span class="action-disabled">非本端创建，不可管理</span>';
  }
  return actions;
}

function toggleEventOnline(id, online) {
  var event = getEventRecord(id);
  if (!event) return;
  if (event.ownerType !== currentClient) {
    alert('该赛事非本端创建，不能进行上下架管理');
    return;
  }
  event.online = online;
  alert(online ? '赛事已上架，上线状态下不可编辑和删除' : '赛事已下架，可进行编辑或删除');
  renderContent();
}

function openEditEventModal(id) {
  var event = getEventRecord(id);
  if (!event) return;
  if (event.ownerType !== currentClient) {
    alert('该赛事非本端创建，不能编辑');
    return;
  }
  if (event.online) {
    alert('上线状态下不可编辑，请先下架赛事');
    return;
  }
  openPrototypeModal('编辑赛事', '<div class="form-group"><label>赛事名称</label><input id="edit-event-name" type="text" value="' + event.name + '"></div>' +
    '<div class="form-group"><label>起止日期</label><input id="edit-event-date" type="text" value="' + event.date + '"></div>' +
    '<div class="form-group"><label>赛事状态</label><select id="edit-event-status"><option' + (event.status === '未开始' ? ' selected' : '') + '>未开始</option><option' + (event.status === '投稿中' ? ' selected' : '') + '>投稿中</option><option' + (event.status === '评选中' ? ' selected' : '') + '>评选中</option><option' + (event.status === '已结束' ? ' selected' : '') + '>已结束</option></select></div>' +
    '<div class="notice-tip">仅下架赛事可编辑，保存后赛事仍保持下架状态。</div>',
    '<button class="btn btn-secondary" onclick="closePrototypeModal()">取消</button><button class="btn btn-primary" onclick="saveEventEdit(' + id + ')">保存</button>');
}

function saveEventEdit(id) {
  var event = getEventRecord(id);
  if (!event || event.ownerType !== currentClient) {
    alert('该赛事非本端创建，不能编辑');
    return;
  }
  if (event.online) {
    alert('上线状态下不可编辑，请先下架赛事');
    return;
  }
  var name = document.getElementById('edit-event-name').value.trim();
  var date = document.getElementById('edit-event-date').value.trim();
  var status = document.getElementById('edit-event-status').value;
  if (!name || !date) {
    alert('请填写赛事名称和起止日期');
    return;
  }
  event.name = name;
  event.date = date;
  event.status = status;
  event.statusClass = getEventStatusClass(status);
  alert('赛事编辑保存成功');
  closePrototypeModal();
  renderContent();
}

function deleteEventRecord(id) {
  var event = getEventRecord(id);
  if (!event) return;
  if (event.ownerType !== currentClient) {
    alert('该赛事非本端创建，不能删除');
    return;
  }
  if (event.online) {
    alert('上线状态下不可删除，请先下架赛事');
    return;
  }
  if (confirm('确认删除该赛事吗？')) {
    eventRecords = eventRecords.filter(function(item) { return item.id !== id; });
    alert('赛事已删除');
    renderContent();
  }
}

function getEventRecord(id) {
  return eventRecords.find(function(item) { return item.id === id; });
}

function getEventStatusClass(status) {
  if (status === '投稿中') return 'status-submitting';
  if (status === '评选中') return 'status-reviewing';
  if (status === '已结束') return 'status-approved';
  return 'status-ended';
}

function renderCreateEvent() {
  return '<div class="breadcrumb"><a href="#">首页</a><span>›</span><a href="#" onclick="loadPage(\'event-list\',\'赛事列表\')">赛事管理</a><span>›</span><span>创建赛事</span></div>' +
    '<div class="card">' +
    '<div class="card-header"><div class="title">创建赛事</div><button class="btn btn-secondary" onclick="loadPage(\'event-list\',\'赛事列表\')">返回</button></div>' +
    '<div class="card-body">' +
    '<div class="step-indicator">' +
    '<div class="step active" data-step="1"><span class="step-num">1</span><span class="step-label">基本信息</span></div>' +
    '<div class="step-line"></div>' +
    '<div class="step" data-step="2"><span class="step-num">2</span><span class="step-label">时间与轮次</span></div>' +
    '<div class="step-line"></div>' +
    '<div class="step" data-step="3"><span class="step-num">3</span><span class="step-label">评分与奖项</span></div>' +
    '</div>' +
    '<div id="step-1" class="step-content">' +
    '<div class="form-group"><label>赛事名称 *</label><input type="text" placeholder="请输入赛事名称（2-50字）"></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label>赛事主题分类 *</label><input type="text" placeholder="请输入赛事主题分类"></div>' +
    '<div class="form-group"><label>参赛对象 *</label><div class="option-row"><label class="option-item"><input type="checkbox" name="target-audience" value="primary"> 小学</label><label class="option-item"><input type="checkbox" name="target-audience" value="junior"> 初中</label><label class="option-item"><input type="checkbox" name="target-audience" value="senior"> 高中</label></div></div>' +
    '</div>' +
    '<div class="form-group"><label>赛事封面</label><div class="upload-area">+ 上传封面</div></div>' +
    '<div class="form-group"><label>赛事简介 *</label><textarea placeholder="请输入赛事简介（最多2000字）"></textarea></div>' +
    '<div class="form-group"><label>赛事规则 *</label><textarea placeholder="请输入详细规则说明"></textarea></div>' +
    '<div class="form-actions"><button class="btn btn-secondary" onclick="loadPage(\'event-list\',\'赛事列表\')">取消</button><button class="btn btn-primary" onclick="goToStep(2)">下一步</button></div>' +
    '</div>' +
    '<div id="step-2" class="step-content" style="display:none;">' +
    '<div class="title" style="font-size:14px;margin-bottom:16px;">时间配置</div>' +
    '<div class="form-row-3">' +
    '<div class="form-group"><label>报名开始时间</label><input type="datetime-local"></div>' +
    '<div class="form-group"><label>报名结束时间</label><input type="datetime-local"></div>' +
    '<div class="form-group"><label>投稿开始时间</label><input type="datetime-local"></div>' +
    '<div class="form-group"><label>投稿结束时间</label><input type="datetime-local"></div>' +
    '<div class="form-group"><label>评选开始时间</label><input type="datetime-local"></div>' +
    '<div class="form-group"><label>公示开始时间</label><input type="datetime-local"></div>' +
    '</div>' +
    '<div class="title" style="font-size:14px;margin:24px 0 16px;">轮次配置</div>' +
    '<div class="form-group"><label>是否多轮赛</label>' +
    '<div class="option-row">' +
    '<label class="option-item"><input type="radio" name="is-multi-round" value="no" checked onchange="toggleRounds(this.value)"> 单轮赛（直接评选）</label>' +
    '<label class="option-item"><input type="radio" name="is-multi-round" value="yes" onchange="toggleRounds(this.value)"> 多轮赛（初赛→复赛→决赛）</label>' +
    '</div></div>' +
    '<div id="rounds-config" style="display:none;">' +
    '<div class="round-card" id="round-1">' +
    '<div class="round-card-header"><span class="round-num">第1轮</span><input type="text" class="round-name-input" value="初赛" onblur="validateRoundName(this)"> <button class="btn btn-secondary btn-sm" onclick="removeRound(this)">删除</button></div>' +
    '<div class="form-row-3">' +
    '<div class="form-group"><label>评选开始时间</label><input type="datetime-local" placeholder="请选择开始时间"></div>' +
    '<div class="form-group"><label>评选结束时间</label><input type="datetime-local" placeholder="请选择结束时间"></div>' +
    '<div class="form-group"><label>晋级名额</label><input type="number" placeholder="如：50" value="50"></div>' +
    '</div></div>' +
    '<div class="round-card" id="round-2">' +
    '<div class="round-card-header"><span class="round-num">第2轮</span><input type="text" class="round-name-input" value="复赛" onblur="validateRoundName(this)"> <button class="btn btn-secondary btn-sm" onclick="removeRound(this)">删除</button></div>' +
    '<div class="form-row-3">' +
    '<div class="form-group"><label>评选开始时间</label><input type="datetime-local" placeholder="请选择开始时间"></div>' +
    '<div class="form-group"><label>评选结束时间</label><input type="datetime-local" placeholder="请选择结束时间"></div>' +
    '<div class="form-group"><label>晋级名额</label><input type="number" placeholder="如：20" value="20"></div>' +
    '</div></div>' +
    '<div class="round-card" id="round-3">' +
    '<div class="round-card-header"><span class="round-num">第3轮</span><input type="text" class="round-name-input" value="决赛" onblur="validateRoundName(this)"> <button class="btn btn-secondary btn-sm" onclick="removeRound(this)">删除</button></div>' +
    '<div class="form-row-3">' +
    '<div class="form-group"><label>评选开始时间</label><input type="datetime-local" placeholder="请选择开始时间"></div>' +
    '<div class="form-group"><label>评选结束时间</label><input type="datetime-local" placeholder="请选择结束时间"></div>' +
    '<div class="form-group"><label>晋级名额</label><input type="number" placeholder="最终排名" value=""></div>' +
    '</div></div>' +
    '<button class="btn btn-secondary add-round-btn" onclick="addRound()">+ 添加轮次</button>' +
    '</div>' +
    '<div class="form-actions"><button class="btn btn-secondary" onclick="goToStep(1)">上一步</button><button class="btn btn-primary" onclick="goToStep(3)">下一步</button></div>' +
    '</div>' +
    '<div id="step-3" class="step-content" style="display:none;">' +
    '<div class="title" style="font-size:14px;margin-bottom:16px;">评分方式设置</div>' +
    '<div class="form-row"><div class="form-group"><label>评分方式 *</label><select><option>百分制</option><option>星级制</option></select></div></div>' +
    '<div class="title" style="font-size:14px;margin:24px 0 16px;">评分维度配置</div>' +
    '<div id="scoring-dimensions">' +
    '<div class="dimension-row">' +
    '<div class="form-row"><div class="form-group"><label>维度名称</label><input type="text" value="创意性"></div><div class="form-group"><label>权重(%)</label><input type="number" value="30"></div><div class="form-group"><label>操作</label><button class="btn btn-danger btn-sm" onclick="removeScoringDimension(this)">删除</button></div></div>' +
    '<div class="form-group"><label>维度说明</label><textarea placeholder="请输入该维度的评分标准说明"></textarea></div>' +
    '</div>' +
    '</div>' +
    '<button class="btn btn-secondary" style="margin-top:8px;" onclick="addScoringDimension()">+ 添加评分维度</button>' +
    '<div class="title" style="font-size:14px;margin:24px 0 16px;">特色功能设置</div>' +
    '<div class="feature-row">' +
    '<div class="feature-item">' +
    '<label>社交化评价</label>' +
    '<div class="option-row">' +
    '<label class="option-item"><input type="radio" name="social-eval" value="no" checked> 关闭</label>' +
    '<label class="option-item"><input type="radio" name="social-eval" value="yes"> 启用</label>' +
    '</div>' +
    '<span class="feature-desc">开启后，支持活动作品的分享和点赞功能</span>' +
    '</div>' +
    '</div>' +
    '<div class="feature-row">' +
    '<div class="feature-item">' +
    '<label>勋章</label>' +
    '<div class="option-row">' +
    '<label class="option-item"><input type="radio" name="medal" value="no" checked onchange="toggleMedalConfig(this.value)"> 关闭</label>' +
    '<label class="option-item"><input type="radio" name="medal" value="yes" onchange="toggleMedalConfig(this.value)"> 启用</label>' +
    '</div>' +
    '<a href="#" class="config-link" id="medal-config-link" style="display:none;" onclick="openMedalModal()">配置勋章</a>' +
    '<span class="feature-desc">开启后，可配置赛事获奖勋章</span>' +
    '</div>' +
    '</div>' +
    '<div class="feature-row">' +
    '<div class="feature-item">' +
    '<label>证书</label>' +
    '<div class="option-row">' +
    '<label class="option-item"><input type="radio" name="certificate" value="no" checked onchange="toggleCertificateConfig(this.value)"> 关闭</label>' +
    '<label class="option-item"><input type="radio" name="certificate" value="yes" onchange="toggleCertificateConfig(this.value)"> 启用</label>' +
    '</div>' +
    '<a href="#" class="config-link" id="cert-config-link" style="display:none;" onclick="openCertificateModal()">配置证书</a>' +
    '<span class="feature-desc">开启后，可配置赛事获奖证书</span>' +
    '</div>' +
    '</div>' +
    '<div class="form-actions"><button class="btn btn-secondary" onclick="goToStep(2)">上一步</button><button class="btn btn-secondary">保存草稿</button><button class="btn btn-primary">发布赛事</button></div>' +
    '</div>' +
    '</div></div>';
}

function renderReviewScoring() {
  var scoreStatus1 = scoringRecords[1].status === '已评分' ? '<span class="status-tag status-approved">已评分</span>' : '<span class="status-tag status-reviewing">待评分</span>';
  var scoreAction1 = scoringRecords[1].status === '已评分' ? '<a href="#" onclick="openScoreModal(1, true);return false;">查看评分</a>' : '<a href="#" onclick="openScoreModal(1, false);return false;">去评分</a>';
  return '<div class="breadcrumb"><a href="#">首页</a><span>›</span><span>赛事管理</span><span>›</span><span>评审打分</span></div>' +
    '<div class="card">' +
    '<div class="card-header"><div class="title">评审打分</div></div>' +
    '<div class="card-body">' +
    '<div class="search-bar">' +
    '<div class="search-group"><label>赛事</label><select><option>全部赛事</option><option>赛事比赛活动（乒乓球活动）</option><option>校园科技节创意大赛</option></select></div>' +
    '<button class="btn btn-secondary">重置</button>' +
    '<button class="btn btn-primary">查询</button>' +
    '</div>' +
    '<div class="table-wrapper">' +
    '<table>' +
    '<thead><tr><th>序号</th><th>赛事名称</th><th>作品名称</th><th>学生信息</th><th>评分状态</th><th>操作</th></tr></thead>' +
    '<tbody>' +
    '<tr><td>1</td><td>' + scoringRecords[1].eventName + '</td><td>' + scoringRecords[1].workName + '</td><td>' + scoringRecords[1].student + '</td><td>' + scoreStatus1 + '</td><td class="action-links">' + scoreAction1 + '</td></tr>' +
    '<tr><td>2</td><td>' + scoringRecords[2].eventName + '</td><td>' + scoringRecords[2].workName + '</td><td>' + scoringRecords[2].student + '</td><td><span class="status-tag status-approved">已评分</span></td><td class="action-links"><a href="#" onclick="openScoreModal(2, true);return false;">查看评分</a></td></tr>' +
    '</tbody></table></div></div>' +
    '<div class="pagination"><div class="info">共 2 条数据</div><div class="controls"><button disabled>上一页</button><button class="active">1</button><button disabled>下一页</button></div></div></div>';
}

function openScoreModal(id, readonly) {
  var record = scoringRecords[id];
  var disabled = readonly ? ' disabled' : '';
  var title = readonly ? '查看评分' : '去评分';
  var footer = readonly ? '<button class="btn btn-secondary" onclick="closePrototypeModal()">关闭</button>' : '<button class="btn btn-secondary" onclick="closePrototypeModal()">取消</button><button class="btn btn-primary" onclick="submitScore(' + id + ')">提交评分</button>';
  openPrototypeModal(title, '<div class="score-modal-view">' +
    '<div class="score-work-summary"><div><div class="score-work-title">' + record.workName + '</div><div class="score-work-meta">' + record.eventName + '</div><div class="score-work-meta">学生信息：' + record.student + '</div></div><button class="btn btn-secondary btn-sm" onclick="openWorkDetail(' + id + ')">查看作品</button></div>' +
    (readonly ? '<div class="score-lock-tip">评分已确认提交，不可再次编辑。</div>' : '') +
    '<div class="score-rule-tip">评分方式：百分制；请按各评分维度权重填写分值，系统自动汇总总分。提交后需二次确认，确认后不可编辑。</div>' +
    '<div class="score-dimension-list">' +
    renderScoreInput('creative', '创意性', 30, record.scores.creative, disabled) +
    renderScoreInput('technical', '技术性', 30, record.scores.technical, disabled) +
    renderScoreInput('artistic', '艺术性', 25, record.scores.artistic, disabled) +
    renderScoreInput('practical', '实用性', 15, record.scores.practical, disabled) +
    '</div>' +
    '<div class="score-total-row"><span>总分</span><strong id="score-total">' + record.total + '</strong></div>' +
    '<div class="form-group"><label>评审意见</label><textarea id="score-comment" placeholder="请输入评审意见"' + disabled + '>' + record.comment + '</textarea></div>' +
    '</div>', footer);
}

function renderScoreInput(key, name, max, value, disabled) {
  return '<div class="score-dimension-row"><div><div class="score-dimension-name">' + name + '</div><div class="score-dimension-desc">满分 ' + max + ' 分</div></div><input id="score-' + key + '" type="number" min="0" max="' + max + '" value="' + value + '" placeholder="0-' + max + '" oninput="updateScoreTotal()"' + disabled + '></div>';
}

function updateScoreTotal() {
  var keys = ['creative', 'technical', 'artistic', 'practical'];
  var total = 0;
  keys.forEach(function(key) {
    var input = document.getElementById('score-' + key);
    total += Number(input && input.value ? input.value : 0);
  });
  var totalEl = document.getElementById('score-total');
  if (totalEl) totalEl.innerText = total.toFixed(1).replace('.0', '');
}

function submitScore(id) {
  var limits = {creative: 30, technical: 30, artistic: 25, practical: 15};
  var scores = {};
  var total = 0;
  for (var key in limits) {
    var input = document.getElementById('score-' + key);
    var value = Number(input && input.value);
    if (input.value === '' || value < 0 || value > limits[key]) {
      alert('请填写有效分值，且不能超过维度满分');
      return;
    }
    scores[key] = value;
    total += value;
  }
  pendingScoreData = {
    id: id,
    scores: scores,
    comment: document.getElementById('score-comment').value,
    total: total.toFixed(1).replace('.0', '')
  };
  openPrototypeModal('确认提交评分', '<div class="confirm-score-box">' +
    '<div class="confirm-score-warning">评分提交后将不可再次编辑，请确认评分无误。</div>' +
    '<div class="confirm-score-summary"><span>作品名称</span><strong>' + scoringRecords[id].workName + '</strong></div>' +
    '<div class="confirm-score-summary"><span>本次总分</span><strong>' + pendingScoreData.total + ' 分</strong></div>' +
    '<div class="form-group"><label>请输入汉字“确认”完成最终提交</label><input id="score-confirm-text" type="text" placeholder="请输入：确认"></div>' +
    '</div>', '<button class="btn btn-secondary" onclick="pendingScoreData=null;closePrototypeModal()">取消</button><button class="btn btn-primary" onclick="confirmFinalScore()">确认提交</button>');
}

function confirmFinalScore() {
  var text = document.getElementById('score-confirm-text').value.trim();
  if (text !== '确认') {
    alert('请输入汉字“确认”后再提交');
    return;
  }
  var data = pendingScoreData;
  if (!data) return;
  scoringRecords[data.id].scores = data.scores;
  scoringRecords[data.id].comment = data.comment;
  scoringRecords[data.id].total = data.total;
  scoringRecords[data.id].status = '已评分';
  pendingScoreData = null;
  alert('评分已确认提交，后续不可编辑');
  closePrototypeModal();
  renderContent();
}

function openEventDetailPage(stage) {
  detailTab = 'info';
  isEditingRules = false;
  detailEventStage = stage || 'submitting';
  loadPage('event-detail', '赛事详情');
}

function getDetailStatusHtml() {
  if (detailEventStage === 'reviewing') {
    return '<span class="status-tag status-reviewing">评选中</span>';
  }
  if (detailEventStage === 'not-started') {
    return '<span class="status-tag status-ended">未开始</span>';
  }
  return '<span class="status-tag status-submitting">投稿中</span>';
}

function renderEventDetailPage() {
  return '<div class="breadcrumb"><a href="#">首页</a><span>›</span><span>赛事管理</span><span>›</span><span>赛事详情</span></div>' +
    '<div class="detail-header-card">' +
    '<div class="detail-header-left">' +
    '<img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20landscape%20mountains%20and%20sky%20scenic%20view&image_size=landscape_4_3" class="event-cover" alt="赛事封面">' +
    '<div class="event-info">' +
    '<h2 class="event-title">111111</h2>' +
    '<div class="event-meta"><span>起止日期：2026年06月10日 - 2026年06月30日</span></div>' +
    '<div class="event-meta"><span>投稿起止日期：2026年06月10日 - 2026年06月14日</span></div>' +
    '<div class="event-meta"><span>赛事状态：' + getDetailStatusHtml() + '</span></div>' +
    '</div></div>' +
    '<div class="detail-header-right">' +
    '<div class="stat-item"><span class="stat-num">0</span><span class="stat-label">参赛学校</span></div>' +
    '<div class="stat-item"><span class="stat-num">0</span><span class="stat-label">参赛学生</span></div>' +
    '<div class="stat-item"><span class="stat-num">0</span><span class="stat-label">参赛作品</span></div>' +
    '</div></div>' +
    '<div class="detail-tabs" style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid #e8e8e8;">' +
    '<div class="detail-tab' + (detailTab==='info'?' active':'') + '" onclick="switchDetailTab(\'info\')">赛事简介</div>' +
    '<div class="detail-tab' + (detailTab==='schools'?' active':'') + '" onclick="switchDetailTab(\'schools\')">参赛学校列表</div>' +
    '<div class="detail-tab' + (detailTab==='judges'?' active':'') + '" onclick="switchDetailTab(\'judges\')">专家评委</div>' +
    '<div class="detail-tab' + (detailTab==='rules'?' active':'') + '" onclick="switchDetailTab(\'rules\')">评选规则设置</div>' +
    '<div class="detail-tab' + (detailTab==='works'?' active':'') + '" onclick="switchDetailTab(\'works\')">参赛作品</div>' +
    '<div class="detail-tab' + (detailTab==='ranking'?' active':'') + '" onclick="switchDetailTab(\'ranking\')">赛事排行榜</div></div>' +
    renderDetailTabContent();
}

function renderDetailTabContent() {
  switch(detailTab) {
    case 'info': return renderDetailInfo();
    case 'schools': return renderDetailSchools();
    case 'judges': return renderDetailJudges();
    case 'rules': return renderDetailRules();
    case 'works': return renderDetailWorks();
    case 'ranking': return renderDetailRanking();
  }
}

function renderDetailInfo() {
  return '<div class="card"><div class="card-body">' +
    '<p style="font-size:13px;line-height:1.8;">111111111</p>' +
    '</div></div>';
}

function renderDetailSchools() {
  return '<div class="card"><div class="card-header"><div class="title">参赛学校列表</div></div>' +
    '<div class="card-body"><div class="table-wrapper"><table>' +
    '<thead><tr><th>序号</th><th>学校名称</th><th>参赛学生数</th><th>参赛作品数</th><th>状态</th></tr></thead>' +
    '<tbody><tr><td>1</td><td>隆昌一小</td><td>15</td><td>12</td><td><span class="status-tag status-approved">已报名</span></td></tr>' +
    '<tr><td>2</td><td>隆昌一中</td><td>20</td><td>18</td><td><span class="status-tag status-approved">已报名</span></td></tr>' +
    '<tr><td>3</td><td>隆昌二小</td><td>8</td><td>5</td><td><span class="status-tag status-submitting">报名中</span></td></tr>' +
    '</tbody></table></div></div>' +
    '<div class="pagination"><div class="info">共 3 条数据</div><div class="controls"><button disabled>上一页</button><button class="active">1</button><button disabled>下一页</button></div></div></div>';
}

function renderDetailJudges() {
  return '<div class="card"><div class="card-header"><div class="title">专家评委</div><button class="btn btn-primary btn-sm" onclick="showAddJudgePanel()">+ 添加评委</button></div>' +
    '<div class="card-body"><div class="assignment-layout">' +
    '<div class="judge-list-card"><div class="assign-meta" style="margin-bottom:8px;">已添加评委（' + judgeList.length + '人）</div>' +
    judgeList.map(function(judge) {
      return '<div class="judge-item' + (judge.name === selectedJudgeName ? ' active' : '') + '" onclick="selectJudge(this)" data-judge="' + judge.name + '"><div style="font-weight:600;">' + judge.name + '</div><div class="assign-meta">' + judge.meta + '</div></div>';
    }).join('') +
    '<div id="add-judge-panel" style="display:none;margin-top:12px;"><div class="form-group"><label>选择评委</label><select id="judge-select"><option value="">请选择评委</option><option value="张老师 / 体育教研员">张老师 / 体育教研员</option><option value="陈老师 / 市级骨干教师">陈老师 / 市级骨干教师</option></select></div><button class="btn btn-primary btn-sm" onclick="confirmAddJudge()">确认添加</button></div></div>' +
    '<div class="student-assign-card"><div class="assign-toolbar"><div><div style="font-weight:600;">为' + selectedJudgeName + '分配学生作品</div><div class="assign-meta">勾选即确认；其它评委已选择的学生会反显为已占用，并置灰不可选</div></div><span class="assign-auto-save">勾选即保存</span></div>' +
    '<div class="table-wrapper"><table><thead><tr><th><input type="checkbox"></th><th>学生</th><th>学校/班级</th><th>作品名称</th><th>分配状态</th></tr></thead><tbody>' + renderStudentAssignmentRows() +
    '</tbody></table></div></div></div></div></div>';
}

function renderStudentAssignmentRows() {
  return studentAssignments.map(function(item) {
    var isMine = item.judge === selectedJudgeName;
    var isOccupied = item.judge && item.judge !== selectedJudgeName;
    var checkbox = isOccupied ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" onchange="toggleStudentAssignment(\'' + item.student + '\', this.checked)"' + (isMine ? ' checked' : '') + '>';
    var status = isMine ? '<span class="status-tag status-approved">已分配给当前评委</span>' : (isOccupied ? '<span class="status-tag status-ended">已被' + item.judge + '选择</span>' : '<span class="status-tag status-submitting">未分配</span>');
    return '<tr class="' + (isOccupied ? 'assignment-disabled-row' : '') + '"><td>' + checkbox + '</td><td>' + item.student + '</td><td>' + item.school + '</td><td>' + item.work + '</td><td>' + status + '</td></tr>';
  }).join('');
}

function toggleStudentAssignment(studentName, checked) {
  var item = studentAssignments.find(function(row) {
    return row.student === studentName;
  });
  if (!item) return;
  item.judge = checked ? selectedJudgeName : '';
  renderContent();
}

function renderDetailRules() {
  var canEditRules = (currentClient === 'center-base' || currentClient === 'school') && detailEventStage === 'submitting';
  var editBtn = '';
  if (canEditRules) {
    editBtn = isEditingRules ? '<div class="rule-edit-actions"><button class="btn btn-secondary btn-sm" onclick="cancelRuleEdit()">取消</button><button class="btn btn-primary btn-sm" onclick="saveRuleEdit()">保存</button></div>' : '<button class="btn btn-primary btn-sm" onclick="startRuleEdit()">编辑</button>';
  } else if (currentClient === 'center-base' || currentClient === 'school') {
    editBtn = '<span class="rule-lock-tip">当前阶段不可编辑，进入评选打分阶段后规则将锁定</span>';
  }

  if (isEditingRules && canEditRules) {
    return '<div class="card"><div class="card-body">' +
      '<div class="detail-section"><div class="detail-section-title"><span>评分方式</span>' + editBtn + '</div>' +
      '<div class="form-row"><div class="form-group"><label>评分方式</label><select id="edit-scoring-method"><option' + (ruleConfig.scoringMethod === '百分制' ? ' selected' : '') + '>百分制</option><option' + (ruleConfig.scoringMethod === '星级制' ? ' selected' : '') + '>星级制</option></select></div></div></div>' +
      '<div class="detail-section"><div class="detail-section-title"><span>评分维度</span><button class="btn btn-secondary btn-sm" onclick="addRuleDimensionEdit()">+ 添加维度</button></div>' +
      '<div id="rule-dimension-editor">' + renderRuleDimensionEditor() + '</div></div>' +
      '<div class="detail-section"><div class="detail-section-title">评选规则</div>' +
      '<div class="form-group"><textarea id="edit-rule-text">' + ruleConfig.ruleText + '</textarea></div></div>' +
      '</div></div>';
  }

  return '<div class="card"><div class="card-body">' +
    '<div class="detail-section"><div class="detail-section-title"><span>评分方式</span>' + editBtn + '</div>' +
    '<div style="font-size:13px;">' + ruleConfig.scoringMethod + '</div></div>' +
    '<div class="detail-section"><div class="detail-section-title">评分维度</div>' +
    '<div style="font-size:13px;line-height:2;">' + ruleConfig.dimensions.map(function(item) {
      return '<p>' + item.name + '：' + item.weight + '% - ' + item.desc + '</p>';
    }).join('') + '</div></div>' +
    '<div class="detail-section"><div class="detail-section-title">评选规则</div>' +
    '<div style="font-size:13px;line-height:1.8;">' + ruleConfig.ruleText + '</div></div>' +
    '</div></div>';
}

function renderRuleDimensionEditor() {
  return ruleConfig.dimensions.map(function(item, index) {
    return '<div class="rule-dimension-edit-row" data-index="' + index + '">' +
      '<div class="form-row-3">' +
      '<div class="form-group"><label>维度名称</label><input class="rule-dim-name" value="' + item.name + '"></div>' +
      '<div class="form-group"><label>权重(%)</label><input class="rule-dim-weight" type="number" value="' + item.weight + '"></div>' +
      '<div class="form-group"><label>操作</label><button class="btn btn-danger btn-sm" onclick="removeRuleDimensionEdit(this)">删除</button></div>' +
      '</div>' +
      '<div class="form-group"><label>维度说明</label><textarea class="rule-dim-desc">' + item.desc + '</textarea></div>' +
      '</div>';
  }).join('');
}

function startRuleEdit() {
  if (detailEventStage !== 'submitting') {
    alert('评选打分阶段不可编辑评选规则');
    return;
  }
  isEditingRules = true;
  renderContent();
}

function cancelRuleEdit() {
  isEditingRules = false;
  renderContent();
}

function addRuleDimensionEdit() {
  ruleConfig.dimensions.push({name: '新维度', weight: 10, desc: '请输入该维度的评分说明'});
  renderContent();
}

function removeRuleDimensionEdit(btn) {
  if (ruleConfig.dimensions.length <= 1) {
    alert('至少保留一个评分维度');
    return;
  }
  var row = btn.closest('.rule-dimension-edit-row');
  var index = parseInt(row.getAttribute('data-index'), 10);
  ruleConfig.dimensions.splice(index, 1);
  renderContent();
}

function saveRuleEdit() {
  var dimensions = [];
  var rows = document.querySelectorAll('.rule-dimension-edit-row');
  rows.forEach(function(row) {
    dimensions.push({
      name: row.querySelector('.rule-dim-name').value.trim() || '未命名维度',
      weight: Number(row.querySelector('.rule-dim-weight').value) || 0,
      desc: row.querySelector('.rule-dim-desc').value.trim() || '暂无说明'
    });
  });
  ruleConfig.scoringMethod = document.getElementById('edit-scoring-method').value;
  ruleConfig.dimensions = dimensions;
  ruleConfig.ruleText = document.getElementById('edit-rule-text').value.trim() || ruleConfig.ruleText;
  isEditingRules = false;
  alert('评选规则已保存');
  renderContent();
}

function renderDetailWorks() {
  return '<div class="card"><div class="card-header"><div class="title">参赛作品</div><div class="search-bar">' +
    '<div class="search-group"><label>学校</label><select><option>全部学校</option><option>隆昌一小</option><option>隆昌一中</option></select></div>' +
    '<button class="btn btn-secondary">筛选</button></div></div>' +
    '<div class="card-body"><div class="table-wrapper"><table>' +
    '<thead><tr><th>序号</th><th>学生姓名</th><th>学校/班级</th><th>作品名称</th><th>作品状态</th><th>得分</th><th>操作</th></tr></thead>' +
    '<tbody><tr><td>1</td><td>张三</td><td>隆昌一小 / 六年级(1)班</td><td>我的乒乓球之旅</td><td><span class="status-tag status-approved">已提交</span></td><td>-</td><td class="action-links"><a href="#" onclick="openWorkDetail(1);return false;">查看</a></td></tr>' +
    '<tr><td>2</td><td>李四</td><td>隆昌一中 / 初二(3)班</td><td>科技小发明-智能垃圾桶</td><td><span class="status-tag status-approved">已提交</span></td><td>92.5</td><td class="action-links"><a href="#" onclick="openWorkDetail(2);return false;">查看</a></td></tr>' +
    '<tr><td>3</td><td>王五</td><td>隆昌二小 / 五年级(2)班</td><td>环保主题海报设计</td><td><span class="status-tag status-submitting">评审中</span></td><td>88.0</td><td class="action-links"><a href="#" onclick="openWorkDetail(3);return false;">查看</a></td></tr>' +
    '</tbody></table></div></div>' +
    '<div class="pagination"><div class="info">共 3 条数据</div><div class="controls"><button disabled>上一页</button><button class="active">1</button><button disabled>下一页</button></div></div></div>';
}

function openWorkDetail(id) {
  var works = {
    1: {student: '张三', school: '隆昌一小 / 六年级(1)班', title: '我的乒乓球之旅', status: '已提交', score: '-', type: '视频作品', submitTime: '2026-06-15 10:30', desc: '一段3分钟的乒乓球训练视频，包括发球、接球和比赛技巧展示。', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=table%20tennis%20training%20student%20video%20cover&image_size=landscape_16_9'},
    2: {student: '李四', school: '隆昌一中 / 初二(3)班', title: '科技小发明-智能垃圾桶', status: '已提交', score: '92.5', type: '图文作品', submitTime: '2026-06-18 14:20', desc: '通过传感器识别垃圾投放动作，完成自动开盖和分类提示。', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20trash%20bin%20student%20science%20project&image_size=landscape_16_9'},
    3: {student: '王五', school: '隆昌二小 / 五年级(2)班', title: '环保主题海报设计', status: '评审中', score: '88.0', type: '图片作品', submitTime: '2026-06-20 09:15', desc: '围绕绿色校园主题设计环保宣传海报，倡导节约资源和垃圾分类。', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=environmental%20poster%20design%20student%20artwork&image_size=landscape_16_9'}
  };
  var work = works[id] || works[1];
  openPrototypeModal('学生作品详情', '<div class="work-detail-view">' +
    '<img class="work-preview-cover" src="' + work.cover + '" alt="作品预览">' +
    '<div class="work-detail-title">' + work.title + '</div>' +
    '<div class="work-detail-meta"><span>学生：' + work.student + '</span><span>学校/班级：' + work.school + '</span><span>作品类型：' + work.type + '</span><span>提交时间：' + work.submitTime + '</span><span>作品状态：' + work.status + '</span><span>得分：' + work.score + '</span></div>' +
    '<div class="work-detail-section"><div class="work-detail-section-title">作品说明</div><div>' + work.desc + '</div></div>' +
    '<div class="work-detail-section"><div class="work-detail-section-title">作品附件</div><div class="work-file-card">📎 ' + work.title + ' 附件文件</div></div>' +
    '</div>');
}

function openPrototypeModal(title, bodyHtml, footerHtml) {
  closePrototypeModal();
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'prototype-modal-overlay';
  overlay.innerHTML = '<div class="modal-content work-modal"><div class="modal-header"><div class="modal-title">' + title + '</div><button class="modal-close" onclick="closePrototypeModal()">×</button></div><div class="modal-body">' + bodyHtml + '</div><div class="modal-footer">' + (footerHtml || '<button class="btn btn-secondary" onclick="closePrototypeModal()">关闭</button>') + '</div></div>';
  document.body.appendChild(overlay);
}

function closePrototypeModal() {
  var modal = document.getElementById('prototype-modal-overlay');
  if (modal) modal.remove();
}

function renderDetailRanking() {
  return '<div class="card"><div class="card-header"><div class="title">赛事排行榜</div></div>' +
    '<div class="card-body"><div class="table-wrapper"><table>' +
    '<thead><tr><th>排名</th><th>学生姓名</th><th>学校</th><th>作品名称</th><th>总得分</th></tr></thead>' +
    '<tbody><tr><td style="font-weight:700;color:#d97706;">1</td><td>张三</td><td>隆昌一小</td><td>我的乒乓球之旅</td><td>96.5</td></tr>' +
    '<tr><td style="font-weight:600;">2</td><td>李四</td><td>隆昌一中</td><td>科技小发明-智能垃圾桶</td><td>92.5</td></tr>' +
    '<tr><td style="font-weight:600;">3</td><td>王五</td><td>隆昌二小</td><td>环保主题海报设计</td><td>88.0</td></tr>' +
    '</tbody></table></div></div>' +
    '<div class="pagination"><div class="info">共 15 条数据</div><div class="controls"><button disabled>上一页</button><button class="active">1</button><button>2</button><button disabled>下一页</button></div></div></div>';
}

function switchDetailTab(tab) {
  detailTab = tab;
  renderContent();
}

function selectJudge(el) {
  selectedJudgeName = el.getAttribute('data-judge') || selectedJudgeName;
  renderContent();
}

function renderDefault() {
  return '<div class="breadcrumb"><a href="#">首页</a><span>›</span><span>数据看板</span></div>' +
    '<div class="stats-grid">' +
    '<div class="stat-card"><div class="label">今日活动</div><div class="value">12</div><div class="trend up">↑ 3 昨日</div></div>' +
    '<div class="stat-card"><div class="label">本周参与</div><div class="value">256</div><div class="trend up">↑ 12%</div></div>' +
    '<div class="stat-card"><div class="label">待审批</div><div class="value">5</div><div class="trend down">↓ 2</div></div>' +
    '<div class="stat-card"><div class="label">本月完成</div><div class="value">1,234</div><div class="trend up">↑ 8%</div></div>' +
    '</div>' +
    '<div class="card">' +
    '<div class="card-header"><div class="title">活动趋势</div></div>' +
    '<div class="card-body" style="height:250px;display:flex;align-items:center;justify-content:center;background:#f8fafc;"><div style="text-align:center;color:#999;"><div style="font-size:48px;margin-bottom:12px;">📊</div><div>活动趋势图表</div></div></div></div>';
}

function showAddJudgePanel() {
  var panel = document.getElementById('add-judge-panel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function confirmAddJudge() {
  var select = document.getElementById('judge-select');
  if (!select || !select.value) {
    alert('请选择评委');
    return;
  }

  var parts = select.value.split(' / ');
  var name = parts[0];
  var title = parts[1] || '评委';
  var exists = judgeList.some(function(judge) {
    return judge.name === name;
  });

  if (exists) {
    alert('该评委已添加');
    return;
  }

  judgeList.push({name: name, meta: title + ' · 已分配 0 份作品'});
  alert('评委添加成功');
  renderContent();
  setTimeout(function() {
    var panel = document.getElementById('add-judge-panel');
    if (panel) panel.style.display = 'block';
  }, 0);
}

function toggleRounds(value) {
  var configDiv = document.getElementById('rounds-config');
  if (value === 'yes') {
    configDiv.style.display = 'block';
  } else {
    configDiv.style.display = 'none';
  }
}

function goToStep(stepNum) {
  document.querySelectorAll('.step-content').forEach(function(el) {
    el.style.display = 'none';
  });
  document.getElementById('step-' + stepNum).style.display = 'block';

  document.querySelectorAll('.step').forEach(function(el) {
    el.classList.remove('active');
  });
  document.querySelector('.step[data-step="' + stepNum + '"]').classList.add('active');
}

function addScoringDimension() {
  var container = document.getElementById('scoring-dimensions');
  var dimensions = container.querySelectorAll('.dimension-row');
  var nextIndex = dimensions.length;
  var nextName = dimensionNames[nextIndex] || ('维度' + (nextIndex + 1));
  var nextWeight = Math.floor(100 / (nextIndex + 1));

  var dimensionHtml = '<div class="dimension-row">' +
    '<div class="form-row"><div class="form-group"><label>维度名称</label><input type="text" value="' + nextName + '"></div><div class="form-group"><label>权重(%)</label><input type="number" value="' + nextWeight + '"></div><div class="form-group"><label>操作</label><button class="btn btn-danger btn-sm" onclick="removeScoringDimension(this)">删除</button></div></div>' +
    '<div class="form-group"><label>维度说明</label><textarea placeholder="请输入该维度的评分标准说明"></textarea></div>' +
    '</div>';

  container.insertAdjacentHTML('beforeend', dimensionHtml);
}

function removeScoringDimension(btn) {
  var row = btn.closest('.dimension-row');
  if (row) {
    var container = document.getElementById('scoring-dimensions');
    var dimensions = container.querySelectorAll('.dimension-row');
    if (dimensions.length > 1) {
      row.remove();
    } else {
      alert('至少保留一个评分维度');
    }
  }
}

function addRound() {
  var configDiv = document.getElementById('rounds-config');
  var rounds = configDiv.querySelectorAll('.round-card');
  var nextRoundNum = rounds.length + 1;
  var nextRoundName = roundNames[nextRoundNum - 1] || ('第' + nextRoundNum + '轮');
  
  var roundHtml = '<div class="round-card" id="round-' + nextRoundNum + '">' +
    '<div class="round-card-header"><span class="round-num">第' + nextRoundNum + '轮</span><input type="text" class="round-name-input" value="' + nextRoundName + '" onblur="validateRoundName(this)"> <button class="btn btn-secondary btn-sm" onclick="removeRound(this)">删除</button></div>' +
    '<div class="form-row-3">' +
    '<div class="form-group"><label>评选开始时间</label><input type="datetime-local" placeholder="请选择开始时间"></div>' +
    '<div class="form-group"><label>评选结束时间</label><input type="datetime-local" placeholder="请选择结束时间"></div>' +
    '<div class="form-group"><label>晋级名额</label><input type="number" placeholder="如：10" value=""></div>' +
    '</div></div>';
  
  var addBtn = configDiv.querySelector('.add-round-btn');
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = roundHtml;
  configDiv.insertBefore(tempDiv.firstElementChild, addBtn);
}

function removeRound(btn) {
  var roundDiv = btn.closest('.round-card');
  if (roundDiv) {
    var configDiv = document.getElementById('rounds-config');
    var rounds = configDiv.querySelectorAll('.round-card');
    if (rounds.length > 1) {
      roundDiv.remove();
      renumberRounds();
    } else {
      alert('至少保留一个轮次');
    }
  }
}

function renumberRounds() {
  var configDiv = document.getElementById('rounds-config');
  var rounds = configDiv.querySelectorAll('.round-card');
  rounds.forEach(function(round, index) {
    var num = index + 1;
    round.querySelector('.round-num').textContent = '第' + num + '轮';
    round.id = 'round-' + num;
  });
}

function validateRoundName(input) {
  var value = input.value.trim();
  if (!value) {
    input.classList.add('error');
    alert('轮次名称不能为空');
    input.focus();
    return;
  }

  var configDiv = document.getElementById('rounds-config');
  var allInputs = configDiv.querySelectorAll('.round-name-input');
  var hasDuplicate = false;

  allInputs.forEach(function(otherInput) {
    if (otherInput !== input && otherInput.value.trim() === value) {
      hasDuplicate = true;
    }
  });

  if (hasDuplicate) {
    input.classList.add('error');
    alert('轮次名称不能重复');
    input.focus();
  } else {
    input.classList.remove('error');
  }
}

function toggleMedalConfig(value) {
  var link = document.getElementById('medal-config-link');
  link.style.display = value === 'yes' ? 'inline-block' : 'none';
}

function toggleCertificateConfig(value) {
  var link = document.getElementById('cert-config-link');
  link.style.display = value === 'yes' ? 'inline-block' : 'none';
}

function openMedalModal() {
  var modalHtml = '<div class="modal-overlay" onclick="closeModal()"><div class="modal-content" onclick="event.stopPropagation()">' +
    '<div class="modal-header"><div class="modal-title">配置勋章</div><button class="modal-close" onclick="closeModal()">×</button></div>' +
    '<div class="modal-body">' +
    '<div class="config-grid">' +
    '<div class="config-item"><input type="checkbox" id="medal-1"><label for="medal-1"><div class="medal-icon">🏆</div><div class="medal-name">冠军勋章</div><div class="medal-desc">获得第一名</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="medal-2"><label for="medal-2"><div class="medal-icon">🥈</div><div class="medal-name">亚军勋章</div><div class="medal-desc">获得第二名</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="medal-3"><label for="medal-3"><div class="medal-icon">🥉</div><div class="medal-name">季军勋章</div><div class="medal-desc">获得第三名</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="medal-4"><label for="medal-4"><div class="medal-icon">⭐</div><div class="medal-name">优秀奖勋章</div><div class="medal-desc">获得优秀奖</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="medal-5"><label for="medal-5"><div class="medal-icon">🔥</div><div class="medal-name">人气王勋章</div><div class="medal-desc">获得最高点赞</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="medal-6"><label for="medal-6"><div class="medal-icon">💡</div><div class="medal-name">创意之星勋章</div><div class="medal-desc">创意评分最高</div></label></div>' +
    '</div>' +
    '</div>' +
    '<div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">取消</button><button class="btn btn-primary" onclick="closeModal()">确认</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openCertificateModal() {
  var modalHtml = '<div class="modal-overlay" onclick="closeModal()"><div class="modal-content" onclick="event.stopPropagation()">' +
    '<div class="modal-header"><div class="modal-title">配置证书</div><button class="modal-close" onclick="closeModal()">×</button></div>' +
    '<div class="modal-body">' +
    '<div class="config-grid">' +
    '<div class="config-item"><input type="checkbox" id="cert-1"><label for="cert-1"><div class="cert-icon">📜</div><div class="cert-name">一等奖证书</div><div class="cert-desc">获得一等奖颁发</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="cert-2"><label for="cert-2"><div class="cert-icon">📜</div><div class="cert-name">二等奖证书</div><div class="cert-desc">获得二等奖颁发</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="cert-3"><label for="cert-3"><div class="cert-icon">📜</div><div class="cert-name">三等奖证书</div><div class="cert-desc">获得三等奖颁发</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="cert-4"><label for="cert-4"><div class="cert-icon">📑</div><div class="cert-name">优秀奖证书</div><div class="cert-desc">获得优秀奖颁发</div></label></div>' +
    '<div class="config-item"><input type="checkbox" id="cert-5"><label for="cert-5"><div class="cert-icon">🎖️</div><div class="cert-name">参与证书</div><div class="cert-desc">参与赛事即可获得</div></label></div>' +
    '</div>' +
    '</div>' +
    '<div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">取消</button><button class="btn btn-primary" onclick="closeModal()">确认</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeModal() {
  var overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.remove();
  }
}