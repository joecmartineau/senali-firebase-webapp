import { useAuth } from "@/hooks/useAuth";
import { Bot } from "lucide-react";
import { format } from "date-fns";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuth();
  const isUser = message.role === "user";
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();

  return (
    <div className={`flex space-x-3 ${isUser ? "" : "justify-end"} message-bubble`}>
      {isUser && (
        <>
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-gray-600">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </span>
            </div>
          )}
          <div className="bg-gray-800 rounded-lg px-4 py-3 max-w-xs">
            <p className="text-white text-sm">{message.content}</p>
            <span className="text-xs text-gray-400 mt-1 block">
              {format(timestamp, "h:mm a")}
            </span>
          </div>
        </>
      )}

      {!isUser && (
        <>
          <div className="bg-green-500 rounded-lg px-4 py-3 max-w-xs text-black">
            <div className="text-sm whitespace-pre-wrap font-medium">{message.content}</div>
            <span className="text-xs text-gray-800 mt-1 block">
              {format(timestamp, "h:mm a")}
            </span>
          </div>
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-black" />
          </div>
        </>
      )}
    </div>
  );
}
