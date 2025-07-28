// Demo authentication for testing when Firebase has issues
export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export const createDemoUser = (): DemoUser => {
  return {
    uid: 'demo-user-' + Date.now(),
    email: 'demo@senali.app',
    displayName: 'Demo User',
    photoURL: null
  };
};

export const isDemoMode = () => {
  return localStorage.getItem('senali_demo_mode') === 'true';
};

export const enableDemoMode = () => {
  localStorage.setItem('senali_demo_mode', 'true');
};

export const disableDemoMode = () => {
  localStorage.removeItem('senali_demo_mode');
};

export const getDemoUser = (): DemoUser | null => {
  if (!isDemoMode()) return null;
  
  const saved = localStorage.getItem('senali_demo_user');
  if (saved) {
    return JSON.parse(saved);
  }
  
  const user = createDemoUser();
  localStorage.setItem('senali_demo_user', JSON.stringify(user));
  return user;
};

export const signOutDemo = () => {
  localStorage.removeItem('senali_demo_user');
  disableDemoMode();
};