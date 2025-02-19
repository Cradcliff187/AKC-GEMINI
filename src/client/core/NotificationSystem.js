class NotificationSystem {
  static notifications = [];
  static subscribers = new Set();
  
  static async initialize() {
    await this.setupWebsocket();
    this.registerServiceWorker();
  }
}