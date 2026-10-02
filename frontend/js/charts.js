// Chart Helper Functions for QYADA ERP Dark-Gold Theme

function createFinancialChart(canvasId, labels, revenueData, costData, profitData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (window.qyadaFinancialChart) {
    window.qyadaFinancialChart.destroy();
  }

  window.qyadaFinancialChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'الإيرادات (Revenue)',
          data: revenueData,
          backgroundColor: 'rgba(48, 209, 88, 0.8)',
          borderColor: '#30D158',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'التكلفة الفعلية (Actual Cost)',
          data: costData,
          backgroundColor: 'rgba(255, 69, 58, 0.8)',
          borderColor: '#FF453A',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'الربح الصافي (Net Profit)',
          data: profitData,
          backgroundColor: 'rgba(212, 175, 55, 0.9)',
          borderColor: '#D4AF37',
          borderWidth: 1,
          borderRadius: 6,
          type: 'line'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#ffffff', font: { family: 'Inter', size: 12 } }
        }
      },
      scales: {
        x: { ticks: { color: '#a7a7a7' }, grid: { color: 'rgba(183, 139, 46, 0.1)' } },
        y: { ticks: { color: '#a7a7a7' }, grid: { color: 'rgba(183, 139, 46, 0.1)' } }
      }
    }
  });
}

function createProjectStatusDonut(canvasId, activeCount, completedCount, delayedCount) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (window.qyadaDonutChart) {
    window.qyadaDonutChart.destroy();
  }

  window.qyadaDonutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['قيد التنفيذ (In Progress)', 'مكتمل (Completed)', 'متأخر (Delayed)'],
      datasets: [{
        data: [activeCount, completedCount, delayedCount],
        backgroundColor: ['#0A84FF', '#30D158', '#FF453A'],
        borderColor: '#0D2C29',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ffffff', font: { size: 11 } }
        }
      }
    }
  });
}

function createCashflowChart(canvasId, labels, inflowData, outflowData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (window.qyadaCashflowChart) {
    window.qyadaCashflowChart.destroy();
  }

  window.qyadaCashflowChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'التحصيلات المتوقعة (Inflow)',
          data: inflowData,
          borderColor: '#30D158',
          backgroundColor: 'rgba(48, 209, 88, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'الالتزامات والدفعات (Outflow)',
          data: outflowData,
          borderColor: '#FF453A',
          backgroundColor: 'rgba(255, 69, 58, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#ffffff', font: { size: 11 } } }
      },
      scales: {
        x: { ticks: { color: '#a7a7a7' }, grid: { display: false } },
        y: { ticks: { color: '#a7a7a7' }, grid: { color: 'rgba(183, 139, 46, 0.1)' } }
      }
    }
  });
}
