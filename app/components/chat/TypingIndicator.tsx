"use client";

import { useState, useEffect } from "react";
import Avatar from "../Avatar";

interface TypingIndicatorProps {
  typingUsers: { [key: string]: string };
  participantImages?: { [key: string]: string | null };
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  participantImages = {},
}) => {
  const [dots, setDots] = useState("");
  const typingUserIds = Object.keys(typingUsers);
  const typingUserNames = Object.values(typingUsers);

  useEffect(() => {
    if (typingUserIds.length === 0) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "") return ".";
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return "";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [typingUserIds.length]);

  if (typingUserIds.length === 0) {
    return null;
  }

  const formatTypingText = () => {
    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing`;
    } else {
      return `${typingUserNames.slice(0, -1).join(", ")}, and ${
        typingUserNames[typingUserNames.length - 1]
      } are typing`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 animate-fadeIn">
      <div className="flex -space-x-1">
        {typingUserIds.slice(0, 3).map((userId) => (
          <div key={userId} className="relative">
            <Avatar src={participantImages[userId]} size="small" />

            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
          </div>
        ))}
        {typingUserIds.length > 3 && (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
            +{typingUserIds.length - 3}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-500 italic">
          {formatTypingText()}
        </span>
        <span className="text-sm text-gray-500 font-bold min-w-[1rem]">
          {dots}
        </span>
      </div>

      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
