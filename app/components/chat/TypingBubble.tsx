"use client";

import Avatar from "../Avatar";

interface TypingBubbleProps {
  userName: string;
  userImage?: string | null;
}

const TypingBubble: React.FC<TypingBubbleProps> = ({ userName, userImage }) => {
  return (
    <div className="flex items-end space-x-2 mb-1 justify-start animate-fadeIn">
      <div className="w-8 h-8 flex-shrink-0">
        <Avatar src={userImage} size="small" />
      </div>

      <div className="max-w-xs lg:max-w-md order-2">
        <div className="text-xs text-gray-500 mb-1 px-3">
          {userName}
        </div>

        <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-md">
          <div className="flex space-x-1 items-center">
            <div className="flex space-x-1">
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">typing...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingBubble;

