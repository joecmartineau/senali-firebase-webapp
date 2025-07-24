import { ChevronDown } from "lucide-react";
import { InfinityIcon } from "@/components/ui/infinity-icon";

export default function AppHeader() {
  // Note: This component is not currently used in the main app flow
  // User authentication is handled directly in App.tsx

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <InfinityIcon size={40} className="rounded-lg" />
        <div>
          <h1 className="text-lg font-semibold text-white">Senali</h1>
          <p className="text-xs text-gray-300">AI Parenting Support</p>
        </div>
      </div>
      
      {user && (
        <div className="flex items-center space-x-2">
          {user.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </span>
            </div>
          )}
          <button className="text-gray-300">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
