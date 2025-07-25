// Simple localStorage persistence test
console.log('=== LOCALSTORAGE DEBUG TEST ===');

// Test 1: Save data
const testData = [{"name":"Test User","age":30,"relationship":"self"}];
localStorage.setItem('senali_family_profiles', JSON.stringify(testData));
console.log('1. Saved test data');

// Test 2: Retrieve immediately
const retrieved = localStorage.getItem('senali_family_profiles');
console.log('2. Retrieved:', retrieved);

// Test 3: Parse and validate
const parsed = JSON.parse(retrieved);
console.log('3. Parsed successfully:', Array.isArray(parsed) && parsed.length > 0);

// Test 4: Check all localStorage keys
console.log('4. All localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`   ${key}: ${localStorage.getItem(key)}`);
}

console.log('=== END TEST ===');
