const ActivityLogManager = require('../client/components/ActivityLog/ActivityLogManager');

describe('ActivityLog Tests', () => {
  let activityManager;

  beforeEach(() => {
    activityManager = new ActivityLogManager();
    // Mock Google Apps Script environment
    global.google = {
      script: {
        run: {
          withSuccessHandler: (fn) => ({
            withFailureHandler: () => ({
              logActivity: (data) => fn({
                logId: 'TEST-LOG-001',
                timestamp: new Date(),
                ...data
              })
            })
          })
        }
      }
    };
  });

  describe('Activity Logging', () => {
    test('should successfully log an activity', async () => {
      const activityData = {
        type: 'CREATE',
        moduleType: 'PROJECT',
        description: 'Created new project',
        details: { name: 'New Project', customer: 'CUST-001' }
      };

      const result = await activityManager.logActivity(activityData);

      expect(result.logId).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.type).toBe(activityData.type);
      expect(result.moduleType).toBe(activityData.moduleType);
    });

    test('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing required fields'
      };

      await expect(activityManager.logActivity(invalidData))
        .rejects
        .toThrow('Invalid activity data');
    });
  });
});