class DashboardDataService {
  static async fetchDashboardMetrics() {
    try {
      const [projects, estimates, financials] = await Promise.all([
        this.getProjectMetrics(),
        this.getEstimateMetrics(),
        this.getFinancialMetrics()
      ]);

      return {
        activeProjects: projects.active,
        pendingEstimates: estimates.pending,
        totalRevenue: financials.totalRevenue,
        outstandingAmount: financials.outstandingAmount,
        projectStatuses: projects.statusDistribution,
        revenueByMonth: financials.monthlyRevenue
      };
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'DashboardDataService.fetchDashboardMetrics'
      });
      return null;
    }
  }

  static async getProjectMetrics() {
    return await google.script.run
      .withSuccessHandler(data => data)
      .withFailureHandler(error => {
        throw error;
      })
      .getProjectMetricsForDashboard();
  }

  static async getEstimateMetrics() {
    return await google.script.run
      .withSuccessHandler(data => data)
      .withFailureHandler(error => {
        throw error;
      })
      .getEstimateMetricsForDashboard();
  }

  static async getFinancialMetrics() {
    return await google.script.run
      .withSuccessHandler(data => data)
      .withFailureHandler(error => {
        throw error;
      })
      .getFinancialMetricsForDashboard();
  }

  static async fetchRecentActivity(limit = 10) {
    return await google.script.run
      .withSuccessHandler(activities => activities)
      .withFailureHandler(error => {
        throw error;
      })
      .getRecentActivitiesForDashboard(limit);
  }
}