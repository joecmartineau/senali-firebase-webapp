// Debug script to check family profile data in browser console
console.log('🔍 Debugging family profile data...');

async function debugFamilyData() {
  // Check IndexedDB directly
  const request = indexedDB.open('SenaliDB', 2);
  
  request.onsuccess = function(event) {
    const db = event.target.result;
    console.log('📊 Database opened successfully');
    
    // Check child profiles
    const transaction = db.transaction(['childProfiles'], 'readonly');
    const objectStore = transaction.objectStore('childProfiles');
    const getAllRequest = objectStore.getAll();
    
    getAllRequest.onsuccess = function() {
      const profiles = getAllRequest.result;
      console.log('👥 Total profiles in database:', profiles.length);
      
      if (profiles.length > 0) {
        console.log('✅ Found profiles:');
        profiles.forEach((profile, index) => {
          console.log(`  ${index + 1}. ${profile.childName} (${profile.relationshipToUser}) - userId: ${profile.userId}`);
          console.log(`     Age: ${profile.age}, Gender: ${profile.gender}`);
        });
        
        // Check for user-1 specifically
        const user1Profiles = profiles.filter(p => p.userId === 'user-1');
        console.log(`🎯 Profiles for user-1: ${user1Profiles.length}`);
        
        if (user1Profiles.length === 0) {
          console.log('❌ No profiles found for user-1!');
          console.log('📋 Available userIds:', [...new Set(profiles.map(p => p.userId))]);
        } else {
          console.log('✅ Family members for user-1:', user1Profiles.map(p => p.childName).join(', '));
        }
      } else {
        console.log('❌ No profiles found in database at all!');
      }
    };
    
    getAllRequest.onerror = function() {
      console.error('❌ Error reading profiles:', getAllRequest.error);
    };
  };
  
  request.onerror = function() {
    console.error('❌ Error opening database:', request.error);
  };
}

// Also check current user authentication
if (typeof firebase !== 'undefined' && firebase.auth) {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log('🔐 Current user:', user.uid);
      console.log('📧 User email:', user.email);
    } else {
      console.log('❌ No authenticated user');
    }
  });
}

debugFamilyData();