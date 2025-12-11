// Quick test of Mailjet credentials
// Run this: node test-mailjet.mjs

const API_KEY = 'aa0e7b7bd15ff377f13be2cd736da46b';
const API_SECRET = 'c05e61268bc54e159ec1427ad876a2ce'; // NEW secret you just provided

const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

console.log('\n🧪 Testing Mailjet API credentials...\n');
console.log('API Key:', API_KEY);
console.log('API Secret:', API_SECRET.substring(0, 8) + '...');
console.log('Auth header:', auth.substring(0, 20) + '...\n');

const payload = {
  Messages: [
    {
      From: { Name: "Plugged", Email: "info@pluggedby212.shop" },
      To: [{ Email: "test@example.com" }],
      Subject: "Test Email",
      HTMLPart: "<h1>Test</h1>",
    },
  ],
};

fetch("https://api.mailjet.com/v3.1/send", {
  method: "POST",
  headers: {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
})
  .then(async (res) => {
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));
    
    if (res.status === 401) {
      console.log('\n❌ 401 UNAUTHORIZED - Credentials are INVALID or EXPIRED');
      console.log('Go to: https://app.mailjet.com/account/api_keys');
      console.log('Get the correct API Key and Secret Key');
    } else if (res.ok) {
      console.log('\n✅ SUCCESS - Credentials are VALID!');
    } else {
      console.log('\n⚠️ Error:', res.status);
    }
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
  });
