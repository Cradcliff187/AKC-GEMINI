// Main component registry
const ComponentRegistry = {
  // Project Management
  ProjectManager: {
    template: 'ProjectManager',
    dependencies: ['CustomerManager', 'ActivityLog'],
    routes: ['/projects', '/project/:id']
  },
  
  // Customer Management
  CustomerManager: {
    template: 'CustomerManager',
    dependencies: ['ActivityLog'],
    routes: ['/customers', '/customer/:id']
  },
  
  // Estimate Management
  EstimateManager: {
    template: 'EstimateManager',
    dependencies: ['ProjectManager', 'CustomerManager', 'ActivityLog'],
    routes: ['/estimates', '/estimate/:id']
  },
  
  // Time Tracking
  TimeTracker: {
    template: 'TimeTracker',
    dependencies: ['ProjectManager', 'ActivityLog'],
    routes: ['/time', '/time/:projectId']
  },
  
  // Vendor Management
  VendorManager: {
    template: 'VendorManager',
    dependencies: ['ProjectManager', 'ActivityLog'],
    routes: ['/vendors', '/vendor/:id']
  },
  
  // Subcontractor Management
  SubcontractorManager: {
    template: 'SubcontractorManager',
    dependencies: ['ProjectManager', 'ActivityLog'],
    routes: ['/subcontractors', '/subcontractor/:id']
  },
  
  // System Settings
  SystemSettings: {
    template: 'SystemSettings',
    dependencies: ['ActivityLog'],
    routes: ['/settings']
  }
};

// Export for GAS template inclusion
window.ComponentRegistry = ComponentRegistry;