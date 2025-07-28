import { useState, useEffect } from 'react';
import { localStorage } from '@/lib/local-storage';
import type { ChildProfile } from '@/lib/local-storage';

export function FamilyDebugPanel() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      await localStorage.init();
      const allProfiles = await localStorage.getChildProfiles('user-1');
      setProfiles(allProfiles);
      console.log('🏠 Debug: Loaded family profiles:', allProfiles.map(p => p.childName));
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading family data...</div>;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-w-xs shadow-lg z-50">
      <h3 className="font-bold text-sm mb-2">Family Debug Panel</h3>
      <div className="text-xs">
        <p className="mb-1">Total profiles: {profiles.length}</p>
        {profiles.length > 0 ? (
          <div>
            <p className="font-medium">Known family members:</p>
            <ul className="list-disc list-inside">
              {profiles.map(profile => (
                <li key={profile.id}>{profile.childName}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No family members stored</p>
        )}
        <button 
          onClick={loadProfiles}
          className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}