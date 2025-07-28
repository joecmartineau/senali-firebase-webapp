import { getAuth } from 'firebase/auth';

// Firebase Functions URLs - use local server in development
const FUNCTIONS_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api'
  : 'https://us-central1-senali-235fb.cloudfunctions.net';

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Helper to make authenticated API calls
async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${FUNCTIONS_BASE_URL}/${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('API Request failed:', {
      url: `${FUNCTIONS_BASE_URL}/${endpoint}`,
      status: response.status,
      statusText: response.statusText,
      error
    });
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Family Profile API functions
export const familyProfilesAPI = {
  // Get all family profiles for the current user
  async getAll() {
    const endpoint = import.meta.env.DEV 
      ? 'family-profiles'
      : 'getFamilyProfiles';
    return makeAuthenticatedRequest(endpoint);
  },

  // Create a new family profile
  async create(profileData: any) {
    const endpoint = import.meta.env.DEV 
      ? 'family-profiles'
      : 'createFamilyProfile';
    console.log('Creating family profile:', profileData);
    console.log('Using endpoint:', endpoint);
    console.log('Base URL:', FUNCTIONS_BASE_URL);
    return makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  },

  // Update an existing family profile
  async update(profileId: string, profileData: any) {
    return makeAuthenticatedRequest(`updateFamilyProfile?id=${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Delete a family profile
  async delete(profileId: string) {
    return makeAuthenticatedRequest(`deleteFamilyProfile?id=${profileId}`, {
      method: 'DELETE'
    });
  }
};

// Migration helper - move localStorage data to Firebase
export async function migrateLocalStorageToFirebase(userId: string) {
  try {
    console.log('🔄 Starting migration from localStorage to Firebase...');
    
    const storageKey = `senali_family_members_${userId}`;
    const localData = localStorage.getItem(storageKey);
    
    if (!localData) {
      console.log('No local data to migrate');
      return;
    }

    const localProfiles = JSON.parse(localData);
    console.log(`Found ${localProfiles.length} profiles to migrate`);

    // Create each profile in Firebase
    for (const profile of localProfiles) {
      try {
        await familyProfilesAPI.create({
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          relation: profile.relation,
          questionnaire: profile.questionnaire || []
        });
        console.log(`✓ Migrated profile: ${profile.name}`);
      } catch (error) {
        console.error(`✗ Failed to migrate profile ${profile.name}:`, error);
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem(storageKey);
    console.log('🎉 Migration completed - localStorage cleared');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}