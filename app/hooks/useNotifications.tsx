"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useSocket from "./useSocket";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { onNotification } = useSocket(userId);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await axios.get("/api/notifications");
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}`, {
        read: true,
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read");

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);

      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === notificationId);
        const newNotifications = prev.filter((n) => n.id !== notificationId);

        if (notification && !notification.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }

        return newNotifications;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const cleanup = onNotification((notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast(notification.title, {
        icon: "🔔",
        duration: 4000,
      });
    });

    return cleanup
      ? () => {
          cleanup();
        }
      : undefined;
  }, [userId, onNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};

export default useNotifications;
