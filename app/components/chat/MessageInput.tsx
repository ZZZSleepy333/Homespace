"use client";

import { useState, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { MdAttachment } from "react-icons/md";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
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
      const maxHeight = 120; // Equivalent to roughly 5 lines
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight
      )}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

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
            onChange={(e) => setMessage(e.target.value)}
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
