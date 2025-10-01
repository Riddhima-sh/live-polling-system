const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.IO
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-vercel-app.vercel.app"] // Replace with your Vercel domain
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ["https://your-vercel-app.vercel.app"] // Replace with your Vercel domain  
      : ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());

// Store polls data (in production, you'd use a database)
let polls = {};
let pollResults = {};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get all polls
app.get('/api/polls', (req, res) => {
  res.json(polls);
});

// Create a new poll
app.post('/api/polls', (req, res) => {
  const { question, options } = req.body;
  const pollId = Date.now().toString();
  
  polls[pollId] = {
    id: pollId,
    question,
    options: options.map((option, index) => ({
      id: index,
      text: option,
      votes: 0
    })),
    createdAt: new Date()
  };
  
  pollResults[pollId] = {};
  
  // Broadcast new poll to all connected clients
  io.emit('pollCreated', polls[pollId]);
  
  res.json(polls[pollId]);
});

// Get specific poll
app.get('/api/polls/:id', (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  res.json(poll);
});

// Vote on a poll
app.post('/api/polls/:id/vote', (req, res) => {
  const { optionId } = req.body;
  const pollId = req.params.id;
  
  if (!polls[pollId]) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  
  // Update vote count
  polls[pollId].options[optionId].votes++;
  
  // Broadcast updated results to all connected clients
  io.emit('pollUpdated', polls[pollId]);
  
  res.json(polls[pollId]);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current polls to newly connected user
  socket.emit('currentPolls', Object.values(polls));
  
  // Handle voting through socket
  socket.on('vote', (data) => {
    const { pollId, optionId } = data;
    
    if (polls[pollId] && polls[pollId].options[optionId]) {
      polls[pollId].options[optionId].votes++;
      
      // Broadcast updated results to all clients
      io.emit('pollUpdated', polls[pollId]);
    }
  });
  
  // Handle creating polls through socket
  socket.on('createPoll', (data) => {
    const { question, options } = data;
    const pollId = Date.now().toString();
    
    polls[pollId] = {
      id: pollId,
      question,
      options: options.map((option, index) => ({
        id: index,
        text: option,
        votes: 0
      })),
      createdAt: new Date()
    };
    
    pollResults[pollId] = {};
    
    // Broadcast new poll to all connected clients
    io.emit('pollCreated', polls[pollId]);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

// For Vercel, we need to export the app
if (process.env.VERCEL) {
  module.exports = app;
} else {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}