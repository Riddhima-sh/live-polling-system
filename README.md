# Live Polling System

A real-time polling application built with React frontend and Node.js backend using Socket.IO for live updates.

## Project Structure

```
live-polling-system/
├── frontend/          # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js backend server
│   └── package.json
└── README.md
```

## Features

- Real-time polling with Socket.IO
- React frontend for interactive user interface
- Express.js backend API
- Live vote updates across all connected clients

## Technologies Used

### Frontend
- React 18
- Vite (build tool)
- Socket.IO client

### Backend
- Node.js
- Express.js
- Socket.IO
- CORS enabled for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/live-polling-system.git
cd live-polling-system
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

## Development

The backend server runs on port 3000 and serves the API endpoints. The frontend development server runs on port 5173 and connects to the backend via Socket.IO for real-time communication.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.