const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require("socket.io");
const path = require('path');
const fs = require('fs');
const selfsigned = require('selfsigned');
const { networkInterfaces } = require('os');

const app = express();
const USE_HTTPS = process.env.USE_HTTPS !== 'false';

// Configuration
const PORT = process.env.PORT || 3000;
const MAX_HISTORY = 100;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_HTTP_BUFFER_SIZE = 15 * 1024 * 1024;

function getLanIps() {
    const nets = networkInterfaces();
    const ips = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                ips.push(net.address);
            }
        }
    }
    return ips;
}

function loadHttpsOptions() {
    const keyPath = process.env.SSL_KEY_PATH;
    const certPath = process.env.SSL_CERT_PATH;
    if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };
    }

    const attrs = [{ name: 'commonName', value: 'local-sync-board' }];
    const altNames = [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' }
    ];
    const lanIps = getLanIps();
    lanIps.forEach((ip) => altNames.push({ type: 7, ip }));

    const pems = selfsigned.generate(attrs, {
        days: 365,
        keySize: 2048,
        extensions: [{ name: 'subjectAltName', altNames }]
    });

    return { key: pems.private, cert: pems.cert };
}

const server = USE_HTTPS
    ? https.createServer(loadHttpsOptions(), app)
    : http.createServer(app);

const io = new Server(server, {
    maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE
});

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
        let newMessage = null;

        if (typeof msg === 'string') {
            if (msg.trim().length === 0) {
                return;
            }

            newMessage = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                type: 'text',
                content: msg,
                timestamp: new Date().toISOString()
            };
        } else if (msg && typeof msg === 'object' && msg.type === 'image' && typeof msg.dataUrl === 'string') {
            const match = msg.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
            if (!match) {
                socket.emit('message_error', { reason: 'image-invalid' });
                return;
            }

            const base64Data = msg.dataUrl.split(',')[1] || '';
            const padding = (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
            const estimatedBytes = Math.floor(base64Data.length * 3 / 4) - padding;

            if (estimatedBytes > MAX_IMAGE_BYTES) {
                socket.emit('message_error', { reason: 'image-too-large', limit: MAX_IMAGE_BYTES });
                return;
            }

            newMessage = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                type: 'image',
                dataUrl: msg.dataUrl,
                mime: match[1],
                size: estimatedBytes,
                timestamp: new Date().toISOString()
            };
        } else {
            return;
        }

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
    const protocol = USE_HTTPS ? 'https' : 'http';
    console.log(`Local access: ${protocol}://localhost:${PORT}`);
    const lanIps = getLanIps();
    lanIps.forEach((ip) => {
        console.log(`LAN access: ${protocol}://${ip}:${PORT}`);
    });
    if (USE_HTTPS && !process.env.SSL_KEY_PATH) {
        console.log('Using self-signed HTTPS certificate. Browsers may warn until trusted.');
    }
});
