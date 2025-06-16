"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { format } from "date-fns";
import { IoSend, IoClose, IoPersonCircle } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiMessageSquare } from "react-icons/fi";

import useChatModal from "@/app/hooks/useChatModal";
import useSocket from "@/app/hooks/useSocket";
import { SafeUser } from "@/app/types";
import Modal from "./Modal";
import Avatar from "../Avatar";
import Button from "../Button";
import ConversationList from "../chat/ConversationList";
import MessageList from "../chat/MessageList";
import MessageInput from "../chat/MessageInput";

interface ChatModalProps {
  currentUser?: SafeUser | null;
}

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

const ChatModal: React.FC<ChatModalProps> = ({ currentUser }) => {
  const chatModal = useChatModal();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    onNewMessage,
    onTyping,
  } = useSocket(currentUser?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations when modal opens
  useEffect(() => {
    if (chatModal.isOpen && currentUser) {
      fetchConversations();
    }
  }, [chatModal.isOpen, currentUser]);

  // Auto-create conversation if coming from payment with host info
  useEffect(() => {
    if (chatModal.isOpen && chatModal.hostId && currentUser) {
      createConversationWithHost();
    }
  }, [chatModal.isOpen, chatModal.hostId, currentUser]);

  // Set up real-time message listening
  useEffect(() => {
    if (!currentUser) return;

    const cleanupMessage = onNewMessage(
      (newMessage: Message & { conversationId: string }) => {
        // Only update if the message is for the currently selected conversation
        if (selectedConversation?.id === newMessage.conversationId) {
          setMessages((prev) => {
            // Avoid duplicate messages
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (!exists) {
              return [...prev, newMessage];
            }
            return prev;
          });
        }

        // Update conversation list with latest message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === newMessage.conversationId
              ? {
                  ...conv,
                  lastMessage: newMessage,
                  lastMessageAt: newMessage.createdAt,
                }
              : conv
          )
        );
      }
    );

    const cleanupTyping = onTyping(
      (data: { userId: string; userName?: string; isTyping: boolean }) => {
        if (data.userId !== currentUser.id) {
          setTypingUsers((prev) => {
            if (data.isTyping && data.userName) {
              return { ...prev, [data.userId]: data.userName };
            } else {
              const { [data.userId]: removed, ...rest } = prev;
              return rest;
            }
          });
        }
      }
    );

    return () => {
      cleanupMessage();
      cleanupTyping();
    };
  }, [currentUser, selectedConversation?.id, onNewMessage, onTyping]);

  // Join/leave conversation rooms when selection changes
  useEffect(() => {
    if (selectedConversation?.id) {
      joinConversation(selectedConversation.id);
      return () => {
        leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation?.id, joinConversation, leaveConversation]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const createConversationWithHost = async () => {
    if (!chatModal.hostId) return;

    try {
      setIsLoading(true);

      // Send initial booking confirmation message
      const initialMessage = `Hi! I just completed my booking for "${chatModal.listingTitle}". Looking forward to my stay! 🏠✨`;

      const response = await axios.post("/api/messages", {
        content: initialMessage,
        receiverId: chatModal.hostId,
        reservationId: chatModal.reservationId,
      });

      // Refresh conversations to show the new one
      await fetchConversations();

      toast.success("Message sent to host!");
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to send message to host");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await axios.get(
        `/api/messages?conversationId=${conversationId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        senderId: currentUser!.id,
        sender: {
          id: currentUser!.id,
          name: currentUser!.name,
          image: currentUser!.image,
        },
      };

      // Optimistically add message
      setMessages((prev) => [...prev, tempMessage]);
      setMessageText("");

      const response = await axios.post("/api/messages", {
        content,
        conversationId: selectedConversation.id,
      });

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? response.data : msg))
      );

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: response.data,
                lastMessageAt: response.data.createdAt,
              }
            : conv
        )
      );
    } catch (error) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    await sendMessage(data.message);
    reset();
  };

  const bodyContent = (
    <div className="flex h-[600px]">
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FiMessageSquare className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold text-lg">Messages</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <FiMessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a conversation with a host!</p>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={selectConversation}
              currentUserId={currentUser?.id}
            />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <Avatar src={selectedConversation.otherParticipant.image} />
                <div>
                  <h4 className="font-semibold">
                    {selectedConversation.otherParticipant.name}
                  </h4>
                  {selectedConversation.reservation && (
                    <p className="text-sm text-gray-500">
                      Re: {selectedConversation.reservation.listing.title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    currentUserId={currentUser?.id}
                  />

                  {Object.keys(typingUsers).length > 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 italic">
                      {Object.values(typingUsers).join(", ")}{" "}
                      {Object.keys(typingUsers).length === 1 ? "is" : "are"}{" "}
                      typing...
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <MessageInput onSendMessage={sendMessage} disabled={isLoading} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FiMessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">
                Choose a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={chatModal.isOpen}
      onClose={chatModal.onClose}
      onSubmit={() => {}}
      title="Messages"
      body={bodyContent}
      actionLabel=""
      disabled={isLoading}
      large
    />
  );
};

export default ChatModal;
