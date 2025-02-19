class AppInitializer {
  static async initialize() {
    await this.loadUserSettings();
    await this.setupWorkspace();
    await this.initializeComponents();
    this.setupErrorHandling();
  }
}