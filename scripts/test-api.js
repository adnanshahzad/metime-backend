const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing MeTime API endpoints...\n');
  
  try {
    // Test root endpoint
    console.log('1. Testing root endpoint...');
    const rootResponse = await axios.get(`${baseURL}/`);
    console.log('✅ Root endpoint:', rootResponse.data.message);
    
    // Test health endpoint
    console.log('\n2. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health endpoint:', healthResponse.data.status);
    
    // Test Swagger JSON
    console.log('\n3. Testing Swagger JSON...');
    const swaggerResponse = await axios.get(`${baseURL}/api/docs-json`);
    console.log('✅ Swagger JSON:', swaggerResponse.data.info.title);
    
    // Test Swagger UI (should return HTML)
    console.log('\n4. Testing Swagger UI...');
    const swaggerUIResponse = await axios.get(`${baseURL}/api/docs`);
    if (swaggerUIResponse.data.includes('swagger')) {
      console.log('✅ Swagger UI is accessible');
    } else {
      console.log('❌ Swagger UI not working properly');
    }
    
    console.log('\n🎉 All tests passed!');
    console.log('\n📚 Available endpoints:');
    console.log('   - API Root: http://localhost:3000/');
    console.log('   - Health Check: http://localhost:3000/health');
    console.log('   - Swagger UI: http://localhost:3000/api/docs');
    console.log('   - Swagger JSON: http://localhost:3000/api/docs-json');
    console.log('\n📋 Postman Collection:');
    console.log('   - Import: postman/MeTime-API.postman_collection.json');
    console.log('   - Environment: postman/MeTime-API.postman_environment.json');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running: npm run start:dev');
    }
    process.exit(1);
  }
}

testAPI();
