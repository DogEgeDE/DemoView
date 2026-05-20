const activities = [
  {
    id: 1,
    name: "机构集体研学（活动一）",
    qr: false,
    grades: "一年级,二年级,三年级,...",
    price: "0.01",
    date: "2026-05-11 至 2026-05-31",
    signup: "需要报名",
    school: "吴哥测试小学1（市级）",
    bureau: "吴哥-测试教育局（市...）",
    online: false,
    status: "未提交",
    auditTime: "--"
  },
  {
    id: 2,
    name: "ceshi1333",
    qr: false,
    grades: "一年级,三年级,五年级",
    price: "1",
    date: "2026-05-16 至 2026-06-19",
    signup: "需要报名",
    school: "吴哥测试小学1（市级）",
    bureau: "吴哥-测试教育局（市...）",
    online: false,
    status: "未提交",
    auditTime: "--"
  },
  {
    id: 3,
    name: "集体研学（部分退款结算测试）",
    qr: true,
    grades: "一年级,二年级,三年级,...",
    price: "0.1",
    date: "2026-05-04 至 2026-05-11",
    signup: "需要报名",
    school: "吴哥测试小学1（市级）",
    bureau: "吴哥-测试教育局（市...）",
    online: false,
    status: "已通过",
    auditTime: "2026-05-11 09:30:48"
  },
  {
    id: 4,
    name: "部分退款测试1",
    qr: true,
    grades: "一年级,二年级,三年级,...",
    price: "0.1",
    date: "2026-05-07 至 2026-05-07",
    signup: "需要报名",
    school: "吴哥测试小学1（市级）",
    bureau: "吴哥-测试教育局（市...）",
    online: true,
    status: "已通过",
    auditTime: "2026-05-06 11:41:40"
  },
  {
    id: 5,
    name: "集体研学（预付款测试二）",
    qr: true,
    grades: "一年级,二年级,三年级,...",
    price: "0.01",
    date: "2026-07-01 至 2026-07-31",
    signup: "需要报名",
    school: "吴哥测试小学1（市级）",
    bureau: "吴哥-测试教育局（市...）",
    online: false,
    status: "已通过",
    auditTime: "2026-04-24 10:41:48"
  },
  {
    id: 6,
    name: "集体研学（预付款测试一）",
    qr: true,
    grades: "一年级,二年级,三年级,...",
    price: "0.01",
    date: "2026-06-01 至 2026-06-30",
    signup: "需要报名",
    school: "吴哥测试小学1（市级）",
    bureau: "吴哥-测试教育局（市...）",
    online: false,
    status: "已通过",
    auditTime: "2026-04-24 10:37:50"
  }
];

const rows = document.querySelector("#activityRows");

function renderActivityRows() {
  if (!rows) {
    return;
  }

  rows.innerHTML = activities.map((activity) => {
    const editAction = `<a href="./form.html?mode=edit&id=${activity.id}">编辑</a>`;
    const submitActions = activity.status === "未提交"
      ? '<button type="button">提交</button><button type="button">删除</button>'
      : '<button type="button">报备材料上传</button>';

    return `
      <tr>
        <td>
          <div class="activity-name">
            <span class="poster"></span>
            <span>${activity.name}</span>
          </div>
        </td>
        <td>${activity.qr ? '<span class="qr"></span>' : '--'}</td>
        <td>${activity.grades}</td>
        <td>${activity.price}</td>
        <td>${activity.date}</td>
        <td>${activity.signup}</td>
        <td>${activity.school}</td>
        <td>${activity.bureau}</td>
        <td><span class="switch ${activity.online ? "on" : ""}">${activity.online ? "开" : "关"}</span></td>
        <td>${activity.status}</td>
        <td>${activity.auditTime}</td>
        <td>
          <div class="operation">
            <button type="button">查看</button>
            ${editAction}
            ${submitActions}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function setupFormMode() {
  const form = document.querySelector(".activity-form");
  if (!form) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "edit" ? "edit" : "create";
  const title = mode === "edit" ? "活动编辑" : "活动创建";
  document.title = title;
  document.querySelector("#breadcrumbTitle").textContent = title;

  if (mode === "edit") {
    document.querySelector("#activityName").value = "机构集体研学（活动一）";
    document.querySelector("#price").value = "0.01";
    document.querySelector("#gradeSelect").value = "一年级,二年级,三年级";
  }

  setupEditWarnings(mode);
}

function showEditNotice(message) {
  const notice = document.querySelector("#editNotice");
  const messageNode = document.querySelector("#noticeMessage");
  messageNode.textContent = message;
  notice.showModal();
}

function setupEditWarnings(mode) {
  if (mode !== "edit") {
    return;
  }

  const priceInput = document.querySelector("#price");
  const gradeSelect = document.querySelector("#gradeSelect");
  const originalPrice = "0.01";
  const originalGrades = ["一年级", "二年级", "三年级"];
  let priceNoticeShown = false;
  let gradeNoticeShown = false;

  priceInput.addEventListener("input", () => {
    if (!priceNoticeShown && priceInput.value.trim() !== originalPrice) {
      priceNoticeShown = true;
      showEditNotice("修改价格后，已通过原价报名的学生，将会自动退款，请知悉");
    }
  });

  gradeSelect.addEventListener("change", () => {
    const selectedGrades = gradeSelect.value.split(",").filter(Boolean);
    const containsAllOriginalGrades = originalGrades.every((grade) => selectedGrades.includes(grade));
    if (!gradeNoticeShown && !containsAllOriginalGrades) {
      gradeNoticeShown = true;
      showEditNotice("当前修改年级不再包含原年级，原年级已报名学生将会自动退款，请知悉。");
    }
  });
}

renderActivityRows();
setupFormMode();
