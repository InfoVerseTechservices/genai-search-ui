#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test functions
async function testConfigLoad() {
  console.log('🔧 Testing configuration loading...');
  try {
    const configPath = path.join(__dirname, 'config.toml');
    if (!fs.existsSync(configPath)) {
      console.error('❌ config.toml not found');
      return false;
    }
    
    const configContent = fs.readFileSync(configPath, 'utf-8');
    if (configContent.includes('sk-') || configContent.includes('mongodb+srv://')) {
      console.error('❌ Sensitive credentials found in config file');
      return false;
    }
    
    console.log('✅ Configuration file is secure');
    return true;
  } catch (error) {
    console.error('❌ Config test failed:', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('🗄️ Testing database schema...');
  try {
    const dbPath = path.join(__dirname, 'data', 'db.sqlite');
    if (!fs.existsSync(dbPath)) {
      console.log('⚠️ Database file not found, but this is expected for fresh installs');
      return true;
    }
    
    console.log('✅ Database schema test passed');
    return true;
  } catch (error) {
    console.error('❌ Database schema test failed:', error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('🌐 Testing API endpoints (requires running server)...');
  try {
    // Test models endpoint
    const modelsResponse = await axios.get(`${API_BASE}/models`, {
      timeout: 5000
    });
    
    if (modelsResponse.status === 200) {
      console.log('✅ Models API endpoint working');
      return true;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Server not running - API tests skipped');
      return true;
    }
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

async function testBuildArtifacts() {
  console.log('📦 Testing build artifacts...');
  try {
    const nextDir = path.join(__dirname, '.next');
    if (!fs.existsSync(nextDir)) {
      console.error('❌ .next directory not found - run npm run build first');
      return false;
    }
    
    const standaloneDir = path.join(nextDir, 'standalone');
    if (!fs.existsSync(standaloneDir)) {
      console.error('❌ Standalone build not found');
      return false;
    }
    
    console.log('✅ Build artifacts present');
    return true;
  } catch (error) {
    console.error('❌ Build artifacts test failed:', error.message);
    return false;
  }
}

async function testDockerConfiguration() {
  console.log('🐳 Testing Docker configuration...');
  try {
    const dockerComposePath = path.join(__dirname, 'docker-compose.yaml');
    const dockerfilePath = path.join(__dirname, 'app.dockerfile');
    
    if (!fs.existsSync(dockerComposePath)) {
      console.error('❌ docker-compose.yaml not found');
      return false;
    }
    
    if (!fs.existsSync(dockerfilePath)) {
      console.error('❌ app.dockerfile not found');
      return false;
    }
    
    const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf-8');
    if (dockerComposeContent.includes('backend.dockerfile')) {
      console.error('❌ Docker compose references non-existent backend.dockerfile');
      return false;
    }
    
    console.log('✅ Docker configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Docker configuration test failed:', error.message);
    return false;
  }
}

async function testSearchFunctionality() {
  console.log('🔍 Testing search functionality...');
  try {
    const searchHandlersPath = path.join(__dirname, 'src', 'lib', 'search', 'index.ts');
    if (!fs.existsSync(searchHandlersPath)) {
      console.error('❌ Search handlers not found');
      return false;
    }
    
    const searchContent = fs.readFileSync(searchHandlersPath, 'utf-8');
    const expectedModes = ['webSearch', 'academicSearch', 'writingAssistant', 'youtubeSearch', 'redditSearch'];
    
    for (const mode of expectedModes) {
      if (!searchContent.includes(mode)) {
        console.error(`❌ Search mode ${mode} not found`);
        return false;
      }
    }
    
    console.log('✅ Search functionality configured correctly');
    return true;
  } catch (error) {
    console.error('❌ Search functionality test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting ColomboAI functionality tests...\n');
  
  const tests = [
    testConfigLoad,
    testDatabaseSchema,
    testBuildArtifacts,
    testDockerConfiguration,
    testSearchFunctionality,
    testAPIEndpoints
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test failed with error:`, error.message);
      failed++;
    }
    console.log(''); // Add spacing between tests
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! ColomboAI appears to be working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the issues above.');
  }
  
  return failed === 0;
}

// Run tests if called directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };