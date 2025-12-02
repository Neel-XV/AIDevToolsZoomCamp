import { v4 as uuidv4 } from 'uuid';

// Store for all active rooms
const rooms = new Map();

/**
 * Create a new interview room
 * @returns {string} Room ID
 */
export function createRoom() {
  const roomId = uuidv4();
  rooms.set(roomId, {
    id: roomId,
    code: '',
    language: 'javascript',
    users: new Set(),
    createdAt: new Date()
  });
  console.log(`Room created: ${roomId}`);
  return roomId;
}

/**
 * Get room by ID
 * @param {string} roomId 
 * @returns {Object|null}
 */
export function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

/**
 * Add user to room
 * @param {string} roomId 
 * @param {Object} ws - WebSocket connection
 * @returns {boolean}
 */
export function addUserToRoom(roomId, ws) {
  const room = rooms.get(roomId);
  if (!room) return false;
  
  room.users.add(ws);
  console.log(`User joined room ${roomId}. Total users: ${room.users.size}`);
  return true;
}

/**
 * Remove user from room
 * @param {string} roomId 
 * @param {Object} ws - WebSocket connection
 */
export function removeUserFromRoom(roomId, ws) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  room.users.delete(ws);
  console.log(`User left room ${roomId}. Remaining users: ${room.users.size}`);
  
  // Clean up empty rooms after 1 hour
  if (room.users.size === 0) {
    setTimeout(() => {
      const currentRoom = rooms.get(roomId);
      if (currentRoom && currentRoom.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} cleaned up (empty)`);
      }
    }, 3600000); // 1 hour
  }
}

/**
 * Update code in room
 * @param {string} roomId 
 * @param {string} code 
 * @param {string} language 
 */
export function updateRoomCode(roomId, code, language) {
  const room = rooms.get(roomId);
  if (room) {
    room.code = code;
    if (language) room.language = language;
  }
}

/**
 * Get all users in a room
 * @param {string} roomId 
 * @returns {Set}
 */
export function getRoomUsers(roomId) {
  const room = rooms.get(roomId);
  return room ? room.users : new Set();
}

/**
 * Broadcast message to all users in room except sender
 * @param {string} roomId 
 * @param {Object} message 
 * @param {Object} senderWs - WebSocket of sender to exclude
 */
export function broadcastToRoom(roomId, message, senderWs = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const messageStr = JSON.stringify(message);
  room.users.forEach(ws => {
    if (ws !== senderWs && ws.readyState === 1) { // 1 = OPEN
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error('Error broadcasting to user:', error);
      }
    }
  });
}
