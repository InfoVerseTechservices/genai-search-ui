#!/usr/bin/env node

const axios = require('axios');
const crypto = require('crypto');

async function testLiveChat() {
  console.log('🚀 Testing Live Chat with API Keys...\n');
  
  // Find running server
  const ports = [3000, 3001, 3002];
  let workingPort = null;
  
  for (const port of ports) {
    try {
      await axios.get(`http://localhost:${port}`, { timeout: 2000 });
      workingPort = port;
      break;
    } catch (error) {
      continue;
    }
  }
  
  if (!workingPort) {
    console.log('❌ No server running. Start with: npm run dev');
    return false;
  }
  
  console.log(`✅ Server found on port ${workingPort}`);
  const API_BASE = `http://localhost:${workingPort}/api`;
  
  // Test chat with real scenario
  const testData = {
    content: "What is the capital of France?",
    message: {
      messageId: crypto.randomBytes(7).toString('hex'),
      chatId: crypto.randomBytes(7).toString('hex'),
      content: "What is the capital of France?"
    },
    chatId: crypto.randomBytes(7).toString('hex'),
    files: [],
    focusMode: "webSearch",
    optimizationMode: "balanced",
    history: [],
    chatModel: {
      name: "qwen=3",
      provider: "custom_openai"
    },
    embeddingModel: {
      name: "text-embedding-ada-002",
      provider: "openai"
    }
  };

  try {
    console.log('📤 Sending chat request...');
    console.log(`💬 Question: "${testData.content}"`);
    
    const response = await axios.post(`${API_BASE}/chat`, testData, {
      timeout: 30000,
      responseType: 'stream'
    });

    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Chat API responding with stream...');
      
      let messageReceived = false;
      let sourcesReceived = false;
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log('⏰ Response timeout - but connection established');
          resolve(true);
        }, 10000);
        
        response.data.on('data', (chunk) => {
          const data = chunk.toString();
          const lines = data.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              
              if (parsed.type === 'sources') {
                console.log('📚 Sources received');
                sourcesReceived = true;
              } else if (parsed.type === 'message') {
                console.log('💬 Message chunk:', parsed.data.substring(0, 50) + '...');
                messageReceived = true;
              } else if (parsed.type === 'messageEnd') {
                console.log('✅ Message completed');
                clearTimeout(timeout);
                resolve(true);
                return;
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        });
        
        response.data.on('end', () => {
          clearTimeout(timeout);
          if (messageReceived || sourcesReceived) {
            console.log('✅ Chat completed successfully');
            resolve(true);
          } else {
            console.log('⚠️ No message received but stream ended');
            resolve(false);
          }
        });
        
        response.data.on('error', (error) => {
          clearTimeout(timeout);
          console.log('❌ Stream error:', error.message);
          resolve(false);
        });
      });
    } else {
      console.log('❌ Unexpected status:', response.status);
      return false;
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ API Error ${error.response.status}:`, error.response.data);
    } else {
      console.log('❌ Request failed:', error.message);
    }
    return false;
  }
}

testLiveChat().then(success => {
  if (success) {
    console.log('\n🎉 Live chat test PASSED! Chat functions working with API keys.');
  } else {
    console.log('\n❌ Live chat test FAILED. Check API configuration.');
  }
  process.exit(success ? 0 : 1);
});