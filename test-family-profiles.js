// Simple test to check if family profiles exist
console.log('Testing family profiles...');

// Check if we can access the profiles directly
const DB_NAME = 'SenaliDB';
const VERSION = 2;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function checkProfiles() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['childProfiles'], 'readonly');
    const store = transaction.objectStore('childProfiles');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const profiles = request.result;
      console.log('📊 Total profiles in database:', profiles.length);
      
      if (profiles.length > 0) {
        console.log('👥 All profiles:');
        profiles.forEach(profile => {
          console.log(`  - ${profile.childName} (userId: ${profile.userId}, relationship: ${profile.relationshipToUser})`);
        });
        
        const user1Profiles = profiles.filter(p => p.userId === 'user-1');
        console.log('👤 Profiles for user-1:', user1Profiles.length);
        
        if (user1Profiles.length > 0) {
          console.log('✅ Found profiles for user-1:', user1Profiles.map(p => p.childName).join(', '));
        } else {
          console.log('❌ No profiles found for user-1, but found for:', 
            [...new Set(profiles.map(p => p.userId))].join(', '));
        }
      } else {
        console.log('❌ No profiles found in database at all');
      }
    };
    
    request.onerror = () => {
      console.error('❌ Error reading profiles:', request.error);
    };
  } catch (error) {
    console.error('❌ Error accessing database:', error);
  }
}

// Run the test
checkProfiles();