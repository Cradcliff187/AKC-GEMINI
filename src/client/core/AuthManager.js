class AuthManager {
  static currentUser = null;
  static userRoles = new Set();
  
  static async initialize() {
    try {
      const userData = await google.script.run.getUserData();
      this.currentUser = userData;
      this.userRoles = new Set(userData.roles);
      this.setupAuthListeners();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.redirectToLogin();
    }
  }

  static hasPermission(permission) {
    return this.userRoles.has('ADMIN') || this.userRoles.has(permission);
  }

  static async checkSessionValidity() {
    const isValid = await google.script.run.validateSession();
    if (!isValid) {
      this.redirectToLogin();
    }
    return isValid;
  }

  static setupAuthListeners() {
    window.addEventListener('focus', () => this.checkSessionValidity());
    setInterval(() => this.checkSessionValidity(), 300000); // 5-minute check
  }
}