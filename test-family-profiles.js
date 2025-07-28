// Test script for family profile creation
const fetch = require('node-fetch');

const LOCAL_SERVER_URL = 'http://localhost:5000';

async function testFamilyProfileCreation() {
  console.log('🧪 Testing family profile creation...');
  
  const testProfile = {
    name: 'Joe',
    age: 35,
    gender: 'male',
    relation: 'parent'
  };

  try {
    // Test local server endpoint
    const response = await fetch(`${LOCAL_SERVER_URL}/api/family-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProfile)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Profile creation successful:', result);
    } else {
      const error = await response.text();
      console.log('❌ Profile creation failed:', response.status, error);
    }

    // Test get all profiles
    const getResponse = await fetch(`${LOCAL_SERVER_URL}/api/family-profiles`);
    if (getResponse.ok) {
      const profiles = await getResponse.json();
      console.log('✅ Get profiles successful:', profiles);
    } else {
      console.log('❌ Get profiles failed:', getResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testFamilyProfileCreation();