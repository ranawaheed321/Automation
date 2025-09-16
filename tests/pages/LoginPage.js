const { credentials } = require('../fixtures/credentials');

class LoginPage {
  constructor(page) {
    this.page = page;
    // Selectors
    this.userInput = 'input[placeholder*="User" i]';
    this.passwordInput = 'input[placeholder*="Password" i]';
    this.submitButton = 'input[type="image"]';
    this.continueButton = '//*[starts-with(@class, "btn btn-success")]';
  }

  // Remove goto method - navigation will be handled in test file

  async login(username, password) {
    const user = username ?? credentials.username;
    const pass = password ?? credentials.password;
    await this.page.locator(this.userInput).fill(user);
    await this.page.locator(this.passwordInput).fill(pass);
    await this.page.locator(this.submitButton).click();
    
    // Optionally click Continue if it appears; otherwise proceed
    try {
      const btn = this.page.locator(this.continueButton);
      await btn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
      }
    } catch {}
    
    // Wait for Patients menu to appear and click it
   
  }
}

module.exports = { LoginPage };
