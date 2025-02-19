class TimeTracker {
  constructor() {
    this.timeLogs = [];
    this.activeTimer = null;
    this.projectId = null;
    this.currentUser = null;
    this.weeklyTotal = 0;
    this.dailyTotal = 0;
    
    // Configuration
    this.config = {
      maxDailyHours: 12,
      maxWeeklyHours: 40,
      autoBreakAfter: 4, // hours
      minimumBreak: 0.5,  // hours
      hourlyRate: 75.00, // Default hourly rate
      overtimeMultiplier: 1.5
    };
  }

  async initialize() {
    try {
      await this.loadUserSettings();
      await this.loadTimeLogs();
      this.calculateTotals();
      this.renderTimeTracker();
      this.setupEventListeners();
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'TimeTracker.initialize',
        user: this.currentUser
      });
    }
  }

  render() {
    return `
      <div class="space-y-6 p-6">
        <!-- Current Timer -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Time Tracker</h2>
              <p class="text-sm text-gray-500">
                Weekly Total: ${this.formatHours(this.weeklyTotal)}
              </p>
            </div>
            ${this.renderActiveTimer()}
          </div>
        </div>

        <!-- Project Selection -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Select Project</h3>
          ${this.renderProjectSelector()}
        </div>

        <!-- Time Logs -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Recent Time Logs</h3>
            <button onclick="timeTracker.showTimeLogModal()" 
                    class="btn-secondary">
              <span class="mdi mdi-plus mr-2"></span>
              Manual Entry
            </button>
          </div>
          ${this.renderTimeLogs()}
        </div>
      </div>
    `;
  }

  async startTimer(projectId) {
    if (this.activeTimer) {
      throw new Error('Timer already running');
    }

    if (this.willExceedDailyLimit(0.25)) { // Check if 15 more minutes would exceed
      NotificationSystem.show('warning', 'Approaching daily hour limit');
    }

    this.activeTimer = {
      projectId,
      startTime: new Date(),
      breaks: []
    };

    this.scheduleBreakCheck();
    this.updateTimerDisplay();
  }

  async stopTimer() {
    if (!this.activeTimer) {
      throw new Error('No active timer');
    }

    const timeLog = {
      projectId: this.activeTimer.projectId,
      startTime: this.activeTimer.startTime,
      endTime: new Date(),
      breaks: this.activeTimer.breaks,
      total: this.calculateDuration(
        this.activeTimer.startTime, 
        new Date(), 
        this.activeTimer.breaks
      )
    };

    await this.saveTimeLog(timeLog);
    this.activeTimer = null;
    this.updateTimerDisplay();
  }

  async saveTimeLog(timeLog) {
    try {
      await this.validateTimeEntry(timeLog);

      const result = await google.script.run
        .withSuccessHandler(response => response)
        .withFailureHandler(error => {
          throw error;
        })
        .saveTimeLog({
          ProjectID: timeLog.projectId,
          Date: timeLog.startTime,
          Hours: timeLog.total,
          Description: timeLog.description || '',
          Status: 'pending'
        });

      this.timeLogs.unshift(result);
      this.calculateTotals();
      NotificationSystem.show('success', 'Time log saved');

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'TimeTracker.saveTimeLog',
        timeLog,
        user: this.currentUser
      });
      throw error;
    }
  }

  validateTimeEntry(timeLog) {
    const validationRules = [
      {
        test: () => timeLog.total > 0,
        message: 'Time entry must be greater than 0'
      },
      {
        test: () => !this.willExceedDailyLimit(timeLog.total),
        message: 'Time entry would exceed daily limit'
      },
      {
        test: () => !this.willExceedWeeklyLimit(timeLog.total),
        message: 'Time entry would exceed weekly limit'
      },
      {
        test: () => timeLog.projectId,
        message: 'Project must be selected'
      }
    ];

    const failures = validationRules
      .filter(rule => !rule.test())
      .map(rule => rule.message);

    if (failures.length) {
      throw new Error(`Validation failed: ${failures.join(', ')}`);
    }

    return true;
  }

  async generateReport(options = {}) {
    try {
      const {
        startDate = this.getStartOfWeek(),
        endDate = this.getEndOfWeek(),
        projectId = null,
        format = 'weekly'
      } = options;

      // Get filtered time logs
      const logs = await this.getFilteredLogs(startDate, endDate, projectId);
      
      // Calculate summaries
      const summary = {
        totalHours: this.calculateTotalHours(logs),
        byProject: this.groupByProject(logs),
        byDay: this.groupByDay(logs),
        overtime: this.calculateOvertime(logs),
        breaks: this.summarizeBreaks(logs)
      };

      return this.renderReport(summary, format);
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'TimeTracker.generateReport',
        options,
        user: this.currentUser
      });
      throw error;
    }
  }

  renderReport(summary, format) {
    switch(format) {
      case 'weekly':
        return `
          <div class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="stat-card">
                  <span class="stat-label">Total Hours</span>
                  <span class="stat-value">${this.formatHours(summary.totalHours)}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Overtime</span>
                  <span class="stat-value">${this.formatHours(summary.overtime)}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Break Time</span>
                  <span class="stat-value">${this.formatHours(summary.breaks.total)}</span>
                </div>
              </div>
            </div>

            <!-- Project Breakdown -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h4 class="text-md font-medium text-gray-900 mb-4">By Project</h4>
              ${this.renderProjectBreakdown(summary.byProject)}
            </div>

            <!-- Daily Breakdown -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h4 class="text-md font-medium text-gray-900 mb-4">Daily Hours</h4>
              ${this.renderDailyBreakdown(summary.byDay)}
            </div>
          </div>
        `;

      case 'payroll':
        return this.renderPayrollReport(summary);

      case 'project':
        return this.renderProjectReport(summary);

      default:
        throw new Error(`Unknown report format: ${format}`);
    }
  }

  renderProjectBreakdown(projectHours) {
    return `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${Object.entries(projectHours).map(([projectId, hours]) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${this.getProjectName(projectId)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${this.formatHours(hours)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${this.formatCurrency(this.calculateCost(hours))}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  calculateOvertime(logs) {
    const weeklyHours = this.calculateTotalHours(logs);
    return Math.max(0, weeklyHours - this.config.maxWeeklyHours);
  }

  exportToSpreadsheet(summary) {
    return google.script.run
      .withSuccessHandler(response => {
        NotificationSystem.show('success', 'Report exported successfully');
        return response;
      })
      .withFailureHandler(error => {
        throw error;
      })
      .exportTimeReport(summary);
  }

  getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  getEndOfWeek(date = new Date()) {
    const start = this.getStartOfWeek(date);
    return new Date(start.setDate(start.getDate() + 6));
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatHours(hours) {
    return `${hours.toFixed(2)}h`;
  }

  calculateProjectCosts(logs) {
    const costs = {
      laborCosts: this.calculateLaborCosts(logs),
      overtimeCosts: this.calculateOvertimeCosts(logs),
      totalCost: 0,
      byProject: {}
    };

    // Calculate costs by project
    const projectGroups = this.groupByProject(logs);
    Object.entries(projectGroups).forEach(([projectId, projectLogs]) => {
      costs.byProject[projectId] = {
        regular: this.calculateLaborCosts(projectLogs),
        overtime: this.calculateOvertimeCosts(projectLogs),
        total: 0
      };
      costs.byProject[projectId].total = 
        costs.byProject[projectId].regular + 
        costs.byProject[projectId].overtime;
    });

    costs.totalCost = costs.laborCosts + costs.overtimeCosts;
    return costs;
  }

  calculateLaborCosts(logs) {
    const regularHours = Math.min(
      this.calculateTotalHours(logs),
      this.config.maxWeeklyHours
    );
    return regularHours * this.config.hourlyRate;
  }

  calculateOvertimeCosts(logs) {
    const overtimeHours = Math.max(
      0,
      this.calculateTotalHours(logs) - this.config.maxWeeklyHours
    );
    return overtimeHours * (this.config.hourlyRate * 1.5); // Time and a half
  }

  renderCostReport(costs) {
    return `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Cost Analysis</h3>
        
        <!-- Summary -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="stat-card">
            <span class="stat-label">Regular Labor</span>
            <span class="stat-value">${this.formatCurrency(costs.laborCosts)}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Overtime</span>
            <span class="stat-value">${this.formatCurrency(costs.overtimeCosts)}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Cost</span>
            <span class="stat-value">${this.formatCurrency(costs.totalCost)}</span>
          </div>
        </div>

        <!-- Project Breakdown -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Project
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Regular
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Overtime
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${Object.entries(costs.byProject).map(([projectId, projectCost]) => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.getProjectName(projectId)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatCurrency(projectCost.regular)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatCurrency(projectCost.overtime)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${this.formatCurrency(projectCost.total)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ... additional methods for reports, exports, and calculations
}