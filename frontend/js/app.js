// Core State Management
const QYADA_STATE = {
  lang: 'ar', // 'ar' or 'en'
  activeModule: 'executive',
  activeSubModule: null,
  activeCompanyId: 2,
  activeBranchId: 2,
  token: null,
  user: {
    username: 'admin',
    full_name_ar: 'سعادة د. سلطان القاسمي',
    full_name_en: 'H.E. Dr. Sultan Al Qasimi',
    role: 'CEO'
  }
};

// Hierarchical Navigation Tree Definition
const NAVIGATION_TREE = [
  {
    id: 'executive',
    title_ar: 'لوحة الرئيس التنفيذي',
    title_en: 'Executive Dashboard',
    icon: 'fa-solid fa-chart-line',
    subitems: []
  },
  {
    id: 'projects',
    title_ar: 'إدارة المشاريع والمواقع',
    title_en: 'Projects & Operations',
    icon: 'fa-solid fa-building',
    subitems: [
      { id: 'projects_list', title_ar: 'محفظة المشاريع', title_en: 'Project Portfolio' },
      { id: 'boq_management', title_ar: 'جدول الكميات BOQ', title_en: 'BOQ Management' },
      { id: 'daily_reports', title_ar: 'الموقع التقارير اليومية', title_en: 'Site Daily Reports' },
      { id: 'rfis_approvals', title_ar: 'طلبات الاعتماد RFIs', title_en: 'RFIs & Approvals' }
    ]
  },
  {
    id: 'finance',
    title_ar: 'المالية وضبط التكلفة',
    title_en: 'Finance & Cost Control',
    icon: 'fa-solid fa-vault',
    subitems: [
      { id: 'financial_overview', title_ar: 'الملخص المالي والربحية', title_en: 'Financial Summary' },
      { id: 'vat_invoices', title_ar: 'الفوترة والضريبة VAT 5%', title_en: 'VAT Invoices & Compliance' },
      { id: 'cashflow_forecasting', title_ar: 'التدفقات النقدية المتوقعة', title_en: 'Cashflow Forecasting' }
    ]
  },
  {
    id: 'marble_factory',
    title_ar: 'مصنع الرخام والجرانيت',
    title_en: 'Marble & Granite Factory',
    icon: 'fa-solid fa-gem',
    subitems: [
      { id: 'marble_lines', title_ar: 'خطوط الإنتاج والقص', title_en: 'Cutting & Production Lines' },
      { id: 'marble_batches', title_ar: 'دفعة الطلبيات والواجهات', title_en: 'Slab Orders & Batches' }
    ]
  },
  {
    id: 'steel_factory',
    title_ar: 'مصنع الهياكل الحديدية',
    title_en: 'Steel Fabrication Factory',
    icon: 'fa-solid fa-cubes-stacked',
    subitems: [
      { id: 'steel_lines', title_ar: 'خطوط تصنيع الجسور CNC', title_en: 'CNC Beam Lines' },
      { id: 'steel_batches', title_ar: 'دفعة توريدات برج دبي', title_en: 'Rebar & Beam Batches' }
    ]
  },
  {
    id: 'fleet',
    title_ar: 'النقليات والمعدات الثقيلة',
    title_en: 'Fleet & Logistics',
    icon: 'fa-solid fa-truck-monster',
    subitems: [
      { id: 'fleet_tracking', title_ar: 'تتبع حركة المعدات GPS', title_en: 'Fleet GPS Tracking' },
      { id: 'fleet_maintenance', title_ar: 'صيانة ومحروقات الأسطول', title_en: 'Fleet Maintenance' }
    ]
  },
  {
    id: 'hr_payroll',
    title_ar: 'الموارد البشرية والرواتب WPS',
    title_en: 'HR & WPS Payroll',
    icon: 'fa-solid fa-users-gear',
    subitems: [
      { id: 'employees_directory', title_ar: 'دليل الموظفين والعمالة', title_en: 'Employee Directory' },
      { id: 'wps_payroll', title_ar: 'حماية الأجور الإماراتية WPS', title_en: 'UAE WPS Compliance' }
    ]
  },
  {
    id: 'ai_center',
    title_ar: 'مركز الذكاء الاصطناعي',
    title_en: 'AI Intelligence Center',
    icon: 'fa-solid fa-robot',
    subitems: []
  }
];

