const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuration
const PORT = process.env.PORT || 3000;
const MAX_HISTORY = 100;

// Data Storage (In-memory)
let messageHistory = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send history to new connection
    socket.emit('history', messageHistory);

    // Handle incoming messages
    socket.on('message', (msg) => {
        // Basic validation: ensure it's a string and not empty
        if (typeof msg !== 'string' || msg.trim().length === 0) {
            return;
        }

        const newMessage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            content: msg,
            timestamp: new Date().toISOString()
        };

        // Add to history
        messageHistory.push(newMessage);

        // Limit history size
        if (messageHistory.length > MAX_HISTORY) {
            messageHistory.shift(); // Remove oldest
        }

        // Broadcast to everyone including sender
        io.emit('message', newMessage);
    });

    // Handle clearing history (optional, maybe hidden feature or button)
    socket.on('clear', () => {
        messageHistory = [];
        io.emit('cleared');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    // Attempt to find LAN IP to display
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`LAN access: http://${net.address}:${PORT}`);
            }
        }
    }
});
