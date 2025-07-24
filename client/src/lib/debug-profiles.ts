import { localStorage } from './local-storage';

// Debug function to check profile storage
export async function debugProfiles(userId: string = 'user-1') {
  try {
    await localStorage.init();
    const profiles = await localStorage.getChildProfiles(userId);
    
    console.log('=== PROFILE DEBUG ===');
    console.log(`Total profiles found: ${profiles.length}`);
    
    if (profiles.length === 0) {
      console.log('❌ No profiles found in storage');
      return;
    }
    
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   Name: ${profile.childName}`);
      console.log(`   Relationship: ${profile.relationshipToUser}`);
      console.log(`   Age: ${profile.age || 'unknown'}`);
      console.log(`   Gender: ${profile.gender || 'unknown'}`);
      console.log(`   Created: ${profile.createdAt}`);
      console.log(`   Updated: ${profile.updatedAt}`);
    });
    
    console.log('=== END DEBUG ===');
    
    return profiles;
  } catch (error) {
    console.error('Debug profiles error:', error);
  }
}

// Add to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugProfiles = debugProfiles;
}