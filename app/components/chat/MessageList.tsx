"use client";

import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useState } from "react";

import Avatar from "../Avatar";
import TypingBubble from "./TypingBubble";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  typingUsers?: { [key: string]: string };
  participantImages?: { [key: string]: string | null };
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  typingUsers = {},
  participantImages = {},
}) => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);

    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM dd, HH:mm");
    }
  };

  const shouldShowDateSeparator = (
    currentMessage: Message,
    previousMessage?: Message
  ) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);

    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const formatDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp);

    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMMM dd, yyyy");
    }
  };

  const shouldShowAvatar = (currentMessage: Message, nextMessage?: Message) => {
    if (!nextMessage) return true;
    return currentMessage.senderId !== nextMessage.senderId;
  };

  const shouldShowSenderName = (
    currentMessage: Message,
    previousMessage?: Message
  ) => {
    if (!previousMessage) return true;
    return currentMessage.senderId !== previousMessage.senderId;
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === currentUserId;
        const previousMessage = index > 0 ? messages[index - 1] : undefined;
        const nextMessage =
          index < messages.length - 1 ? messages[index + 1] : undefined;
        const showDateSeparator = shouldShowDateSeparator(
          message,
          previousMessage
        );
        const showAvatar = shouldShowAvatar(message, nextMessage);
        const showSenderName =
          shouldShowSenderName(message, previousMessage) && !isOwnMessage;
        const isSelected = selectedMessage === message.id;

        return (
          <div key={message.id}>
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDateSeparator(message.createdAt)}
                </div>
              </div>
            )}

            <div
              className={`flex items-end space-x-2 mb-1 ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
              onClick={() => setSelectedMessage(isSelected ? null : message.id)}
            >
              {!isOwnMessage && (
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar ? (
                    <Avatar src={message.sender.image} size="small" />
                  ) : (
                    <div className="w-8 h-8"></div>
                  )}
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md ${
                  isOwnMessage ? "order-1" : "order-2"
                }`}
              >
                {showSenderName && (
                  <div className="text-xs text-gray-500 mb-1 px-3">
                    {message.sender.name}
                  </div>
                )}

                <div
                  className={`
                    px-4 py-2 rounded-2xl cursor-pointer transition-all duration-200
                    ${
                      isOwnMessage
                        ? "bg-rose-500 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }
                    ${isSelected ? "shadow-lg" : "hover:shadow-md"}
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                {isSelected && (
                  <div
                    className={`text-xs text-gray-500 mt-1 px-3 ${
                      isOwnMessage ? "text-right" : "text-left"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                )}
              </div>

              {isOwnMessage && (
                <div className="w-8 h-8 flex-shrink-0 order-2">
                  {showAvatar ? (
                    <Avatar src={message.sender.image} size="small" />
                  ) : (
                    <div className="w-8 h-8"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {Object.entries(typingUsers).map(([userId, userName]) => (
        <TypingBubble
          key={userId}
          userName={userName}
          userImage={participantImages[userId]}
        />
      ))}
    </div>
  );
};

export default MessageList;
