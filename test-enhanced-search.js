const fetch = require('node-fetch');

async function testEnhancedSearch() {
  const testPayload = {
    messages: [{ role: 'user', content: 'What is artificial intelligence?' }],
    tools: ['search'],
    stream: false,
    max_output_tokens: 1024,
    temperature: 0.7,
  };

  try {
    console.log('Testing Enhanced Search with Tooling API...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch('http://localhost:3000/api/tooling-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testEnhancedSearch();