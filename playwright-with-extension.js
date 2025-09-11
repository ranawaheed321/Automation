const { chromium } = require('@playwright/test');
const path = require('path');

async function testWithBrowserExtension() {
  console.log('🌐 Testing eMedicalPractice website with browser extension support...');
  console.log('');
  
  // Path to your Chrome user data directory (where extensions are stored)
  const userDataDir = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'google-chrome');
  
  const browser = await chromium.launch({ 
    headless: false, // Show the browser
    slowMo: 1000, // Slow down for visibility
    channel: 'chrome', // Use system Chrome
    args: [
      '--user-data-dir=' + userDataDir,
      '--enable-extensions',
      '--load-extension=/path/to/your/vpn/extension', // Replace with actual extension path
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Attempting to visit https://service.emedpractice.com/');
    console.log('⚠️  Note: Make sure your VPN extension is installed and active in Chrome');
    
    await page.goto('https://service.emedpractice.com/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const title = await page.title();
    console.log('✅ SUCCESS: Website loaded!');
    console.log(`📄 Page title: ${title}`);
    
    // Check for key elements
    const hasLoginForm = await page.locator('input[name="un"]').isVisible();
    const hasAIFeatures = await page.locator('text=AI Ambient Notes').isVisible();
    
    console.log('🔐 Login form found:', hasLoginForm);
    console.log('🤖 AI features found:', hasAIFeatures);
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/extension-test-success.png' });
    
    console.log('');
    console.log('🎉 Test completed successfully!');
    console.log('📸 Screenshot saved as: screenshots/extension-test-success.png');
    
    // Keep browser open for manual inspection
    console.log('💡 The browser will stay open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.log('❌ FAILED: Cannot access the website');
    console.log('');
    console.log('🔧 Browser Extension Setup Instructions:');
    console.log('');
    console.log('Step 1: Install VPN Extension in Chrome');
    console.log('   1. Open Chrome browser');
    console.log('   2. Go to Chrome Web Store');
    console.log('   3. Search for a VPN extension (e.g., "Hola VPN", "TunnelBear")');
    console.log('   4. Install the extension');
    console.log('   5. Activate the VPN and connect to US server');
    console.log('');
    console.log('Step 2: Test Manually First');
    console.log('   1. With VPN active, manually visit https://service.emedpractice.com/');
    console.log('   2. If it works, the extension is working');
    console.log('');
    console.log('Step 3: Run This Test');
    console.log('   1. Make sure VPN extension is active');
    console.log('   2. Run: npm run test-extension');
    console.log('');
    console.log('📸 Taking error screenshot...');
    await page.screenshot({ path: 'screenshots/extension-test-error.png' });
    
    // Keep browser open for debugging
    console.log('🔍 Browser will stay open for 15 seconds for debugging...');
    await page.waitForTimeout(15000);
    
  } finally {
    await browser.close();
  }
}

testWithBrowserExtension().catch(console.error); 