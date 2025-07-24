// Test script to verify family member memory works correctly

async function testFamilyMemory() {
  console.log('🧪 Testing Family Member Memory System...\n');

  try {
    // Test 1: Create family members
    console.log('Test 1: Telling Senali about family members');
    const response1 = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "My sons are named Sam and Noah. Sam is 8 years old and Noah is 6.",
        childContext: ""
      })
    });
    
    const data1 = await response1.json();
    console.log('✅ Senali Response:', data1.response);
    console.log('');

    // Test 2: Ask about family members with context (simulating after chat clear)
    console.log('Test 2: Asking about family members (with context loaded)');
    const response2 = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "What are my sons names and ages?",
        childContext: `IMPORTANT FAMILY CONTEXT - Remember these family members from previous conversations:

**CRITICAL: These family members are real and exist. Use their names when talking. Ask about them specifically. Never act like this is a new conversation or ask for their names again.**

1. Sam (Child):
   Age: 8
   Gender: male

2. Noah (Child):
   Age: 6
   Gender: male

**CRITICAL: Always use the exact names shown above. Never make up names like "Alex" or "Liam". If family context shows children named "Sam" and "Noah", use those exact names.**`
      })
    });
    
    const data2 = await response2.json();
    console.log('✅ Senali Response:', data2.response);
    console.log('');
    
    // Test 3: Ask about family without context (should ask for clarification)
    console.log('Test 3: Asking about family members (no context)');
    const response3 = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "What are my sons names?",
        childContext: ""
      })
    });
    
    const data3 = await response3.json();
    console.log('✅ Senali Response:', data3.response);
    
    console.log('\n🎯 Test Complete! Check if Senali correctly remembers Sam and Noah when context is provided.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFamilyMemory();