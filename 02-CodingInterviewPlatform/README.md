# Coding Interview Platform

A complete end-to-end online coding interview platform with real-time collaborative code editing, WASM-based code execution, and WebSocket synchronization.

## 🌟 Features

- **Real-time Collaborative Editing**: Multiple users can edit code simultaneously with instant synchronization
- **Shareable Interview Links**: Create unique interview sessions with shareable URLs
- **Syntax Highlighting**: Professional code editing powered by Monaco Editor (VS Code's editor)
- **Multi-language Support**: JavaScript and Python code execution
- **Browser-based Code Execution**: Safe WASM-based execution using Pyodide (no server-side execution)
- **WebSocket Communication**: Real-time updates with automatic reconnection
- **Modern UI**: Beautiful dark theme with smooth animations and responsive design
- **Production Ready**: Dockerized deployment with health checks

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with Vite
- Monaco Editor for code editing
- Pyodide for Python WASM execution
- WebSocket client for real-time sync

**Backend:**
- Express.js server
- WebSocket (ws library) for real-time communication
- Room-based session management
- In-memory state storage

**Testing:**
- Integration tests with WebSocket clients
- Multi-client synchronization tests

**Deployment:**
- Docker with multi-stage builds
- Single container for client + server

### Project Structure

```
02-E2E/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # WebSocket service
│   │   ├── utils/          # Code execution
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── server.js       # HTTP server
│   │   ├── websocket.js    # WebSocket handlers
│   │   └── rooms.js        # Room management
│   └── package.json
├── tests/                  # Integration tests
│   └── integration.test.js
├── package.json            # Root workspace config
├── Dockerfile              # Production build
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd 02-E2E
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

   This will install dependencies for the root, client, and server.

### Development

**Run both client and server concurrently:**
```bash
npm run dev
```

This starts:
- Frontend dev server on `http://localhost:5173`
- Backend WebSocket server on `http://localhost:3000`

**Run client only:**
```bash
npm run dev:client
```

**Run server only:**
```bash
npm run dev:server
```

### Testing

**Run integration tests:**
```bash
# Start the server first
npm run dev:server

# In another terminal, run tests
npm test
```

Tests cover:
- WebSocket connection
- Room creation and joining
- Real-time code synchronization
- Language change synchronization
- Multiple concurrent users

### Production Build

**Build the frontend:**
```bash
npm run build
```

This creates an optimized production build in `client/dist/`.

**Start production server:**
```bash
npm start
```

The server will serve the built frontend and handle WebSocket connections on port 3000.

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t coding-interview-platform .
```

### Run Container

```bash
docker run -p 3000:3000 coding-interview-platform
```

Access the application at `http://localhost:3000`

### Docker Features

- Multi-stage build for optimized image size
- Health checks for container monitoring
- Production-ready Node.js configuration
- Automatic frontend build and integration

See [DOCKER.md](DOCKER.md) for detailed Docker setup and troubleshooting.

## 🌐 Cloud Deployment

### Deploy to Render

Deploy your application to the cloud with Render's free tier:

```bash
# 1. Push your code to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. Deploy using render.yaml
# - Go to https://dashboard.render.com
# - Create a new Blueprint
# - Connect your GitHub repository
# - Render will automatically detect render.yaml and deploy
```

**Your app will be live at:** `https://your-app-name.onrender.com`

📚 **See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for complete deployment instructions, troubleshooting, and configuration.**

### Other Deployment Options

This Docker-based application can be deployed to:
- **Render** (recommended) - Free tier available
- **Railway** - Easy Docker deployment
- **Fly.io** - Global edge deployment
- **AWS ECS/Fargate** - Enterprise scale
- **Google Cloud Run** - Serverless containers
- **Azure Container Instances** - Microsoft cloud


## 📖 Usage

### Creating an Interview Session

1. Open the application in your browser
2. Click "Create New Interview"
3. A unique room is created with a shareable URL
4. Copy the URL and share it with candidates/interviewers

### Joining an Interview

1. Open the shareable link
2. You'll automatically join the interview room
3. Code changes sync in real-time between all participants

### Running Code

1. Select your language (JavaScript or Python)
2. Write your code in the editor
3. Click "Run Code" to execute
4. Output appears in the right panel
5. All participants see the same output

### Features in Action

- **Live Editing**: Type code and see it appear on all connected screens instantly
- **Language Switching**: Change languages and all users are synchronized
- **Code Execution**: Run JavaScript or Python code directly in the browser
- **Connection Status**: Monitor your connection and see how many users are online

## 🧪 API Reference

### WebSocket Messages

**Client → Server:**

```javascript
// Create a new room
{ type: 'create-room' }

// Join an existing room
{ type: 'join-room', roomId: 'uuid' }

// Send code change
{ type: 'code-change', code: 'console.log("Hello");' }

// Change language
{ type: 'language-change', language: 'python' }
```

**Server → Client:**

```javascript
// Room created response
{ type: 'room-created', roomId: 'uuid' }

// Room joined response
{ type: 'room-joined', roomId: 'uuid', code: '...', language: 'javascript', userCount: 2 }

// Code update from another user
{ type: 'code-update', code: '...' }

// Language update from another user
{ type: 'language-update', language: 'python' }

// User joined notification
{ type: 'user-joined', userCount: 3 }

// User left notification
{ type: 'user-left', userCount: 2 }

// Error message
{ type: 'error', message: 'Error description' }
```

## 🔐 Security

- **No Server-side Execution**: All code runs in the browser using WASM (Pyodide for Python)
- **Sandboxed JavaScript**: JavaScript execution is sandboxed with restricted access
- **No Persistent Storage**: Room data is stored in-memory only
- **Automatic Cleanup**: Empty rooms are cleaned up after 1 hour

## 🎨 Customization

### Adding More Languages

1. Add syntax highlighting in `CodeEditor.jsx` (Monaco supports many languages)
2. Implement executor in `codeExecutor.js`
3. Add language option in `Controls.jsx`

### Theming

All styles are in `client/src/index.css` using CSS variables. Customize colors, spacing, and more by editing the `:root` section.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - feel free to use this project for your coding interviews!

## 🙏 Acknowledgments

- Monaco Editor by Microsoft
- Pyodide for Python in the browser
- WebSocket protocol for real-time communication

---

**Built with ❤️ for better coding interviews**
