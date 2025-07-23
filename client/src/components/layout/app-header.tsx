import { useAuth } from "@/hooks/useAuth";
import { Brain, ChevronDown } from "lucide-react";

export default function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <Brain className="h-6 w-6 text-black" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">NeuroParent</h1>
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
