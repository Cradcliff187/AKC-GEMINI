describe('AKCAppManager Integration Tests', () => {
  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = `
      <div id="main-content"></div>
      <div id="navigation"></div>
    `;
    
    // Mock Google Apps Script environment
    global.google = {
      script: {
        run: {
          withSuccessHandler: (fn) => ({
            withFailureHandler: () => ({
              validateUserAccess: () => fn()
            })
          })
        }
      }
    };
  });

  test('initializes all components', () => {
    AKCAppManager.init();
    
    Object.values(AKCAppManager.components).forEach(component => {
      expect(component).not.toBeNull();
    });
  });

  test('renders dashboard as default route', () => {
    AKCAppManager.init();
    const mainContent = document.getElementById('main-content');
    
    expect(mainContent.innerHTML).toContain('Dashboard');
  });

  test('handles route changes', () => {
    AKCAppManager.init();
    
    // Simulate route change
    window.location.hash = '#/projects';
    window.dispatchEvent(new Event('hashchange'));
    
    const mainContent = document.getElementById('main-content');
    expect(mainContent.innerHTML).toContain('Projects');
  });

  test('handles authentication state changes', () => {
    AKCAppManager.init();
    
    // Simulate auth state change
    const authEvent = new CustomEvent('authStateChanged', {
      detail: { isAuthenticated: false }
    });
    document.dispatchEvent(authEvent);
    
    const mainContent = document.getElementById('main-content');
    expect(mainContent.innerHTML).toContain('Login');
  });
});