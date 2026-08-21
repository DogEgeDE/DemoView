(function () {
  const rules = {
    index: {
      title: '告家长书管理 - 业务规则',
      rules: [
        ['模板管理', '模板按使用场景管理，运营人员可创建、编辑、查看、启用或停用模板。'],
        ['授权范围', '模板授权至教育局后，在该教育局辖区内的学校和机构可引用；未授权主体不可见、不可选。'],
        ['停启用', '停用或撤销授权仅限制后续活动引用，不影响已引用活动的通知书快照和既有签署记录。'],
        ['数据隔离', '每个模板的教育局授权范围独立保存，授权数量按该模板当前已授权教育局数量计算。']
      ]
    },
    edit: {
      title: '模板编辑 - 业务规则',
      rules: [
        ['必填校验', '模板名称、使用场景和模板内容为必填项；模板名称在同一使用场景内不可重复。'],
        ['内容格式', '模板以 Markdown 编辑和存储；家长端展示时渲染为可阅读内容。'],
        ['活动变量', '活动名称、出行时间、地点和费用等变量在活动引用时替换为活动实际数据。'],
        ['版本快照', '活动引用模板后生成独立通知书快照，后续模板修改不会同步影响该活动。']
      ]
    },
    detail: {
      title: '模板详情 - 业务规则',
      rules: [
        ['查看范围', '详情展示模板当前版本、使用场景、停启用状态和正文内容。'],
        ['变量说明', '正文内活动变量仅作为模板占位符，实际家长通知书以活动数据替换后的快照为准。'],
        ['历史留存', '活动已引用的模板内容及家长签署凭证独立留存，不受模板后续修改、停用或撤权影响。']
      ]
    },
    'school-create': {
      title: '学校活动创建 - 业务规则',
      rules: [
        ['模板可用性', '仅可选择本校所属教育局已授权且处于启用状态的集体研学活动模板。'],
        ['活动快照', '选定模板后自动复制名称和内容；后续编辑仅作用于当前活动，不回写原模板。'],
        ['阅读策略', '可配置“是否强制阅读”。选择强制阅读时，需设置 1—300 秒倒计时；选择不强制阅读时，家长可直接进入签字。'],
        ['无需报名', '活动设为“不需要报名”时，不进入家长报名、告家长书阅读和签署流程。']
      ]
    },
    'institution-create': {
      title: '机构活动创建 - 业务规则',
      rules: [
        ['发布范围', '使用区域、适用学校和年级共同决定活动可见范围；机构仅可选择自身被授权的区域和学校。'],
        ['模板可用性', '仅可选择所属教育局已授权且启用的模板，引用后生成当前活动独立快照。'],
        ['阅读策略', '可配置“是否强制阅读”。开启时须设置 1—300 秒整数倒计时，默认 15 秒；家长倒计时归零后方可签字。关闭时不展示倒计时，家长可直接进入签字。'],
        ['无需报名', '活动设为“不需要报名”时，不触发家长报名、通知书阅读与签署。']
      ]
    },
    'school-activity-detail': {
      title: '学校名册与签署记录 - 业务规则',
      rules: [
        ['名册范围', '仅展示本校该活动的报名学生；支持按年级、班级和学生姓名筛选。'],
        ['签署留痕', '告家长书需关联活动、学生、家长、通知书快照、签署时间和签名，支持追溯。'],
        ['内容锁定', '任一学生完成签署后，该活动的告家长书内容锁定，不可再编辑。'],
        ['PDF存证', '下载 PDF 应包含活动变量替换后的通知书、家长签名和签署时间。']
      ]
    },
    'institution-activity-detail': {
      title: '机构名册与签署记录 - 业务规则',
      rules: [
        ['数据范围', '机构仅可查看自身创建且适用学校范围内的活动及报名学生。'],
        ['签署留痕', '每份签署记录关联活动、学生、家长、通知书快照、签署时间和签名。'],
        ['内容锁定', '任一学生完成签署后，该活动通知书锁定，不可再编辑。'],
        ['PDF存证', '下载 PDF 应输出通知书正文、活动实际数据、签名和签署时间。']
      ]
    },
    parent: {
      title: '活动报名与签署 - 业务规则',
      rules: [
        ['报名流程', '需要报名的活动：确认报名信息 → 阅读告家长书 → 电子签署 → 创建订单/支付。'],
        ['阅读策略', '以活动保存的配置为准：开启强制阅读时，家长须完成设置的 1—300 秒倒计时后才可签字；关闭时不展示倒计时，可直接进入签字。'],
        ['电子签名', '签名页必须完成有效笔迹后才可保存；保存后关联当前学生、活动、通知书快照和签署时间。'],
        ['无需报名', '活动设为“不需要报名”时，不展示报名、阅读和签署流程。']
      ]
    }
  };

  const key = location.pathname.split('/').pop().replace('.html', '') || 'index';
  const config = rules[key];
  if (!config) return;
  const isMobile = key === 'parent';
  const items = config.rules.map(([tag, content]) => `<div class="br-item"><span class="br-tag">${tag}</span><div>${content}</div></div>`).join('');
  const css = `
    .br-trigger{position:fixed;right:18px;bottom:76px;z-index:80;width:44px;height:44px;border:0;border-radius:50%;background:#2563eb;color:#fff;font-size:18px;box-shadow:0 4px 12px rgba(37,99,235,.3);cursor:pointer}.br-modal{display:none;position:fixed;z-index:200;inset:0;background:rgba(0,0,0,.5)}.br-modal.show{display:flex;align-items:flex-end;justify-content:center}.br-sheet{width:min(430px,100%);max-height:70vh;background:#fff;border-radius:16px 16px 0 0;overflow:hidden}.br-head{height:52px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eee;font-weight:600}.br-close{border:0;background:transparent;font-size:24px;color:#8c8c8c;cursor:pointer}.br-body{max-height:calc(70vh - 52px);padding:14px 16px;overflow:auto}.br-item{margin-bottom:12px;padding:10px;background:#f8fafc;border-left:3px solid #60a5fa;border-radius:6px;color:#4b5563;font-size:13px;line-height:1.65}.br-tag{display:inline-block;margin-bottom:4px;padding:1px 6px;border-radius:3px;background:#dbeafe;color:#1d4ed8;font-size:11px}
    .br-panel{position:fixed;top:92px;right:0;z-index:80;width:280px;max-height:calc(100vh - 110px);background:#fffbeb;border-left:3px solid #fbbf24;box-shadow:0 4px 18px rgba(0,0,0,.1);overflow:auto;transition:transform .25s}.br-panel.closed{transform:translateX(240px)}.br-panel-head{height:46px;padding:0 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #fef3c7;color:#78350f;font-weight:600;cursor:pointer}.br-panel.closed .br-panel-title,.br-panel.closed .br-panel-toggle{display:none}.br-panel-body{padding:12px}.br-panel .br-item{background:#fffdf5;border-left-color:#fbbf24;color:#5b4a2c}.br-panel .br-tag{background:#fef3c7;color:#92400e}
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  if (isMobile) {
    document.body.insertAdjacentHTML('beforeend', `<button class="br-trigger" onclick="document.getElementById('br-modal').classList.add('show')" aria-label="查看业务规则">📋</button><div class="br-modal" id="br-modal" onclick="if(event.target===this)this.classList.remove('show')"><section class="br-sheet"><header class="br-head"><span>${config.title}</span><button class="br-close" onclick="document.getElementById('br-modal').classList.remove('show')">×</button></header><div class="br-body">${items}</div></section></div>`);
  } else {
    document.body.insertAdjacentHTML('beforeend', `<aside class="br-panel" id="br-panel"><header class="br-panel-head" onclick="document.getElementById('br-panel').classList.toggle('closed')"><span>📋</span><span class="br-panel-title">${config.title}</span><span class="br-panel-toggle">›</span></header><div class="br-panel-body">${items}</div></aside>`);
  }
})();
