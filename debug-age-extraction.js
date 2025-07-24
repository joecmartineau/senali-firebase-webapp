// Test age extraction patterns
const message = "My son Sam is 12 years old and Noah is 5 years old";

console.log('Testing age extraction for message:', message);

// Test patterns for Sam
const samPatterns = [
  /Sam.*?(?:is|who is)\s*(\d+)\s*(?:years?\s*old)?/i,
  /Sam.*?(\d+)/i,
  /(\d+)\s*year[s]?[\s-]*old\s+Sam/i,
  /Sam.*?age\s+(\d+)/i
];

console.log('\n--- Testing Sam patterns ---');
samPatterns.forEach((pattern, i) => {
  const match = message.match(pattern);
  if (match) {
    console.log(`Pattern ${i + 1} matched: "${match[0]}" -> Age: ${match[1]}`);
  } else {
    console.log(`Pattern ${i + 1} no match`);
  }
});

// Test patterns for Noah
const noahPatterns = [
  /Noah.*?(?:is|who is)\s*(\d+)\s*(?:years?\s*old)?/i,
  /Noah.*?(\d+)/i,
  /(\d+)\s*year[s]?[\s-]*old\s+Noah/i,
  /Noah.*?age\s+(\d+)/i
];

console.log('\n--- Testing Noah patterns ---');
noahPatterns.forEach((pattern, i) => {
  const match = message.match(pattern);
  if (match) {
    console.log(`Pattern ${i + 1} matched: "${match[0]}" -> Age: ${match[1]}`);
  } else {
    console.log(`Pattern ${i + 1} no match`);
  }
});