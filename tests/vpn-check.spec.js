const { test } = require('@playwright/test');

// Simple VPN diagnostics: check IP and country
// Uses public endpoints that return IP/geo. If blocked, try alternatives.
test('VPN check: outbound IP and country', async ({ page }) => {
	await page.goto('https://api.ipify.org?format=json', { waitUntil: 'domcontentloaded' });
	const ipJson = await page.textContent('body');
	console.log('Outbound IP (ipify):', ipJson);

	await page.goto('https://ipinfo.io/json', { waitUntil: 'domcontentloaded' });
	const ipInfo = await page.textContent('body');
	console.log('IP details (ipinfo):', ipInfo);
}); 