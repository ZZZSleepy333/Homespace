import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.IO server...");

    const io = new ServerIO(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join-user-room", (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      socket.on("join-conversation", (conversationId: string) => {
        socket.join(`conversation-${conversationId}`);
        console.log(
          `Socket ${socket.id} joined conversation ${conversationId}`
        );
      });

      socket.on("leave-conversation", (conversationId: string) => {
        socket.leave(`conversation-${conversationId}`);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
      });

      socket.on("typing-start", ({ conversationId, userId, userName }) => {
        socket.to(`conversation-${conversationId}`).emit("user-typing", {
          userId,
          userName,
          isTyping: true,
        });
      });

      socket.on("typing-stop", ({ conversationId, userId }) => {
        socket.to(`conversation-${conversationId}`).emit("user-typing", {
          userId,
          isTyping: false,
        });
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
