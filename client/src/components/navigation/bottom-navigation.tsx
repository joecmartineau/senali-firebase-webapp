import { MessageCircle, Lightbulb, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "tips", label: "Tips", icon: Lightbulb },
    { id: "history", label: "History", icon: History },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="bg-neuro-surface border-t border-neuro-primary/20 safe-area-inset-bottom">
      <div className="flex justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center py-3 px-4 transition-all duration-200 touch-manipulation",
                "min-h-[64px] min-w-[64px] rounded-lg",
                isActive 
                  ? "text-neuro-primary bg-neuro-primary/10 transform scale-105" 
                  : "text-neuro-text-secondary hover:text-neuro-primary hover:bg-neuro-primary/5"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 mb-1 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive && "font-semibold"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
