"use client";

import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";

import Avatar from "../Avatar";

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

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageAt: string;
  reservationId?: string;
  otherParticipant: {
    id: string;
    name: string | null;
    image: string | null;
  };
  lastMessage?: Message;
  reservation?: {
    listing: {
      id: string;
      title: string;
      imageSrc: string | string[];
    };
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId,
}) => {
  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) {
      return "No messages yet";
    }

    const isOwnMessage = conversation.lastMessage.senderId === currentUserId;
    const preview =
      conversation.lastMessage.content.length > 50
        ? `${conversation.lastMessage.content.substring(0, 50)}...`
        : conversation.lastMessage.content;

    return isOwnMessage ? `You: ${preview}` : preview;
  };

  const getTimeDisplay = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "HH:mm");
    } else if (diffInHours < 168) {
      // 7 days
      return format(date, "EEE");
    } else {
      return format(date, "MMM dd");
    }
  };

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.id === conversation.id;
        const hasUnread = false; // TODO: Implement unread logic

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`
              p-3 cursor-pointer transition hover:bg-gray-50 border-b border-gray-100
              ${isSelected ? "bg-rose-50 border-l-4 border-l-rose-500" : ""}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <Avatar
                  src={conversation.otherParticipant.image}
                  size="small"
                />
                {hasUnread && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className={`text-sm font-medium truncate ${
                      hasUnread ? "font-semibold" : ""
                    }`}
                  >
                    {conversation.otherParticipant.name || "Unknown User"}
                  </h4>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {conversation.lastMessage
                      ? getTimeDisplay(conversation.lastMessage.createdAt)
                      : getTimeDisplay(conversation.lastMessageAt)}
                  </span>
                </div>

                {conversation.reservation && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="relative w-6 h-6 rounded overflow-hidden">
                      <Image
                        src={
                          Array.isArray(
                            conversation.reservation.listing.imageSrc
                          )
                            ? conversation.reservation.listing.imageSrc[0]
                            : conversation.reservation.listing.imageSrc
                        }
                        alt={conversation.reservation.listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-600 truncate">
                      {conversation.reservation.listing.title}
                    </span>
                  </div>
                )}

                <p
                  className={`text-sm text-gray-600 truncate ${
                    hasUnread ? "font-medium text-gray-900" : ""
                  }`}
                >
                  {getLastMessagePreview(conversation)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