// 12 Quick Access Action Shortcuts
const SHORTCUTS = [
  { id: 'sc_projects', icon: 'fa-solid fa-city', title_ar: 'المشاريع', title_en: 'Projects', target: 'projects' },
  { id: 'sc_boq', icon: 'fa-solid fa-list-check', title_ar: 'جدول الكميات', title_en: 'BOQ', target: 'boq_management' },
  { id: 'sc_finance', icon: 'fa-solid fa-calculator', title_ar: 'التكاليف', title_en: 'Cost Control', target: 'finance' },
  { id: 'sc_contracts', icon: 'fa-solid fa-file-contract', title_ar: 'العقود', title_en: 'Contracts', target: 'finance' },
  { id: 'sc_invoices', icon: 'fa-solid fa-file-invoice-dollar', title_ar: 'الفواتير', title_en: 'Invoices', target: 'vat_invoices' },
  { id: 'sc_rfq', icon: 'fa-solid fa-cart-shopping', title_ar: 'المشتريات', title_en: 'Procurement', target: 'projects' },
  { id: 'sc_marble', icon: 'fa-solid fa-gem', title_ar: 'مصنع الرخام', title_en: 'Marble Factory', target: 'marble_factory' },
  { id: 'sc_steel', icon: 'fa-solid fa-cubes-stacked', title_ar: 'مصنع الحديد', title_en: 'Steel Factory', target: 'steel_factory' },
  { id: 'sc_fleet', icon: 'fa-solid fa-truck', title_ar: 'النقليات', title_en: 'Fleet', target: 'fleet' },
  { id: 'sc_hr', icon: 'fa-solid fa-user-check', title_ar: 'الرواتب WPS', title_en: 'WPS Payroll', target: 'hr_payroll' },
  { id: 'sc_reports', icon: 'fa-solid fa-chart-pie', title_ar: 'التقارير', title_en: 'Reports', target: 'executive' },
  { id: 'sc_ai', icon: 'fa-solid fa-brain', title_ar: 'المساعد الذكي', title_en: 'AI Assistant', target: 'ai_center' }
];

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderSidebarTree();
  renderQuickAccessBar();
  bindEvents();
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // Load Default Executive View
  loadModule('executive');
}

function renderSidebarTree() {
  const container = document.getElementById('nav-tree-container');
  container.innerHTML = '';

  NAVIGATION_TREE.forEach(node => {
    const isExpanded = QYADA_STATE.activeModule === node.id;
    const title = QYADA_STATE.lang === 'ar' ? node.title_ar : node.title_en;

    let childrenHTML = '';
    if (node.subitems && node.subitems.length > 0) {
      childrenHTML = node.subitems.map(sub => {
        const subTitle = QYADA_STATE.lang === 'ar' ? sub.title_ar : sub.title_en;
        const isActive = QYADA_STATE.activeSubModule === sub.id ? 'active' : '';
        return `
          <div class="tree-subitem ${isActive}" onclick="event.stopPropagation(); loadSubModule('${node.id}', '${sub.id}')">
            <i class="fa-solid fa-angle-left" style="font-size: 10px;"></i>
            <span>${subTitle}</span>
          </div>
        `;
      }).join('');
    }

    const hasChildren = node.subitems && node.subitems.length > 0;
    const activeClass = QYADA_STATE.activeModule === node.id ? 'active' : '';
    const expandedClass = isExpanded ? 'expanded' : '';

    const nodeEl = document.createElement('div');
    nodeEl.className = `tree-node ${expandedClass}`;
    nodeEl.id = `tree-node-${node.id}`;
    nodeEl.innerHTML = `
      <div class="tree-header ${activeClass}" onclick="toggleTreeNode('${node.id}')">
        <div class="node-title">
          <i class="${node.icon} node-icon"></i>
          <span>${title}</span>
        </div>
        ${hasChildren ? `<i class="fa-solid fa-chevron-down arrow-icon" style="font-size: 11px;"></i>` : ''}
      </div>
      ${hasChildren ? `<div class="tree-children">${childrenHTML}</div>` : ''}
    `;

    container.appendChild(nodeEl);
  });
}

