class ProjectTimeSummary {
  constructor(projectId) {
    this.projectId = projectId;
    this.summary = {
      totalHours: 0,
      userBreakdown: [],
      weeklyData: [],
      estimatedHours: 0
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Summary Header -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Time Summary</h3>
              <p class="text-sm text-gray-500">Project time tracking overview</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">
                ${this.summary.totalHours.toFixed(2)}h
              </div>
              <div class="text-sm text-gray-500">
                of ${this.summary.estimatedHours}h estimated
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                    this.getProgressColor()
                  }">
                    Progress
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-semibold inline-block ${
                    this.getProgressTextColor()
                  }">
                    ${this.calculateProgress()}%
                  </span>
                </div>
              </div>
              <div class="flex h-2 mb-4 overflow-hidden bg-gray-200 rounded">
                <div style="width:${this.calculateProgress()}%" 
                     class="shadow-none flex flex-col text-center whitespace-nowrap justify-center ${
                       this.getProgressBarColor()
                     }">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Entries by User -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Time by User</h3>
          <div class="space-y-4">
            ${this.renderUserBreakdown()}
          </div>
        </div>

        <!-- Weekly Distribution -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Distribution</h3>
          <div class="relative h-64">
            <canvas id="weeklyDistributionChart"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  renderUserBreakdown() {
    return this.summary.userBreakdown.map(user => `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mdi mdi-account text-gray-400 mr-2"></span>
          <span class="text-sm font-medium text-gray-900">${user.name}</span>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-500">${user.hours.toFixed(2)}h</div>
          <div class="text-sm text-gray-500">${
            ((user.hours / this.summary.totalHours) * 100).toFixed(1)
          }%</div>
        </div>
      </div>
    `).join('');
  }

  calculateProgress() {
    if (!this.summary.estimatedHours) return 0;
    return Math.min(
      (this.summary.totalHours / this.summary.estimatedHours) * 100,
      100
    ).toFixed(1);
  }

  getProgressColor() {
    const progress = this.calculateProgress();
    if (progress > 90) return 'bg-red-100 text-red-800';
    if (progress > 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  getProgressTextColor() {
    const progress = this.calculateProgress();
    if (progress > 90) return 'text-red-600';
    if (progress > 75) return 'text-yellow-600';
    return 'text-green-600';
  }

  getProgressBarColor() {
    const progress = this.calculateProgress();
    if (progress > 90) return 'bg-red-500';
    if (progress > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  initializeWeeklyChart() {
    const ctx = document.getElementById('weeklyDistributionChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.summary.weeklyData.map(w => w.week),
        datasets: [{
          label: 'Hours',
          data: this.summary.weeklyData.map(w => w.hours),
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
    return chart;
  }

  async refresh() {
    try {
      this.summary = await google.script.run
        .withSuccessHandler(data => data)
        .withFailureHandler(error => {
          throw error;
        })
        .getProjectTimeSummary(this.projectId);

      this.initializeWeeklyChart();
      
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ProjectTimeSummary.refresh',
        projectId: this.projectId
      });
    }
  }
}