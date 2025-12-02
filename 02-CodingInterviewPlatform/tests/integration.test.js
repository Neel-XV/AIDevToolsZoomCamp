import { WebSocket } from 'ws';

const SERVER_URL = 'ws://localhost:3000';
const TEST_TIMEOUT = 10000;

/**
 * Integration Tests for Coding Interview Platform
 */

// Helper to wait for message
function waitForMessage(ws, type, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Timeout waiting for ${type}`));
        }, timeout);

        const handler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === type) {
                    clearTimeout(timer);
                    ws.off('message', handler);
                    resolve(message);
                }
            } catch (error) {
                // Ignore parsing errors
            }
        };

        ws.on('message', handler);
    });
}

// Helper to create WebSocket connection
async function createConnection() {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(SERVER_URL);

        ws.on('open', () => resolve(ws));
        ws.on('error', reject);

        setTimeout(() => reject(new Error('Connection timeout')), TEST_TIMEOUT);
    });
}

// Test Suite
async function runTests() {
    console.log('🧪 Starting Integration Tests\n');
    let passed = 0;
    let failed = 0;

    // Test 1: WebSocket Connection
    try {
        console.log('Test 1: WebSocket Connection');
        const ws = await createConnection();
        console.log('✅ PASS: Successfully connected to WebSocket server\n');
        ws.close();
        passed++;
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failed++;
    }

    // Test 2: Create Room
    try {
        console.log('Test 2: Create Room');
        const ws = await createConnection();

        ws.send(JSON.stringify({ type: 'create-room' }));
        const response = await waitForMessage(ws, 'room-created');

        if (response.roomId) {
            console.log(`✅ PASS: Room created with ID: ${response.roomId}\n`);
            passed++;
        } else {
            throw new Error('No room ID received');
        }

        ws.close();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failed++;
    }

    // Test 3: Join Room
    try {
        console.log('Test 3: Join Room');
        const ws1 = await createConnection();

        // Create room
        ws1.send(JSON.stringify({ type: 'create-room' }));
        const createResponse = await waitForMessage(ws1, 'room-created');
        const roomId = createResponse.roomId;

        // Join room with second client
        const ws2 = await createConnection();
        ws2.send(JSON.stringify({ type: 'join-room', roomId }));
        const joinResponse = await waitForMessage(ws2, 'room-joined');

        if (joinResponse.roomId === roomId) {
            console.log(`✅ PASS: Successfully joined room ${roomId}\n`);
            passed++;
        } else {
            throw new Error('Room ID mismatch');
        }

        ws1.close();
        ws2.close();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failed++;
    }

    // Test 4: Real-time Code Synchronization
    try {
        console.log('Test 4: Real-time Code Synchronization');
        const ws1 = await createConnection();
        const ws2 = await createConnection();

        // Create room
        ws1.send(JSON.stringify({ type: 'create-room' }));
        const createResponse = await waitForMessage(ws1, 'room-created');
        const roomId = createResponse.roomId;

        // Join room with second client
        ws2.send(JSON.stringify({ type: 'join-room', roomId }));
        await waitForMessage(ws2, 'room-joined');

        // Send code change from client 1
        const testCode = 'console.log("Hello from test");';
        ws1.send(JSON.stringify({ type: 'code-change', code: testCode }));

        // Wait for code update on client 2
        const updateResponse = await waitForMessage(ws2, 'code-update');

        if (updateResponse.code === testCode) {
            console.log('✅ PASS: Code synchronized between clients\n');
            passed++;
        } else {
            throw new Error('Code mismatch');
        }

        ws1.close();
        ws2.close();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failed++;
    }

    // Test 5: Language Change Synchronization
    try {
        console.log('Test 5: Language Change Synchronization');
        const ws1 = await createConnection();
        const ws2 = await createConnection();

        // Create room
        ws1.send(JSON.stringify({ type: 'create-room' }));
        const createResponse = await waitForMessage(ws1, 'room-created');
        const roomId = createResponse.roomId;

        // Join room with second client
        ws2.send(JSON.stringify({ type: 'join-room', roomId }));
        await waitForMessage(ws2, 'room-joined');

        // Send language change from client 1
        ws1.send(JSON.stringify({ type: 'language-change', language: 'python' }));

        // Wait for language update on client 2
        const updateResponse = await waitForMessage(ws2, 'language-update');

        if (updateResponse.language === 'python') {
            console.log('✅ PASS: Language change synchronized between clients\n');
            passed++;
        } else {
            throw new Error('Language mismatch');
        }

        ws1.close();
        ws2.close();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failed++;
    }

    // Test 6: Multiple Users in Room
    try {
        console.log('Test 6: Multiple Users in Room');
        const ws1 = await createConnection();
        const ws2 = await createConnection();
        const ws3 = await createConnection();

        // Create room
        ws1.send(JSON.stringify({ type: 'create-room' }));
        const createResponse = await waitForMessage(ws1, 'room-created');
        const roomId = createResponse.roomId;

        // Join room with second client
        ws2.send(JSON.stringify({ type: 'join-room', roomId }));
        const join2Response = await waitForMessage(ws2, 'room-joined');

        // Join room with third client
        ws3.send(JSON.stringify({ type: 'join-room', roomId }));
        const join3Response = await waitForMessage(ws3, 'room-joined');

        // User count should be 3
        if (join3Response.userCount === 3) {
            console.log('✅ PASS: Multiple users successfully joined room\n');
            passed++;
        } else {
            throw new Error(`Expected 3 users, got ${join3Response.userCount}`);
        }

        ws1.close();
        ws2.close();
        ws3.close();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failed++;
    }

    // Test Summary
    console.log('═══════════════════════════════════');
    console.log(`Test Results: ${passed} passed, ${failed} failed`);
    console.log('═══════════════════════════════════\n');

    if (failed > 0) {
        console.log('⚠️  Some tests failed. Please check the server logs.');
        process.exit(1);
    } else {
        console.log('🎉 All tests passed!');
        process.exit(0);
    }
}

// Check if server is running
console.log('Checking if server is running...');
const testWs = new WebSocket(SERVER_URL);

testWs.on('open', () => {
    console.log('✅ Server is running\n');
    testWs.close();
    runTests();
});

testWs.on('error', () => {
    console.error('❌ Cannot connect to server. Please start the server first:');
    console.error('   npm run dev:server\n');
    process.exit(1);
});
