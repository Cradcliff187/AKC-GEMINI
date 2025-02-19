class Dashboard {
  constructor() {
    this.metrics = {
      activeProjects: 0,
      pendingEstimates: 0,
      totalCustomers: 0,
      recentActivities: []
    };
  }

  render() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        ${this.renderMetricCards()}
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${this.renderRecentActivity()}
        ${this.renderPendingTasks()}
      </div>
    `;
  }

  renderMetricCards() {
    const cards = [
      {
        title: 'Active Projects',
        value: this.metrics.activeProjects,
        icon: 'briefcase',
        color: 'blue'
      },
      {
        title: 'Pending Estimates',
        value: this.metrics.pendingEstimates,
        icon: 'file-document',
        color: 'yellow'
      },
      {
        title: 'Total Customers',
        value: this.metrics.totalCustomers,
        icon: 'account-group',
        color: 'green'
      }
    ];

    return cards.map(card => `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">${card.title}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">${card.value}</p>
          </div>
          <div class="bg-${card.color}-100 rounded-full p-3">
            <span class="mdi mdi-${card.icon} text-${card.color}-600 text-xl"></span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderRecentActivity() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div class="flow-root">
          <ul class="-mb-8">
            ${this.metrics.recentActivities.map((activity, idx) => `
              <li>
                <div class="relative pb-8">
                  ${idx < this.metrics.recentActivities.length - 1 ? 
                    '<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>' : ''}
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white 
                                 bg-${this.getActivityColor(activity.type)}-100">
                        <span class="mdi mdi-${this.getActivityIcon(activity.type)} 
                                   text-${this.getActivityColor(activity.type)}-600"></span>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">${activity.description}</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        <time datetime="${activity.timestamp}">${this.formatDate(activity.timestamp)}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}