/**
 * Firebase API client for family profiles
 * Direct communication with Firebase Functions
 */

import { auth } from './firebase';

export interface FamilyProfile {
  id: string;
  childName: string;
  age?: string;
  gender?: string;
  relationshipToUser?: string;
  height?: string;
  medicalDiagnoses?: string;
  workSchoolInfo?: string;
  symptoms?: Record<string, any>;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
  }
  return null;
}

// Get all family profiles
export async function getFamilyProfiles(): Promise<FamilyProfile[]> {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/children', {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching family profiles:', error);
    throw error;
  }
}

// Create family profile
export async function createFamilyProfile(profileData: Partial<FamilyProfile>): Promise<FamilyProfile> {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/children/create', {
      method: 'POST',
      headers,
      body: JSON.stringify(profileData),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating family profile:', error);
    throw error;
  }
}

// Update family profile
export async function updateFamilyProfile(profileId: string, updateData: Partial<FamilyProfile>): Promise<FamilyProfile> {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/children/${profileId}/update`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating family profile:', error);
    throw error;
  }
}

// Delete family profile
export async function deleteFamilyProfile(profileId: string): Promise<{ success: boolean }> {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/children/${profileId}/delete`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting family profile:', error);
    throw error;
  }
}