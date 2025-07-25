/**
 * Firebase Hosting client configuration
 * Switches API calls to use Firebase Functions when deployed
 */

// Detect if we're running on Firebase Hosting
const isFirebaseHosting = window.location.hostname.includes('firebaseapp.com') || 
                         window.location.hostname.includes('web.app');

// Base URL for API calls
export const API_BASE_URL = isFirebaseHosting 
  ? '' // Same origin for Firebase Hosting
  : 'http://localhost:5000'; // Local development

console.log('API Base URL:', API_BASE_URL);
console.log('Running on Firebase Hosting:', isFirebaseHosting);