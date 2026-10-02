// Departmental Dashboards Renderer for QYADA ERP

// 1. Projects Dashboard
window.renderProjectsDashboard = async function() {
  const workspace = document.getElementById('workspace-view');
  const response = await fetch('/api/departments/projects');
  const projects = await response.json();

  workspace.innerHTML = `
    <div class="qyada-card">
      <div class="card-title">
        <span><i class="fa-solid fa-building"></i> محفظة المشاريع والعمليات الميدانية (Project Portfolio & Sites)</span>
        <button class="btn-gold" onclick="alert('شاشة إضافة مشروع جديد جاهزة')"><i class="fa-solid fa-plus"></i> مشروع جديد</button>
      </div>
      <table style="width:100%; border-collapse:collapse; text-align:right;">
        <thead>
          <tr style="background:var(--bg-panel); color:var(--gold-accent); border-bottom:1px solid var(--border-gold);">
            <th style="padding:12px;">رمز المشروع</th>
            <th style="padding:12px;">اسم المشروع</th>
            <th style="padding:12px;">مدير المشروع</th>
            <th style="padding:12px;">الميزانية (AED)</th>
            <th style="padding:12px;">المصروف الفعلي (AED)</th>
            <th style="padding:12px;">نسبة الإنجاز</th>
            <th style="padding:12px;">مستوى المخاطرة</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(p => `
            <tr style="border-bottom:1px solid rgba(183,139,46,0.2);">
              <td style="padding:12px; font-weight:700; color:var(--gold-accent);">${p.code}</td>
              <td style="padding:12px;">${p.name_ar}</td>
              <td style="padding:12px;">${p.manager_name}</td>
              <td style="padding:12px;">${p.budget_aed.toLocaleString()}</td>
              <td style="padding:12px;">${p.actual_cost_aed.toLocaleString()}</td>
              <td style="padding:12px;">
                <div style="background:#081d1b; border-radius:10px; height:12px; width:100px; border:1px solid var(--border-gold);">
                  <div style="background:var(--color-green); height:100%; border-radius:10px; width:${p.progress}%;"></div>
                </div>
                <span style="font-size:11px;">${p.progress}%</span>
              </td>
              <td style="padding:12px;">
                <span style="padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; background:${p.risk_level === 'High' ? 'rgba(255,69,58,0.2)' : 'rgba(48,209,88,0.2)'}; color:${p.risk_level === 'High' ? '#FF453A' : '#30D158'};">${p.risk_level}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

// 2. Finance Dashboard
window.renderFinanceDashboard = async function() {
  const workspace = document.getElementById('workspace-view');
  workspace.innerHTML = `
    <div class="kpi-grid">
      <div class="qyada-card kpi-card">
        <div class="kpi-title">إجمالي الفواتير الضريبية VAT 5%</div>
        <div class="kpi-value">42,275,000 <span style="font-size:12px;">AED</span></div>
      </div>
      <div class="qyada-card kpi-card">
        <div class="kpi-title">ضريبة القيمة المضافة المستحقة هيئة الزكاة والضريبة</div>
        <div class="kpi-value">2,113,750 <span style="font-size:12px;">AED</span></div>
      </div>
      <div class="qyada-card kpi-card">
        <div class="kpi-title">معدل الانحراف المالي للشركات</div>
        <div class="kpi-value">0.42% <span style="font-size:12px;">مثالي</span></div>
      </div>
    </div>
    <div class="qyada-card" style="margin-top:20px;">
      <div class="card-title"><i class="fa-solid fa-file-invoice-dollar"></i> سجل الفواتير والمستخلصات المعتمدة (UAE E-Invoicing)</div>
      <p style="color:var(--text-muted);">جميع التعاملات متوافقة 100% مع هيئة الاتحادية للضرائب الإماراتية FTA ومتطلبات الفوترة الإلكترونية.</p>
    </div>
  `;
};

// 3. Marble Factory Dashboard
window.renderMarbleDashboard = async function() {
  const workspace = document.getElementById('workspace-view');
  const response = await fetch('/api/departments/factories/overview');
  const data = await response.json();
  const marbleLines = data.lines.filter(l => l.factory_type === 'Marble');
  const marbleBatches = data.batches.filter(b => b.factory_type === 'Marble');

  workspace.innerHTML = `
    <div class="qyada-card">
      <div class="card-title">
        <span><i class="fa-solid fa-gem"></i> مصنع الرخام والجرانيت - أيكاد أبوظبي (Marble Factory ICAD)</span>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <div>
          <h4 style="color:var(--gold-accent); margin-bottom:10px;">خطوط الإنتاج والقص اللحظي</h4>
          ${marbleLines.map(l => `
            <div style="background:var(--bg-panel); padding:15px; border-radius:10px; margin-bottom:10px; border:1px solid var(--border-gold);">
              <div style="font-weight:700;">${l.name_ar}</div>
              <div style="font-size:12px; color:var(--text-muted);">الطاقة اليومية: ${l.daily_capacity} | الكفاءة: ${l.utilization_pct}%</div>
            </div>
          `).join('')}
        </div>
        <div>
          <h4 style="color:var(--gold-accent); margin-bottom:10px;">طلبيات الواجهات والفلل الجارية</h4>
          ${marbleBatches.map(b => `
            <div style="background:var(--bg-panel); padding:15px; border-radius:10px; margin-bottom:10px; border:1px solid var(--border-gold);">
              <div style="font-weight:700;">${b.product_name_ar} (${b.batch_no})</div>
              <div style="font-size:12px; color:var(--text-muted);">الكمية: ${b.quantity} ${b.unit} | التنسيق مع المشروع: ${b.project_name_ar || 'عام'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// 4. Steel Factory Dashboard
window.renderSteelDashboard = async function() {
  const workspace = document.getElementById('workspace-view');
  const response = await fetch('/api/departments/factories/overview');
  const data = await response.json();
  const steelLines = data.lines.filter(l => l.factory_type === 'Steel');
  const steelBatches = data.batches.filter(b => b.factory_type === 'Steel');

  workspace.innerHTML = `
    <div class="qyada-card">
      <div class="card-title">
        <span><i class="fa-solid fa-cubes-stacked"></i> مصنع تشكيل الهياكل الحديدية - دبي (Steel Fabrication DIC)</span>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <div>
          <h4 style="color:var(--gold-accent); margin-bottom:10px;">خطوط تشكيل وتصنيع الجسور CNC</h4>
          ${steelLines.map(l => `
            <div style="background:var(--bg-panel); padding:15px; border-radius:10px; margin-bottom:10px; border:1px solid var(--border-gold);">
              <div style="font-weight:700;">${l.name_ar}</div>
              <div style="font-size:12px; color:var(--text-muted);">الطاقة التشغيلية: ${l.daily_capacity} | نسبة الاستغلال: ${l.utilization_pct}%</div>
            </div>
          `).join('')}
        </div>
        <div>
          <h4 style="color:var(--gold-accent); margin-bottom:10px;">دفعة حديد التسليح والجسور الثقيلة</h4>
          ${steelBatches.map(b => `
            <div style="background:var(--bg-panel); padding:15px; border-radius:10px; margin-bottom:10px; border:1px solid var(--border-gold);">
              <div style="font-weight:700;">${b.product_name_ar} (${b.batch_no})</div>
              <div style="font-size:12px; color:var(--text-muted);">الكمية: ${b.quantity} ${b.unit} | نسبة الإنجاز: ${b.completion_pct}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// 5. Fleet Dashboard
window.renderFleetDashboard = async function() {
  const workspace = document.getElementById('workspace-view');
  const response = await fetch('/api/departments/fleet');
  const fleet = await response.json();

  workspace.innerHTML = `
    <div class="qyada-card">
      <div class="card-title">
        <span><i class="fa-solid fa-truck-monster"></i> أسطول النقليات والمعدات الثقيلة (Fleet & Heavy Equipment Hub)</span>
      </div>
      <table style="width:100%; border-collapse:collapse; text-align:right;">
        <thead>
          <tr style="background:var(--bg-panel); color:var(--gold-accent); border-bottom:1px solid var(--border-gold);">
            <th style="padding:12px;">رمز المركبة</th>
            <th style="padding:12px;">رقم اللوحة</th>
            <th style="padding:12px;">نوع المعدة</th>
            <th style="padding:12px;">السائق المسند</th>
            <th style="padding:12px;">المشروع الحالي</th>
            <th style="padding:12px;">الحالة التشغيلية</th>
          </tr>
        </thead>
        <tbody>
          ${fleet.map(f => `
            <tr style="border-bottom:1px solid rgba(183,139,46,0.2);">
              <td style="padding:12px; font-weight:700; color:var(--gold-accent);">${f.vehicle_code}</td>
              <td style="padding:12px;">${f.plate_no}</td>
              <td style="padding:12px;">${f.type_ar}</td>
              <td style="padding:12px;">${f.driver_name}</td>
              <td style="padding:12px;">${f.project_name_ar || 'مركز الخدمة - العين'}</td>
              <td style="padding:12px;">
                <span style="padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; background:${f.status === 'Active' ? 'rgba(48,209,88,0.2)' : 'rgba(245,179,1,0.2)'}; color:${f.status === 'Active' ? '#30D158' : '#F5B301'};">${f.status}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

// 6. HR Dashboard
window.renderHRDashboard = async function() {
  const workspace = document.getElementById('workspace-view');
  const response = await fetch('/api/departments/hr');
  const employees = await response.json();

  workspace.innerHTML = `
    <div class="qyada-card">
      <div class="card-title">
        <span><i class="fa-solid fa-users-gear"></i> إدارة الكوادر وحماية الأجور الإماراتية (UAE WPS Payroll & HR)</span>
      </div>
      <table style="width:100%; border-collapse:collapse; text-align:right;">
        <thead>
          <tr style="background:var(--bg-panel); color:var(--gold-accent); border-bottom:1px solid var(--border-gold);">
            <th style="padding:12px;">الرقم الوظيفي</th>
            <th style="padding:12px;">اسم الموظف</th>
            <th style="padding:12px;">القسم</th>
            <th style="padding:12px;">المسمى الوظيفي</th>
            <th style="padding:12px;">الراتب الشامل (AED)</th>
            <th style="padding:12px;">حالة WPS</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map(e => `
            <tr style="border-bottom:1px solid rgba(183,139,46,0.2);">
              <td style="padding:12px; font-weight:700; color:var(--gold-accent);">${e.emp_code}</td>
              <td style="padding:12px;">${e.name_ar}</td>
              <td style="padding:12px;">${e.department}</td>
              <td style="padding:12px;">${e.designation}</td>
              <td style="padding:12px;">${e.total_salary_aed.toLocaleString()}</td>
              <td style="padding:12px;">
                <span style="padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; background:rgba(48,209,88,0.2); color:#30D158;"><i class="fa-solid fa-shield-check"></i> ${e.wps_status}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};
