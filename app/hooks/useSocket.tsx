"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = (userId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (!socket) {
      socket = io(
        process.env.NODE_ENV === "production"
          ? process.env.NEXTAUTH_URL || ""
          : "http://localhost:3000",
        {
          path: "/api/socketio",
          addTrailingSlash: false,
        }
      );
    }

    const onConnect = () => {
      setIsConnected(true);
      setTransport(socket?.io.engine.transport.name || "N/A");

      socket?.io.engine.on("upgrade", () => {
        setTransport(socket?.io.engine.transport.name || "N/A");
      });

      if (userId) {
        socket?.emit("join-user-room", userId);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setTransport("N/A");
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
    };
  }, [userId]);

  const joinConversation = (conversationId: string) => {
    socket?.emit("join-conversation", conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socket?.emit("leave-conversation", conversationId);
  };

  const emitTypingStart = (
    conversationId: string,
    userId: string,
    userName: string
  ) => {
    socket?.emit("typing-start", { conversationId, userId, userName });
  };

  const emitTypingStop = (conversationId: string, userId: string) => {
    socket?.emit("typing-stop", { conversationId, userId });
  };

  const onNewMessage = (callback: (message: any) => void) => {
    socket?.on("new-message", callback);
    return () => socket?.off("new-message", callback);
  };

  const onTyping = (
    callback: (data: {
      userId: string;
      userName?: string;
      isTyping: boolean;
    }) => void
  ) => {
    socket?.on("user-typing", callback);
    return () => socket?.off("user-typing", callback);
  };

  const onNotification = (callback: (notification: any) => void) => {
    socket?.on("new-notification", callback);
    return () => socket?.off("new-notification", callback);
  };

  const onUserStatus = (
    callback: (data: { userId: string; status: "online" | "offline" }) => void
  ) => {
    socket?.on("user-status", callback);
    return () => socket?.off("user-status", callback);
  };

  return {
    socket,
    isConnected,
    transport,
    joinConversation,
    leaveConversation,
    emitTypingStart,
    emitTypingStop,
    onNewMessage,
    onTyping,
    onNotification,
    onUserStatus,
  };
};

export default useSocket;
