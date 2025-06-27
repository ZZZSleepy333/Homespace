"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { MdAttachment } from "react-icons/md";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  onTypingStart,
  onTypingStop,
}) => {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = useCallback(() => {
    if (!isTyping && onTypingStart) {
      setIsTyping(true);
      onTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && onTypingStop) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 2000);
  }, [isTyping, onTypingStart, onTypingStop]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping && onTypingStop) {
      setIsTyping(false);
      onTypingStop();
    }
  }, [isTyping, onTypingStop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      stopTyping(); // Stop typing when sending message
      onSendMessage(message.trim());
      setMessage("");
      resetTextareaHeight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120;
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight
      )}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && onTypingStart) {
      handleTyping();
    } else if (!value.trim() && isTyping) {
      stopTyping();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <button
        type="button"
        disabled={disabled}
        className="
          p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 
          disabled:cursor-not-allowed transition-colors rounded-full 
          hover:bg-gray-100
        "
      >
        <MdAttachment className="w-5 h-5" />
      </button>

      <div className="flex-1 relative">
        <div
          className="
          flex items-end bg-gray-100 rounded-2xl px-4 py-2 
          focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-500 
          focus-within:ring-opacity-50 transition-all
        "
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              flex-1 bg-transparent border-none outline-none resize-none 
              placeholder-gray-500 text-sm max-h-[120px] overflow-y-auto
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{ minHeight: "20px" }}
          />

          <button
            type="button"
            disabled={disabled}
            className="
              ml-2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 
              disabled:cursor-not-allowed transition-colors rounded
            "
          >
            <BsEmojiSmile className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="
          p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-500
          transition-colors flex-shrink-0
        "
      >
        <IoSend className="w-5 h-5" />
      </button>
    </form>
  );
};

export default MessageInput;