function toggleTreeNode(nodeId) {
  const targetNode = NAVIGATION_TREE.find(n => n.id === nodeId);
  if (!targetNode) return;

  if (targetNode.subitems && targetNode.subitems.length > 0) {
    const el = document.getElementById(`tree-node-${nodeId}`);
    el.classList.toggle('expanded');
  }

  loadModule(nodeId);
}

function renderQuickAccessBar() {
  const bar = document.getElementById('quick-access-bar');
  bar.innerHTML = SHORTCUTS.map(sc => {
    const title = QYADA_STATE.lang === 'ar' ? sc.title_ar : sc.title_en;
    return `
      <div class="shortcut-btn" onclick="loadModule('${sc.target}')">
        <i class="${sc.icon}"></i>
        <span>${title}</span>
      </div>
    `;
  }).join('');
}

function bindEvents() {
  document.getElementById('btn-toggle-lang').addEventListener('click', toggleLanguage);
  document.getElementById('company-switcher').addEventListener('change', (e) => {
    QYADA_STATE.activeCompanyId = parseInt(e.target.value);
    loadModule(QYADA_STATE.activeModule);
  });
  document.getElementById('branch-switcher').addEventListener('change', (e) => {
    QYADA_STATE.activeBranchId = parseInt(e.target.value);
    loadModule(QYADA_STATE.activeModule);
  });
}

function toggleLanguage() {
  QYADA_STATE.lang = QYADA_STATE.lang === 'ar' ? 'en' : 'ar';
  document.body.classList.toggle('ltr', QYADA_STATE.lang === 'en');
  document.documentElement.lang = QYADA_STATE.lang;
  document.documentElement.dir = QYADA_STATE.lang === 'ar' ? 'rtl' : 'ltr';

  document.getElementById('btn-toggle-lang').innerText = QYADA_STATE.lang === 'ar' ? 'English' : 'عربي';

  // Translate placeholders and static text
  const searchInput = document.getElementById('global-search');
  searchInput.placeholder = QYADA_STATE.lang === 'ar'
    ? searchInput.getAttribute('data-placeholder-ar')
    : searchInput.getAttribute('data-placeholder-en');

  document.querySelectorAll('.lang-text').forEach(el => {
    el.innerText = QYADA_STATE.lang === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en');
  });

  renderSidebarTree();
  renderQuickAccessBar();
  loadModule(QYADA_STATE.activeModule);
}

function updateLiveClock() {
  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  document.getElementById('live-clock').innerText = now.toLocaleTimeString(QYADA_STATE.lang === 'ar' ? 'ar-AE' : 'en-US', options);
}

function loadModule(moduleId) {
  QYADA_STATE.activeModule = moduleId;
  QYADA_STATE.activeSubModule = null;
  renderSidebarTree();

  const workspace = document.getElementById('workspace-view');
  workspace.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--gold-accent);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

  if (moduleId === 'executive') {
    if (window.renderExecutiveDashboard) window.renderExecutiveDashboard();
  } else if (moduleId === 'projects') {
    if (window.renderProjectsDashboard) window.renderProjectsDashboard();
  } else if (moduleId === 'finance') {
    if (window.renderFinanceDashboard) window.renderFinanceDashboard();
  } else if (moduleId === 'marble_factory') {
    if (window.renderMarbleDashboard) window.renderMarbleDashboard();
  } else if (moduleId === 'steel_factory') {
    if (window.renderSteelDashboard) window.renderSteelDashboard();
  } else if (moduleId === 'fleet') {
    if (window.renderFleetDashboard) window.renderFleetDashboard();
  } else if (moduleId === 'hr_payroll') {
    if (window.renderHRDashboard) window.renderHRDashboard();
  } else if (moduleId === 'ai_center') {
    if (window.renderAICenter) window.renderAICenter();
  }
}

function loadSubModule(parentModuleId, subModuleId) {
  QYADA_STATE.activeModule = parentModuleId;
  QYADA_STATE.activeSubModule = subModuleId;
  renderSidebarTree();
  loadModule(parentModuleId);
}
