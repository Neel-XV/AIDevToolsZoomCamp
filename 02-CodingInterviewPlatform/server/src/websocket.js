import { WebSocketServer } from 'ws';
import {
    createRoom,
    getRoom,
    addUserToRoom,
    removeUserFromRoom,
    updateRoomCode,
    broadcastToRoom
} from './rooms.js';

/**
 * Initialize WebSocket server
 * @param {Object} server - HTTP server
 */
export function initWebSocketServer(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');
        let currentRoomId = null;

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log('Received message:', message.type);

                switch (message.type) {
                    case 'create-room':
                        handleCreateRoom(ws, message);
                        break;
                    case 'join-room':
                        currentRoomId = handleJoinRoom(ws, message);
                        break;
                    case 'code-change':
                        handleCodeChange(ws, message, currentRoomId);
                        break;
                    case 'language-change':
                        handleLanguageChange(ws, message, currentRoomId);
                        break;
                    default:
                        console.warn('Unknown message type:', message.type);
                }
            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format'
                }));
            }
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
            if (currentRoomId) {
                removeUserFromRoom(currentRoomId, ws);
                // Notify other users
                broadcastToRoom(currentRoomId, {
                    type: 'user-left',
                    roomId: currentRoomId
                });
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    console.log('WebSocket server initialized');
    return wss;
}

/**
 * Handle room creation
 */
function handleCreateRoom(ws, message) {
    const roomId = createRoom();
    addUserToRoom(roomId, ws);

    ws.send(JSON.stringify({
        type: 'room-created',
        roomId: roomId
    }));
}

/**
 * Handle joining a room
 */
function handleJoinRoom(ws, message) {
    const { roomId } = message;
    const room = getRoom(roomId);

    if (!room) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Room not found'
        }));
        return null;
    }

    addUserToRoom(roomId, ws);

    // Send current room state to joining user
    ws.send(JSON.stringify({
        type: 'room-joined',
        roomId: roomId,
        code: room.code,
        language: room.language,
        userCount: room.users.size
    }));

    // Notify other users
    broadcastToRoom(roomId, {
        type: 'user-joined',
        userCount: room.users.size
    }, ws);

    return roomId;
}

/**
 * Handle code changes
 */
function handleCodeChange(ws, message, currentRoomId) {
    if (!currentRoomId) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Not in a room'
        }));
        return;
    }

    const { code } = message;
    updateRoomCode(currentRoomId, code);

    // Broadcast to other users in the room
    broadcastToRoom(currentRoomId, {
        type: 'code-update',
        code: code
    }, ws);
}

/**
 * Handle language changes
 */
function handleLanguageChange(ws, message, currentRoomId) {
    if (!currentRoomId) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Not in a room'
        }));
        return;
    }

    const { language } = message;
    updateRoomCode(currentRoomId, getRoom(currentRoomId).code, language);

    // Broadcast to other users in the room
    broadcastToRoom(currentRoomId, {
        type: 'language-update',
        language: language
    }, ws);
}
