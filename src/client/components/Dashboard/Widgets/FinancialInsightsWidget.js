class FinancialInsightsWidget {
  constructor() {
    this.timeframe = 'month';
    this.data = {
      revenue: 0,
      pendingRevenue: 0,
      expenses: 0,
      profitMargin: 0,
      monthlyTrends: []
    };
    this.chart = null;
  }

  render() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Financial Insights</h3>
          <select onchange="financialInsightsWidget.updateTimeframe(this.value)" 
                  class="text-sm border-gray-300 rounded-md">
            <option value="week">This Week</option>
            <option value="month" selected>This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <!-- Key Metrics -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium text-gray-500">Revenue</div>
            <div class="mt-1">
              <span class="text-2xl font-bold text-gray-900">
                ${this.formatCurrency(this.data.revenue)}
              </span>
              <span class="ml-2 text-sm ${this.getRevenueChangeColor()}">
                ${this.calculateRevenueChange()}
              </span>
            </div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium text-gray-500">Pending Revenue</div>
            <div class="mt-1">
              <span class="text-2xl font-bold text-gray-900">
                ${this.formatCurrency(this.data.pendingRevenue)}
              </span>
              <span class="ml-2 text-sm text-gray-500">
                from ${this.data.pendingEstimates || 0} estimates
              </span>
            </div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium text-gray-500">Expenses</div>
            <div class="mt-1">
              <span class="text-2xl font-bold text-gray-900">
                ${this.formatCurrency(this.data.expenses)}
              </span>
              <span class="ml-2 text-sm text-gray-500">
                total cost
              </span>
            </div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium text-gray-500">Profit Margin</div>
            <div class="mt-1">
              <span class="text-2xl font-bold text-gray-900">
                ${this.data.profitMargin.toFixed(1)}%
              </span>
              <span class="ml-2 text-sm ${this.getProfitMarginChangeColor()}">
                ${this.calculateProfitMarginChange()}
              </span>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="h-64">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
    `;
  }

  async updateTimeframe(timeframe) {
    this.timeframe = timeframe;
    await this.refreshData();
    this.updateChart();
  }

  async refreshData() {
    try {
      this.data = await google.script.run
        .withSuccessHandler(data => data)
        .withFailureHandler(error => {
          throw error;
        })
        .getFinancialMetrics(this.timeframe);
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'FinancialInsightsWidget.refreshData',
        timeframe: this.timeframe
      });
    }
  }

  initializeChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.data.monthlyTrends.map(d => d.label),
        datasets: [
          {
            label: 'Revenue',
            data: this.data.monthlyTrends.map(d => d.revenue),
            borderColor: '#10B981',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          },
          {
            label: 'Expenses',
            data: this.data.monthlyTrends.map(d => d.expenses),
            borderColor: '#EF4444',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => this.formatCurrency(value)
            }
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.labels = this.data.monthlyTrends.map(d => d.label);
      this.chart.data.datasets[0].data = this.data.monthlyTrends.map(d => d.revenue);
      this.chart.data.datasets[1].data = this.data.monthlyTrends.map(d => d.expenses);
      this.chart.update();
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Dashboard/Widgets/UpcomingDeadlinesWidget.js
class UpcomingDeadlinesWidget {
  constructor() {
    this.deadlines = [];
    this.view = 'week'; // week, month
  }

  render() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
          <div class="flex items-center space-x-2">
            <button onclick="upcomingDeadlinesWidget.switchView('week')"
                    class="px-3 py-1 text-sm rounded-md ${
                      this.view === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                    }">
              Week
            </button>
            <button onclick="upcomingDeadlinesWidget.switchView('month')"
                    class="px-3 py-1 text-sm rounded-md ${
                      this.view === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                    }">
              Month
            </button>
          </div>
        </div>

        <div class="space-y-4">
          ${this.renderDeadlines()}
        </div>
      </div>
    `;
  }

  renderDeadlines() {
    if (!this.deadlines.length) {
      return `
        <div class="text-center text-gray-500 py-4">
          No upcoming deadlines
        </div>
      `;
    }

    return this.deadlines.map(deadline => `
      <div class="flex items-center justify-between p-3 ${
        this.getDeadlineBackgroundColor(deadline)
      } rounded-lg">
        <div class="flex items-center space-x-3">
          <span class="flex-shrink-0 w-2 h-2 rounded-full ${
            this.getDeadlineDotColor(deadline)
          }"></span>
          <div>
            <h4 class="text-sm font-medium text-gray-900">${deadline.title}</h4>
            <p class="text-xs text-gray-500">${deadline.projectName}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm font-medium ${this.getDeadlineTextColor(deadline)}">
            ${this.formatDeadlineDate(deadline.date)}
          </div>
          <div class="text-xs text-gray-500">
            ${this.getTimeRemaining(deadline.date)}
          </div>
        </div>
      </div>
    `).join('');
  }

  async switchView(view) {
    this.view = view;
    await this.refreshDeadlines();
  }

  async refreshDeadlines() {
    try {
      this.deadlines = await google.script.run
        .withSuccessHandler(deadlines => deadlines)
        .withFailureHandler(error => {
          throw error;
        })
        .getUpcomingDeadlines(this.view);
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'UpcomingDeadlinesWidget.refreshDeadlines',
        view: this.view
      });
    }
  }

  getDeadlineBackgroundColor(deadline) {
    const daysUntil = this.getDaysUntil(deadline.date);
    if (daysUntil <= 2) return 'bg-red-50';
    if (daysUntil <= 7) return 'bg-yellow-50';
    return 'bg-gray-50';
  }

  getDeadlineDotColor(deadline) {
    const daysUntil = this.getDaysUntil(deadline.date);
    if (daysUntil <= 2) return 'bg-red-500';
    if (daysUntil <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getDeadlineTextColor(deadline) {
    const daysUntil = this.getDaysUntil(deadline.date);
    if (daysUntil <= 2) return 'text-red-600';
    if (daysUntil <= 7) return 'text-yellow-600';
    return 'text-gray-900';
  }

  getDaysUntil(date) {
    const now = new Date();
    const deadlineDate = new Date(date);
    const diffTime = deadlineDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDeadlineDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getTimeRemaining(date) {
    const days = this.getDaysUntil(date);
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days < 0) return 'Overdue';
    return `${days} days remaining`;
  }
}