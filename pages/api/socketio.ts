import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/lib/socket';
import { Server as ServerIO } from 'socket.io';

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket.IO server already running');
  } else {
    console.log('Socket.IO server initializing...');
    const io = new ServerIO(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Join user to their personal room for notifications
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined personal room`);
      });

      // Join conversation room for real-time chat
      socket.on('join-conversation', (conversationId: string) => {
        socket.join(`conversation-${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(`conversation-${conversationId}`);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
      });

      // Handle typing indicators
      socket.on('typing-start', ({ conversationId, userId, userName }) => {
        socket.to(`conversation-${conversationId}`).emit('user-typing', {
          userId,
          userName,
          isTyping: true
        });
      });

      socket.on('typing-stop', ({ conversationId, userId }) => {
        socket.to(`conversation-${conversationId}`).emit('user-typing', {
          userId,
          isTyping: false
        });
      });

      // Handle online status
      socket.on('user-online', (userId: string) => {
        socket.broadcast.emit('user-status', {
          userId,
          status: 'online'
        });
      });

      socket.on('user-offline', (userId: string) => {
        socket.broadcast.emit('user-status', {
          userId,
          status: 'offline'
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

