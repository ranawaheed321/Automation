const { chromium } = require('@playwright/test');

async function testWithVPN() {
  console.log('🌐 Testing eMedicalPractice website with VPN/Proxy configuration...');
  console.log('');
  
  // VPN/Proxy configuration options
  const vpnConfig = {
    // Option 1: Use a proxy server (if you have a VPN proxy)
    // proxy: {
    //   server: 'http://your-vpn-proxy-server:port',
    //   username: 'your-username',
    //   password: 'your-password'
    // },
    
    // Option 2: Use a SOCKS proxy (common for VPN services)
    // proxy: {
    //   server: 'socks5://your-socks-proxy:port'
    // },
    
    // Option 3: Use a US-based proxy service
    proxy: {
      server: 'http://proxy-server:port', // Replace with actual proxy
      username: 'username', // Replace with actual username
      password: 'password'  // Replace with actual password
    }
  };
  
  const browser = await chromium.launch({ 
    headless: false, // Show the browser
    slowMo: 1000, // Slow down for visibility
    // Uncomment the proxy configuration when you have VPN proxy details
    // ...vpnConfig
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Attempting to visit https://service.emedpractice.com/');
    console.log('⚠️  Note: If you have VPN proxy details, uncomment the proxy config in the code');
    
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
    await page.screenshot({ path: 'screenshots/vpn-test-success.png' });
    
    console.log('');
    console.log('🎉 Test completed successfully!');
    console.log('📸 Screenshot saved as: screenshots/vpn-test-success.png');
    
    // Keep browser open for manual inspection
    console.log('💡 The browser will stay open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.log('❌ FAILED: Cannot access the website');
    console.log('');
    console.log('🔧 VPN/Proxy Setup Instructions:');
    console.log('');
    console.log('Option 1: Use a VPN Proxy Service');
    console.log('   1. Sign up for a VPN service that provides proxy access');
    console.log('   2. Get your proxy server details (server:port)');
    console.log('   3. Update the proxy configuration in this file');
    console.log('');
    console.log('Option 2: Use a Free US Proxy');
    console.log('   1. Find a free US proxy server online');
    console.log('   2. Update the proxy configuration in this file');
    console.log('');
    console.log('Option 3: Use Browser Extension Method');
    console.log('   1. Install a VPN extension in Chrome');
    console.log('   2. Use the system browser test instead');
    console.log('');
    console.log('📸 Taking error screenshot...');
    await page.screenshot({ path: 'screenshots/vpn-test-error.png' });
    
    // Keep browser open for debugging
    console.log('🔍 Browser will stay open for 15 seconds for debugging...');
    await page.waitForTimeout(15000);
    
  } finally {
    await browser.close();
  }
}

testWithVPN().catch(console.error); 