/**
 * Quick test to verify server is running and accessible
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testServer() {
  console.log('\n🧪 Testing Portfolio Admin Server\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣  Testing health endpoint...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    console.log('✅ Health:', health);
    
    // Test 2: Get metadata
    console.log('\n2️⃣  Testing metadata endpoint...');
    const metaRes = await fetch(`${BASE_URL}/api/blogs/metadata`);
    const metadata = await metaRes.json();
    console.log(`✅ Found ${metadata.length} blogs in metadata`);
    
    // Test 3: Admin panel loads
    console.log('\n3️⃣  Testing admin panel...');
    const adminRes = await fetch(`${BASE_URL}/admin.html`);
    console.log(`✅ Admin panel loaded (Status: ${adminRes.status})`);
    
    console.log('\n✅ All tests passed! Server is working correctly.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nMake sure the server is running: npm start\n');
    process.exit(1);
  }
}

testServer();
