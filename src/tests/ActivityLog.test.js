describe('ActivityLog Tests', () => {
  let activityManager;

  beforeEach(() => {
    activityManager = new ActivityLogManager();
  });

  describe('Activity Logging', () => {
    test('should successfully log an activity', async () => {
      const activityData = {
        action: 'CREATE',
        moduleType: 'PROJECT',
        referenceId: 'PRJ-001',
        details: { name: 'New Project', customer: 'CUST-001' }
      };

      const result = await activityManager.logActivity(
        activityData.action,
        activityData.moduleType,
        activityData.referenceId,
        activityData.details
      );

      expect(result.logId).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    test('should validate required fields', async () => {
      await expect(
        activityManager.logActivity(null, 'PROJECT', 'PRJ-001')
      ).rejects.toThrow('Action is required');
    });
  });

  describe('Activity Display', () => {
    test('should format activity message correctly', () => {
      const activity = {
        action: 'UPDATE',
        moduleType: 'PROJECT',
        userEmail: 'user@example.com',
        timestamp: new Date().toISOString()
      };

      const message = activityManager.formatActivityMessage(activity);
      expect(message).toContain('Updated project by user@example.com');
    });

    test('should assign correct icon classes', () => {
      const createClasses = activityManager.getActivityIconClasses('CREATE');
      const updateClasses = activityManager.getActivityIconClasses('UPDATE');
      const deleteClasses = activityManager.getActivityIconClasses('DELETE');

      expect(createClasses).toContain('bg-green-100');
      expect(updateClasses).toContain('bg-blue-100');
      expect(deleteClasses).toContain('bg-red-100');
    });
  });

  describe('Activity Filtering', () => {
    beforeEach(() => {
      activityManager.activities = [
        {
          moduleType: 'PROJECT',
          action: 'CREATE',
          timestamp: '2025-02-19T10:00:00Z'
        },
        {
          moduleType: 'ESTIMATE',
          action: 'UPDATE',
          timestamp: '2025-02-19T11:00:00Z'
        }
      ];
    });

    test('should filter by module type', () => {
      activityManager.filterByModule('PROJECT');
      expect(activityManager.activities.length).toBe(1);
      expect(activityManager.activities[0].moduleType).toBe('PROJECT');
    });

    test('should filter by date range', () => {
      const startDate = new Date('2025-02-19T09:00:00Z');
      const endDate = new Date('2025-02-19T10:30:00Z');
      
      activityManager.filterByDateRange(startDate, endDate);
      expect(activityManager.activities.length).toBe(1);
      expect(activityManager.activities[0].action).toBe('CREATE');
    });
  });

  describe('Activity Details Formatting', () => {
    test('should format JSON details correctly', () => {
      const details = JSON.stringify({
        oldValue: 'DRAFT',
        newValue: 'PENDING',
        changedBy: 'user@example.com'
      });

      const formatted = activityManager.formatActivityDetails(details);
      expect(formatted).toContain('oldValue');
      expect(formatted).toContain('DRAFT');
      expect(formatted).toContain('PENDING');
    });

    test('should handle invalid JSON gracefully', () => {
      const invalidDetails = 'invalid json';
      const formatted = activityManager.formatActivityDetails(invalidDetails);
      expect(formatted).toBe(invalidDetails);
    });
  });

  describe('Activity Timestamps', () => {
    test('should format recent timestamps as time', () => {
      const recentDate = new Date();
      const formatted = activityManager.formatTimestamp(recentDate.toISOString());
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    test('should format older timestamps as date', () => {
      const oldDate = new Date('2025-01-01T10:00:00Z');
      const formatted = activityManager.formatTimestamp(oldDate.toISOString());
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('Permission Checks', () => {
    test('should verify user permissions for viewing activities', () => {
      const hasPermission = activityManager.canViewActivities();
      expect(hasPermission).toBeDefined();
    });

    test('should filter activities based on user role', () => {
      // Mock admin user
      const adminActivities = activityManager.getAccessibleActivities('ADMIN');
      expect(adminActivities.length).toBeGreaterThan(0);

      // Mock regular user
      const userActivities = activityManager.getAccessibleActivities('USER');
      expect(userActivities.length).toBeLessThanOrEqual(adminActivities.length);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with notification system', async () => {
      const spy = jest.spyOn(NotificationSystem, 'notify');
      
      await activityManager.logActivity('CREATE', 'PROJECT', 'PRJ-001');
      
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          message: expect.any(String)
        })
      );
    });

    test('should integrate with error handling system', async () => {
      const spy = jest.spyOn(ErrorHandler, 'handleError');
      
      await activityManager.logActivity('INVALID', 'PROJECT', 'PRJ-001');
      
      expect(spy).toHaveBeenCalled();
    });
  });
});