class ProjectOverview {
  constructor(projectId) {
    this.projectId = projectId;
    this.metrics = {
      totalHours: 0,
      materialsSpent: 0,
      subcontractorCosts: 0,
      estimatedAmount: 0
    };
    this.recentActivities = [];
    this.upcomingMilestones = [];
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          ${this.renderMetricsCards()}
        </div>

        <!-- Project Progress -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Time Tracking Summary -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Time Tracking</h3>
              <a href="#" onclick="projectOverview.viewAllTimeEntries()"
                 class="text-sm text-blue-600 hover:text-blue-800">
                View All
              </a>
            </div>
            ${this.renderTimeTrackingSummary()}
          </div>

          <!-- Materials & Costs -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Materials & Costs</h3>
              <a href="#" onclick="projectOverview.viewAllCosts()"
                 class="text-sm text-blue-600 hover:text-blue-800">
                View All
              </a>
            </div>
            ${this.renderCostsSummary()}
          </div>
        </div>

        <!-- Recent Activities & Documents -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Recent Activities -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Recent Activities</h3>
              <a href="#" onclick="projectOverview.viewAllActivities()"
                 class="text-sm text-blue-600 hover:text-blue-800">
                View All
              </a>
            </div>
            ${this.renderRecentActivities()}
          </div>

          <!-- Project Documents -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Documents</h3>
              <button onclick="projectOverview.uploadDocument()"
                      class="btn-secondary text-sm">
                <span class="mdi mdi-upload mr-2"></span>
                Upload
              </button>
            </div>
            ${this.renderDocumentsList()}
          </div>
        </div>
      </div>
    `;
  }

  renderMetricsCards() {
    const metrics = [
      {
        label: 'Hours Logged',
        value: this.formatHours(this.metrics.totalHours),
        icon: 'mdi-clock-outline',
        color: 'blue'
      },
      {
        label: 'Materials Cost',
        value: this.formatCurrency(this.metrics.materialsSpent),
        icon: 'mdi-package-variant',
        color: 'green'
      },
      {
        label: 'Subcontractor Costs',
        value: this.formatCurrency(this.metrics.subcontractorCosts),
        icon: 'mdi-account-hard-hat',
        color: 'yellow'
      },
      {
        label: 'Estimated Amount',
        value: this.formatCurrency(this.metrics.estimatedAmount),
        icon: 'mdi-file-document-outline',
        color: 'purple'
      }
    ];

    return metrics.map(metric => `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="mdi ${metric.icon} text-2xl text-${metric.color}-500"></span>
          </div>
          <div class="ml-4">
            <h4 class="text-sm font-medium text-gray-500">${metric.label}</h4>
            <p class="mt-1 text-xl font-semibold text-gray-900">${metric.value}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderTimeTrackingSummary() {
    return `
      <div class="space-y-4">
        <!-- Weekly Hours Chart -->
        <div class="h-48">
          <canvas id="weeklyHoursChart"></canvas>
        </div>

        <!-- Time Entries -->
        <div class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Recent Entries</h4>
          <div class="space-y-2">
            ${this.renderRecentTimeEntries()}
          </div>
        </div>
      </div>
    `;
  }

  renderCostsSummary() {
    return `
      <div class="space-y-4">
        <!-- Costs Breakdown Chart -->
        <div class="h-48">
          <canvas id="costsBreakdownChart"></canvas>
        </div>

        <!-- Recent Expenses -->
        <div class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Recent Expenses</h4>
          <div class="space-y-2">
            ${this.renderRecentExpenses()}
          </div>
        </div>
      </div>
    `;
  }

  renderRecentActivities() {
    if (!this.recentActivities.length) {
      return `
        <div class="text-center text-gray-500 py-4">
          No recent activities
        </div>
      `;
    }

    return `
      <div class="flow-root">
        <ul role="list" class="-mb-8">
          ${this.recentActivities.map((activity, idx) => `
            <li>
              <div class="relative pb-8">
                ${idx < this.recentActivities.length - 1 ? `
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                        aria-hidden="true"></span>
                ` : ''}
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                                ${this.getActivityTypeClasses(activity.type)}">
                      <span class="mdi ${this.getActivityTypeIcon(activity.type)} text-lg"></span>
                    </span>
                  </div>
                  <div class="min-w-0 flex-1 flex justify-between space-x-4">
                    <div>
                      <p class="text-sm text-gray-500">${activity.description}</p>
                    </div>
                    <div class="text-right text-sm whitespace-nowrap text-gray-500">
                      ${this.formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  renderDocumentsList() {
    return `
      <div class="space-y-4">
        ${this.projectDocuments?.map(doc => `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="mdi ${this.getDocumentTypeIcon(doc.type)} text-gray-400 mr-3"></span>
              <div>
                <h4 class="text-sm font-medium text-gray-900">${doc.name}</h4>
                <p class="text-xs text-gray-500">
                  Updated ${this.formatDate(doc.lastModified)}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="projectOverview.viewDocument('${doc.documentId}')"
                      class="text-gray-400 hover:text-gray-600">
                <span class="mdi mdi-eye"></span>
              </button>
              <button onclick="projectOverview.downloadDocument('${doc.documentId}')"
                      class="text-gray-400 hover:text-gray-600">
                <span class="mdi mdi-download"></span>
              </button>
            </div>
          </div>
        `).join('') || `
          <div class="text-center text-gray-500 py-4">
            No documents uploaded
          </div>
        `}
      </div>
    `;
  }

  async initializeCharts() {
    await this.initializeWeeklyHoursChart();
    await this.initializeCostsBreakdownChart();
  }

  async initializeWeeklyHoursChart() {
    const ctx = document.getElementById('weeklyHoursChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.weeklyData.map(w => w.week),
        datasets: [{
          label: 'Hours',
          data: this.weeklyData.map(w => w.hours),
          backgroundColor: '#3B82F6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `${value}h`
            }
          }
        }
      }
    });
  }

  async initializeCostsBreakdownChart() {
    const ctx = document.getElementById('costsBreakdownChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Materials', 'Subcontractors', 'Other'],
        datasets: [{
          data: [
            this.metrics.materialsSpent,
            this.metrics.subcontractorCosts,
            0
          ],
          backgroundColor: [
            '#10B981', // green
            '#F59E0B', // yellow
            '#6B7280'  // gray
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  formatHours(hours) {
    return `${hours.toFixed(1)}h`;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString();
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  async refresh() {
    try {
      const [metrics, activities] = await Promise.all([
        this.fetchProjectMetrics(),
        this.fetchRecentActivities()
      ]);

      this.metrics = metrics;
      this.recentActivities = activities;

      await this.initializeCharts();
      
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ProjectOverview.refresh',
        projectId: this.projectId
      });
    }
  }
}