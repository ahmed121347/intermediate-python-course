// Executive Dashboard View Renderer

window.renderExecutiveDashboard = async function() {
  const workspace = document.getElementById('workspace-view');

  try {
    const response = await fetch('/api/departments/executive/dashboard', {
      headers: {
        'X-Company-ID': QYADA_STATE.activeCompanyId,
        'X-Branch-ID': QYADA_STATE.activeBranchId
      }
    });

    const data = await response.json();
    const kpis = data.kpis;
    const projects = data.projects;
    const workflows = data.pending_workflows;

    const formattedRevenue = (kpis.total_revenue_aed / 1000000).toFixed(1) + 'M';
    const formattedCost = (kpis.total_actual_cost_aed / 1000000).toFixed(1) + 'M';
    const formattedProfit = (kpis.total_profit_aed / 1000000).toFixed(1) + 'M';
    const formattedCash = (kpis.total_cash_aed / 1000000).toFixed(1) + 'M';
    const formattedRec = (kpis.receivables_aed / 1000000).toFixed(1) + 'M';
    const formattedPay = (kpis.payables_aed / 1000000).toFixed(1) + 'M';

    workspace.innerHTML = `
      <!-- 6 Key KPI Cards -->
      <div class="kpi-grid">
        <div class="qyada-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-title" data-ar="إجمالي الإيرادات" data-en="Total Revenue">إجمالي الإيرادات</span>
            <div class="kpi-icon"><i class="fa-solid fa-coins"></i></div>
          </div>
          <div class="kpi-value">${formattedRevenue} <span style="font-size:12px; color:var(--gold-accent);">AED</span></div>
          <div class="kpi-trend trend-up"><i class="fa-solid fa-arrow-trend-up"></i> +14.2% مقارنة بالشهر السابق</div>
        </div>

        <div class="qyada-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-title" data-ar="التكلفة الفعلية" data-en="Actual Cost">التكلفة الفعلية</span>
            <div class="kpi-icon"><i class="fa-solid fa-calculator"></i></div>
          </div>
          <div class="kpi-value">${formattedCost} <span style="font-size:12px; color:var(--gold-accent);">AED</span></div>
          <div class="kpi-trend trend-up"><i class="fa-solid fa-check"></i> ضمن الميزانية المحددة</div>
        </div>

        <div class="qyada-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-title" data-ar="الربح الصافي المتوقع" data-en="Net Profit">الربح الصافي المتوقع</span>
            <div class="kpi-icon"><i class="fa-solid fa-chart-pie"></i></div>
          </div>
          <div class="kpi-value">${formattedProfit} <span style="font-size:12px; color:var(--gold-accent);">AED</span></div>
          <div class="kpi-trend trend-up"><i class="fa-solid fa-arrow-trend-up"></i> 18.5% نسبة الربحية</div>
        </div>

        <div class="qyada-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-title" data-ar="السيولة والتحصيلات" data-en="Cash Collected">السيولة والتحصيلات</span>
            <div class="kpi-icon"><i class="fa-solid fa-vault"></i></div>
          </div>
          <div class="kpi-value">${formattedCash} <span style="font-size:12px; color:var(--gold-accent);">AED</span></div>
          <div class="kpi-trend trend-up"><i class="fa-solid fa-arrow-trend-up"></i> +8.5M تدفق نقدي موجبة</div>
        </div>

        <div class="qyada-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-title" data-ar="ذمم مدينة غير محصلة" data-en="Receivables">ذمم مدينة غير محصلة</span>
            <div class="kpi-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div>
          </div>
          <div class="kpi-value">${formattedRec} <span style="font-size:12px; color:var(--gold-accent);">AED</span></div>
          <div class="kpi-trend trend-down"><i class="fa-solid fa-clock"></i> 2 فواتير تستحق التتبع</div>
        </div>

        <div class="qyada-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-title" data-ar="المشاريع القائمة" data-en="Active Projects">المشاريع القائمة</span>
            <div class="kpi-icon"><i class="fa-solid fa-building"></i></div>
          </div>
          <div class="kpi-value">${kpis.active_projects_count} <span style="font-size:12px; color:var(--gold-accent);">مشاريع</span></div>
          <div class="kpi-trend trend-up"><i class="fa-solid fa-circle-check"></i> 100% نسبة أداء المواقع</div>
        </div>
      </div>

      <!-- Financial Chart & Donut Chart Section -->
      <div class="charts-grid">
        <div class="qyada-card" style="height: 380px;">
          <div class="card-title">
            <span><i class="fa-solid fa-chart-bar" style="color:var(--gold-accent);"></i> الأداء المالي والربحية للمشاريع (Financial Performance)</span>
            <span style="font-size: 11px; color: var(--text-muted);">بالدرهم الإماراتي AED</span>
          </div>
          <div style="height: 300px;">
            <canvas id="execFinancialCanvas"></canvas>
          </div>
        </div>

        <div class="qyada-card" style="height: 380px;">
          <div class="card-title">
            <span><i class="fa-solid fa-chart-pie" style="color:var(--gold-accent);"></i> حالة محفظة المشاريع (Portfolio Status)</span>
          </div>
          <div style="height: 300px;">
            <canvas id="execDonutCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom Dashboard Grid: Satellite Map, Workflows & Activity Stream -->
      <div class="dashboard-bottom-grid">
        <!-- Interactive Project Map -->
        <div class="qyada-card">
          <div class="card-title">
            <span><i class="fa-solid fa-map-location-dot"></i> الخريطة التفاعلية للمواقع (Live UAE Sites Map)</span>
          </div>
          <div style="background: #081d1b; border-radius: 12px; padding: 15px; border: 1px solid var(--border-gold);">
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${projects.map(p => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:10px; border-radius:8px; border-right: 4px solid ${p.risk_level === 'High' ? '#FF453A' : '#30D158'};">
                  <div>
                    <div style="font-weight:700; color:var(--text-white);">${p.name_ar}</div>
                    <div style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-user-tie"></i> ${p.manager_name} | نسبة الإنجاز: ${p.progress}%</div>
                  </div>
                  <span style="padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; background:rgba(212,175,55,0.15); color:var(--gold-accent);">${p.code}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Actionable Workflow Approvals Box -->
        <div class="qyada-card">
          <div class="card-title">
            <span><i class="fa-solid fa-signature"></i> صندوق الاعتمادات والموافقات المعلقة (Pending Approvals)</span>
            <span class="badge" style="background:var(--color-orange); color:#000; padding:2px 8px; border-radius:10px; font-size:12px;">${workflows.length} معلقة</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px; max-height: 280px; overflow-y:auto;">
            ${workflows.map(wf => `
              <div style="background:var(--bg-panel); padding:12px; border-radius:10px; border:1px solid rgba(183,139,46,0.3);">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span style="font-weight:700; color:var(--gold-accent);">${wf.title_ar}</span>
                  <span style="font-size:11px; color:var(--color-orange); font-weight:700;">${wf.amount_aed.toLocaleString()} AED</span>
                </div>
                <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">طالب الإجراء: ${wf.requester} | القسم: ${wf.department}</div>
                <div style="display:flex; gap:8px;">
                  <button class="btn-gold" onclick="approveWorkflowAction(${wf.id}, 'Approve')"><i class="fa-solid fa-check"></i> اعتماد</button>
                  <button class="btn-danger" onclick="approveWorkflowAction(${wf.id}, 'Reject')"><i class="fa-solid fa-xmark"></i> رفض</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Cashflow Forecasting Widget -->
        <div class="qyada-card">
          <div class="card-title">
            <span><i class="fa-solid fa-arrow-trend-up"></i> توقعات التدفق النقدي 3 أشهر (Cashflow Forecast)</span>
          </div>
          <div style="height: 250px;">
            <canvas id="execCashflowCanvas"></canvas>
          </div>
        </div>
      </div>
    `;

    // Render Charts
    const prjNames = projects.map(p => p.name_ar.substring(0, 15) + '..');
    const revenues = projects.map(p => p.revenue_aed / 1000000);
    const costs = projects.map(p => p.actual_cost_aed / 1000000);
    const profits = projects.map(p => p.profit_aed / 1000000);

    createFinancialChart('execFinancialCanvas', prjNames, revenues, costs, profits);
    createProjectStatusDonut('execDonutCanvas', 3, 1, 1);
    createCashflowChart('execCashflowCanvas', ['مارس', 'أبريل', 'مايو'], [48.5, 52.0, 61.0], [32.0, 38.0, 41.0]);

  } catch (err) {
    console.error("Error rendering Executive Dashboard:", err);
  }
};

window.approveWorkflowAction = async function(wfId, action) {
  try {
    const res = await fetch(`/api/departments/workflows/${wfId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action, comments: 'Action executed via Executive Dashboard' })
    });
    if (res.ok) {
      window.renderExecutiveDashboard();
    }
  } catch (e) {
    console.error("Workflow action error:", e);
  }
};
