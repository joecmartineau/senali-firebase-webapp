import { localStorage } from './local-storage';

// Function to clear incorrect profiles like "Name"
export async function clearWrongProfiles(userId: string) {
  try {
    await localStorage.init();
    const profiles = await localStorage.getChildProfiles(userId);
    
    // List of incorrect "names" that should be removed
    const wrongNames = ['Name', 'Names', 'Called', 'Call', 'Known', 'Calling', 'Title', 'Titled'];
    
    for (const profile of profiles) {
      if (wrongNames.includes(profile.childName)) {
        console.log(`🗑️ Removing incorrect profile: ${profile.childName}`);
        await localStorage.deleteChildProfile(profile.id);
      }
    }
    
    console.log('✅ Cleaned up incorrect profiles');
  } catch (error) {
    console.error('Error cleaning profiles:', error);
  }
}

// Add delete method to localStorage
declare module './local-storage' {
  interface LocalStorage {
    deleteChildProfile(profileId: string): Promise<void>;
  }
}