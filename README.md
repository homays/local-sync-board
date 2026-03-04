# Local Sync Board (本地同步剪贴板)

A simple, local network real-time clipboard/text synchronization tool based on Node.js and Socket.io.

一个基于 Node.js 和 Socket.io 的简单局域网实时剪贴板/文本同步工具。

## ✨ Features (功能特性)

- **Real-time Sync (实时同步)**: Text copied or typed on one device appears instantly on all other connected devices.
- **Local Network Access (局域网访问)**: Accessible by any device (PC, Mobile, Tablet) on the same Wi-Fi/LAN.
- **Glassmorphism UI (毛玻璃界面)**: Modern, beautiful interface with smooth animations and gradient backgrounds.
- **History (历史记录)**: Keeps track of the last 100 messages.
- **One-click Copy (一键复制)**: deeply optimized copy button that works even in non-secure (HTTP) contexts typical for local networks.
- **Zero Configuration (零配置)**: Just start and use. No database required.

## 🚀 Getting Started (快速开始)

### Prerequisites (前置要求)
- Node.js (v14 or higher)
- npm

### Installation (安装)

1. Clone the repository (克隆仓库):
   ```bash
   git clone https://github.com/homays/local-sync-board.git
   cd local-sync-board
   ```

2. Install dependencies (安装依赖):
   ```bash
   npm install
   ```

3. Start the server (启动服务):
   ```bash
   npm start
   ```

4. Access the application (访问应用):
   - Local: Open `http://localhost:3000` in your browser.
   - Network: Look at the terminal output for your LAN IP and open it on other devices.

## 🛠️ Technologies (技术栈)

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript
- **Protocol**: WebSocket (via Socket.io)

## 🔒 Security Note (安全提示)

This tool is designed for **trusted local networks** (Home/Office). It does not have authentication. Anyone on your Wi-Fi can see the synced text. Do not expose this port to the public internet.

本工具设计用于**受信任的局域网环境**（家庭/办公室）。它没有身份验证功能。同一 Wi-Fi 下的任何人都可以看到同步的文本。请勿将此端口暴露给公网。