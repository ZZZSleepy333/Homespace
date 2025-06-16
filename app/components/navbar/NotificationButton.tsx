"use client";

import { useState, useEffect, useRef } from "react";
import { IoNotifications, IoNotificationsOutline } from "react-icons/io5";
import { FiTrash2, FiCheck, FiCheckCircle } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

import { SafeUser } from "@/app/types";
import useNotifications from "@/app/hooks/useNotifications";
import useSocket from "@/app/hooks/useSocket";

interface NotificationButtonProps {
  currentUser?: SafeUser | null;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  currentUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useSocket(currentUser?.id);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(currentUser?.id);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle notification actions based on type
    if (notification.type === "message" && notification.data?.conversationId) {
      // Open chat modal or navigate to conversation
      console.log("Open conversation:", notification.data.conversationId);
    } else if (
      notification.type === "booking" &&
      notification.data?.reservationId
    ) {
      // Navigate to booking details
      console.log("Open booking:", notification.data.reservationId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return "💬";
      case "booking":
        return "🏠";
      case "review":
        return "⭐";
      case "payment":
        return "💳";
      default:
        return "🔔";
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative p-2 rounded-full hover:bg-neutral-100 transition
          focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
        "
      >
        {unreadCount > 0 ? (
          <IoNotifications className="w-6 h-6 text-rose-500" />
        ) : (
          <IoNotificationsOutline className="w-6 h-6 text-neutral-600" />
        )}

        {unreadCount > 0 && (
          <span
            className="
            absolute -top-1 -right-1 bg-rose-500 text-white text-xs 
            rounded-full w-5 h-5 flex items-center justify-center
            font-medium
          "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <div
          className={`
          absolute bottom-0 right-0 w-2 h-2 rounded-full
          ${isConnected ? "bg-green-500" : "bg-gray-400"}
        `}
        />
      </button>

      {isOpen && (
        <div
          className="
          absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg 
          border border-neutral-200 z-50 max-h-96 overflow-hidden
        "
        >
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="
                    text-sm text-rose-500 hover:text-rose-600 
                    flex items-center space-x-1 transition
                  "
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <IoNotificationsOutline className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">
                  We&#39;ll let you know when something happens!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 hover:bg-neutral-50 cursor-pointer transition
                      ${
                        !notification.read
                          ? "bg-rose-50 border-l-4 border-l-rose-500"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div
                        className="flex-1 min-w-0"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4
                              className={`text-sm font-medium ${
                                !notification.read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 transition"
                                title="Mark as read"
                              >
                                <FiCheck className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition"
                              title="Delete notification"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-neutral-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="
                  w-full text-center text-sm text-rose-500 hover:text-rose-600 
                  transition font-medium
                "
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
