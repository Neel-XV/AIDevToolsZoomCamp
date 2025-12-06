import { useState, useEffect, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import Controls from './components/Controls';
import { wsService } from './services/websocket';
import { executeCode } from './utils/codeExecutor';
import './index.css';

const DEFAULT_CODE = {
    javascript: `// Welcome to the Coding Interview Platform!
// Write your JavaScript code here

console.log("Hello, World!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));`,
    python: `# Welcome to the Coding Interview Platform!
# Write your Python code here

print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci(10):", fibonacci(10))`
};

export default function App() {
    const [roomId, setRoomId] = useState(null);
    const [code, setCode] = useState(DEFAULT_CODE.javascript);
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [isError, setIsError] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [userCount, setUserCount] = useState(1);
    const [isConnected, setIsConnected] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // Initialize WebSocket connection
    useEffect(() => {
        wsService.connect();

        // Register event handlers
        wsService.on('connected', handleConnected);
        wsService.on('disconnected', handleDisconnected);
        wsService.on('room-created', handleRoomCreated);
        wsService.on('room-joined', handleRoomJoined);
        wsService.on('code-update', handleCodeUpdate);
        wsService.on('language-update', handleLanguageUpdate);
        wsService.on('user-joined', handleUserJoined);
        wsService.on('user-left', handleUserLeft);
        wsService.on('error', handleError);

        // Check URL for room ID
        const urlParams = new URLSearchParams(window.location.search);
        const urlRoomId = urlParams.get('room');
        if (urlRoomId) {
            setIsJoining(true);
        }

        return () => {
            wsService.off('connected', handleConnected);
            wsService.off('disconnected', handleDisconnected);
            wsService.off('room-created', handleRoomCreated);
            wsService.off('room-joined', handleRoomJoined);
            wsService.off('code-update', handleCodeUpdate);
            wsService.off('language-update', handleLanguageUpdate);
            wsService.off('user-joined', handleUserJoined);
            wsService.off('user-left', handleUserLeft);
            wsService.off('error', handleError);
            wsService.disconnect();
        };
    }, []);

    // Join room when connected and URL has room ID
    useEffect(() => {
        if (isConnected && isJoining) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlRoomId = urlParams.get('room');
            if (urlRoomId) {
                wsService.joinRoom(urlRoomId);
                setIsJoining(false);
            }
        }
    }, [isConnected, isJoining]);

    const handleConnected = () => {
        setIsConnected(true);
    };

    const handleDisconnected = () => {
        setIsConnected(false);
    };

    const handleRoomCreated = (message) => {
        setRoomId(message.roomId);
        // Update URL
        window.history.pushState({}, '', `?room=${message.roomId}`);
    };

    const handleRoomJoined = (message) => {
        setRoomId(message.roomId);
        setCode(message.code || DEFAULT_CODE[message.language] || DEFAULT_CODE.javascript);
        setLanguage(message.language || 'javascript');
        setUserCount(message.userCount || 1);
    };

    const handleCodeUpdate = (message) => {
        setCode(message.code);
    };

    const handleLanguageUpdate = (message) => {
        setLanguage(message.language);
        // Update code to default for new language if current code is empty
        if (!code.trim()) {
            setCode(DEFAULT_CODE[message.language] || '');
        }
    };

    const handleUserJoined = (message) => {
        setUserCount(message.userCount || userCount + 1);
    };

    const handleUserLeft = (message) => {
        setUserCount(message.userCount || Math.max(1, userCount - 1));
    };

    const handleError = (message) => {
        console.error('WebSocket error:', message.message);
        // Don't pollute the code output panel with connection errors
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (roomId) {
            wsService.sendCodeChange(newCode);
        }
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        if (roomId) {
            wsService.sendLanguageChange(newLanguage);
        }
        // Update code to default for new language
        setCode(DEFAULT_CODE[newLanguage] || '');
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Running...');
        setIsError(false);

        try {
            const result = await executeCode(code, language);
            setOutput(result.output);
            setIsError(!result.success);
        } catch (error) {
            setOutput(`Error: ${error.message}`);
            setIsError(true);
        } finally {
            setIsRunning(false);
        }
    };

    const handleClearOutput = () => {
        setOutput('');
        setIsError(false);
    };

    const handleCreateRoom = () => {
        wsService.createRoom();
    };

    const handleShareLink = () => {
        const shareUrl = `${window.location.origin}?room=${roomId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Share link copied to clipboard!');
        }).catch((error) => {
            console.error('Failed to copy link:', error);
            prompt('Copy this link:', shareUrl);
        });
    };

    // Welcome screen if no room
    if (!roomId) {
        return (
            <div className="welcome-container">
                <h1 className="welcome-title">Coding Interview Platform</h1>
                <p className="welcome-subtitle">
                    Collaborate in real-time with live code editing and execution.
                    Create a new interview session or join an existing one.
                </p>
                <div className="welcome-actions">
                    <button className="btn btn-primary" onClick={handleCreateRoom} disabled={!isConnected}>
                        {isConnected ? '🚀 Create New Interview' : 'Connecting...'}
                    </button>
                </div>
                {!isConnected && (
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Connecting to server...
                    </p>
                )}
            </div>
        );
    }

    // Main interview interface
    return (
        <div className="app-container">
            <header className="header">
                <h1 className="header-title">Coding Interview Platform</h1>
                <div className="header-controls">
                    <Controls
                        language={language}
                        onLanguageChange={handleLanguageChange}
                        onRun={handleRunCode}
                        onShare={handleShareLink}
                        isRunning={isRunning}
                        userCount={userCount}
                        isConnected={isConnected}
                    />
                </div>
            </header>

            <main className="main-content">
                <div className="editor-section">
                    <CodeEditor
                        code={code}
                        language={language}
                        onChange={handleCodeChange}
                        readOnly={false}
                    />
                </div>

                <OutputPanel
                    output={output}
                    isError={isError}
                    onClear={handleClearOutput}
                />
            </main>
        </div>
    );
}
