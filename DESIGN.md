# Local Sync Board Design Document

## Context
A simple, local network real-time clipboard/text synchronization tool based on Node.js.
Core requirements:
1.  **Real-time sync**: Text copied/input on Device A appears instantly on Device B.
2.  **Multi-device access**: Accessible by other devices on the same LAN.
3.  **Simple deployment**: Minimal dependencies (Node.js + Socket.io).
4.  **History**: Keep recent 50+ records.
5.  **Content type**: Plain text.
6.  **Security**: Open (no password) for ease of use in trusted local networks.

## Architecture

### Directory Structure
```
local-sync-board/
├── package.json      # Project dependencies (express, socket.io)
├── server.js         # Backend service (Node.js)
├── public/
│   └── index.html    # Frontend interface (HTML/CSS/JS in one file for simplicity)
└── DESIGN.md         # This design document
```

### Backend (server.js)
-   **Framework**: Express for static file serving.
-   **Real-time**: Socket.io for bi-directional communication.
-   **Data Storage**: In-memory array `history` (limit to 100 items).
-   **Events**:
    -   `connection`: Send current `history` to the newly connected client.
    -   `message`: Receive new text from a client, add to `history`, broadcast to all clients.
    -   `clear`: (Optional) Clear history.

### Frontend (public/index.html)
-   **UI**: Minimalist chat-room style list.
    -   Top: Header/Title.
    -   Middle: Scrollable list of text items.
    -   Bottom: Textarea + Send button.
-   **Features**:
    -   Display history list.
    -   "Copy" button next to each item to copy text to clipboard.
    -   Auto-scroll to bottom on new message.
    -   Ctrl+Enter shortcut to send.
    -   Socket.io client library integration.

## Usage
1.  Install dependencies: `npm install`
2.  Start server: `node server.js`
3.  Access: `http://localhost:3000` or `http://<LAN-IP>:3000`
