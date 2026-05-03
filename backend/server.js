const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);

const io = new Server(server, {
  cors: {
    origin: '*', // for local dev
    methods: ['GET', 'POST'],
  },
});

// Socket.io logic
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', ({ roomCode, username }) => {
    socket.join(roomCode);
    
    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],
        turnIndex: 0,
        gameState: 'waiting', // waiting, action_selection, answering
        currentQuestion: null,
        currentAction: null
      };
    }

    const room = rooms[roomCode];
    if (room.players.length < 2 && !room.players.find(p => p.socketId === socket.id)) {
      room.players.push({ socketId: socket.id, username });
    }

    // Notify room of players
    io.to(roomCode).emit('room_update', room);

    // Start game if 2 players
    if (room.players.length === 2 && room.gameState === 'waiting') {
      room.gameState = 'action_selection';
      io.to(roomCode).emit('game_start', room);
    }
  });

  socket.on('choose_action', ({ roomCode, action, question }) => {
    const room = rooms[roomCode];
    if (room) {
      room.gameState = 'answering';
      room.currentAction = action;
      room.currentQuestion = question;
      io.to(roomCode).emit('action_chosen', room);
    }
  });

  socket.on('next_turn', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      room.turnIndex = (room.turnIndex + 1) % 2;
      room.gameState = 'action_selection';
      room.currentAction = null;
      room.currentQuestion = null;
      io.to(roomCode).emit('turn_update', room);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // In a real app we'd clean up rooms, but for this demo keeping it simple
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
