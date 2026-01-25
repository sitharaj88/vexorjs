/**
 * Real-Time Chat Example
 *
 * Demonstrates Vexor's real-time features:
 * - Server-Sent Events (SSE) for real-time messaging
 * - Pub/Sub for message broadcasting
 * - JWT authentication
 *
 * Run with: npx tsx examples/realtime-chat/index.ts
 */

import { Vexor, VexorContext } from '../../packages/vexor/src/index.js';
import { JWT } from '../../packages/vexor/src/auth/jwt.js';
import { MemoryPubSubAdapter, Subscription } from '../../packages/vexor/src/realtime/pubsub.js';
import { SSEStream } from '../../packages/vexor/src/realtime/sse.js';

// Simple validation helpers
function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

interface ValidationResult<T> {
  valid: boolean;
  value: T;
  errors?: string[];
}

function validateLogin(data: unknown): ValidationResult<{ username: string; password: string }> {
  if (!isObject(data)) {
    return { valid: false, value: { username: '', password: '' }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isString(data.username) || data.username.length < 2 || data.username.length > 50) {
    errors.push('Username must be 2-50 characters');
  }
  if (!isString(data.password) || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (errors.length > 0) {
    return { valid: false, value: { username: '', password: '' }, errors };
  }
  return { valid: true, value: { username: data.username as string, password: data.password as string } };
}

function validateRegister(data: unknown): ValidationResult<{ username: string; password: string; avatar?: string }> {
  if (!isObject(data)) {
    return { valid: false, value: { username: '', password: '' }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isString(data.username) || data.username.length < 2 || data.username.length > 50) {
    errors.push('Username must be 2-50 characters');
  }
  if (!isString(data.password) || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (errors.length > 0) {
    return { valid: false, value: { username: '', password: '' }, errors };
  }
  return {
    valid: true,
    value: {
      username: data.username as string,
      password: data.password as string,
      avatar: isString(data.avatar) ? data.avatar : undefined,
    },
  };
}

function validateCreateRoom(data: unknown): ValidationResult<{ name: string }> {
  if (!isObject(data)) {
    return { valid: false, value: { name: '' }, errors: ['Invalid body'] };
  }
  if (!isString(data.name) || data.name.length < 1 || data.name.length > 100) {
    return { valid: false, value: { name: '' }, errors: ['Name must be 1-100 characters'] };
  }
  return { valid: true, value: { name: data.name } };
}

function validateSendMessage(data: unknown): ValidationResult<{ content: string; roomId: string }> {
  if (!isObject(data)) {
    return { valid: false, value: { content: '', roomId: '' }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isString(data.content) || data.content.length < 1 || data.content.length > 2000) {
    errors.push('Content must be 1-2000 characters');
  }
  if (!isString(data.roomId) || data.roomId.length < 1) {
    errors.push('Room ID is required');
  }
  if (errors.length > 0) {
    return { valid: false, value: { content: '', roomId: '' }, errors };
  }
  return { valid: true, value: { content: data.content as string, roomId: data.roomId as string } };
}

function validateJoinRoom(data: unknown): ValidationResult<{ roomId: string }> {
  if (!isObject(data)) {
    return { valid: false, value: { roomId: '' }, errors: ['Invalid body'] };
  }
  if (!isString(data.roomId) || data.roomId.length < 1) {
    return { valid: false, value: { roomId: '' }, errors: ['Room ID is required'] };
  }
  return { valid: true, value: { roomId: data.roomId } };
}

// Create Vexor app
const app = new Vexor({
  port: 3001,
  logging: true,
});

// Initialize JWT Auth
const jwt = new JWT({
  secret: 'your-super-secret-key-change-in-production',
  expiresIn: '24h',
});

// Initialize Pub/Sub
const pubsub = new MemoryPubSubAdapter();

// In-memory stores
interface User {
  id: string;
  username: string;
  password: string; // In production, use hashed passwords!
  avatar?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  createdBy: string;
  members: Set<string>;
}

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  type: 'message' | 'join' | 'leave' | 'system';
}

interface ConnectedClient {
  clientId: string;
  userId: string;
  username: string;
  rooms: Set<string>;
  stream: SSEStream;
  subscriptions: Subscription[];
}

const users = new Map<string, User>([
  ['1', { id: '1', username: 'alice', password: 'password123', avatar: '👩' }],
  ['2', { id: '2', username: 'bob', password: 'password456', avatar: '👨' }],
]);

const rooms = new Map<string, ChatRoom>([
  ['general', { id: 'general', name: 'General', createdBy: '1', members: new Set() }],
  ['tech', { id: 'tech', name: 'Tech Talk', createdBy: '2', members: new Set() }],
]);

const messages = new Map<string, ChatMessage[]>();
const connectedClients = new Map<string, ConnectedClient>();

// Auth middleware
async function authMiddleware(ctx: VexorContext): Promise<Response | void> {
  const token = ctx.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    return ctx.status(401).json({ error: 'Authorization required' });
  }

  try {
    const result = await jwt.verify(token);
    ctx.set('user', result.payload);
  } catch {
    return ctx.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Routes

// Health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    connections: connectedClients.size,
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get('/', (ctx) => {
  return ctx.json({
    name: 'Vexor Real-Time Chat',
    version: '1.0.0',
    features: ['SSE Streaming', 'Pub/Sub', 'JWT Auth', 'Rooms'],
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login'],
      rooms: ['GET /rooms', 'POST /rooms', 'GET /rooms/:id/messages'],
      chat: ['GET /chat/stream', 'POST /chat/join', 'POST /chat/leave', 'POST /chat/send'],
    },
  });
});

// Auth routes
app.group('/auth', (auth) => {
  // Register
  auth.post('/register', async (ctx) => {
    const body = await ctx.readJson();
    const result = validateRegister(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { username, password, avatar } = result.value;

    // Check if username exists
    const existingUser = Array.from(users.values()).find(u => u.username === username);
    if (existingUser) {
      return ctx.status(409).json({ error: 'Username already taken' });
    }

    const id = String(Date.now());
    const user: User = { id, username, password, avatar: avatar || '👤' };
    users.set(id, user);

    const token = await jwt.sign({ userId: id, username });

    return ctx.status(201).json({
      user: { id, username, avatar: user.avatar },
      token,
    });
  });

  // Login
  auth.post('/login', async (ctx) => {
    const body = await ctx.readJson();
    const result = validateLogin(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { username, password } = result.value;

    const user = Array.from(users.values()).find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return ctx.status(401).json({ error: 'Invalid credentials' });
    }

    const token = await jwt.sign({ userId: user.id, username: user.username });

    return ctx.json({
      user: { id: user.id, username: user.username, avatar: user.avatar },
      token,
    });
  });

  // Get current user
  auth.get('/me', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const payload = ctx.get('user') as { userId: string; username: string };
    const user = users.get(payload.userId);

    if (!user) {
      return ctx.notFound('User not found');
    }

    return ctx.json({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    });
  });
});

// Room routes
app.group('/rooms', (roomsApi) => {
  // List all rooms
  roomsApi.get('/', (ctx) => {
    const roomList = Array.from(rooms.values()).map(r => ({
      id: r.id,
      name: r.name,
      memberCount: r.members.size,
    }));

    return ctx.json({ rooms: roomList });
  });

  // Create room (requires auth)
  roomsApi.post('/', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const body = await ctx.readJson();
    const result = validateCreateRoom(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { name } = result.value;
    const payload = ctx.get('user') as { userId: string };

    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (rooms.has(id)) {
      return ctx.status(409).json({ error: 'Room already exists' });
    }

    const room: ChatRoom = {
      id,
      name,
      createdBy: payload.userId,
      members: new Set(),
    };
    rooms.set(id, room);
    messages.set(id, []);

    // Broadcast new room to all connected clients
    pubsub.publish('rooms', JSON.stringify({ type: 'room_created', room: { id, name, memberCount: 0 } }));

    return ctx.status(201).json({ room: { id, name, memberCount: 0 } });
  });

  // Get room details
  roomsApi.get('/:id', (ctx) => {
    const room = rooms.get(ctx.params.id);

    if (!room) {
      return ctx.notFound('Room not found');
    }

    return ctx.json({
      id: room.id,
      name: room.name,
      memberCount: room.members.size,
      members: Array.from(room.members),
    });
  });

  // Get room messages
  roomsApi.get('/:id/messages', (ctx) => {
    const room = rooms.get(ctx.params.id);

    if (!room) {
      return ctx.notFound('Room not found');
    }

    const roomMessages = messages.get(ctx.params.id) || [];
    const limit = parseInt(ctx.queryParam('limit') as string) || 50;
    const before = ctx.queryParam('before');

    let filtered = roomMessages;
    if (before) {
      const index = roomMessages.findIndex(m => m.id === before);
      if (index > 0) {
        filtered = roomMessages.slice(Math.max(0, index - limit), index);
      }
    } else {
      filtered = roomMessages.slice(-limit);
    }

    return ctx.json({ messages: filtered });
  });
});

// Chat routes (SSE-based real-time messaging)
app.group('/chat', (chat) => {
  // SSE Stream - Connect and receive real-time messages
  chat.get('/stream', async (ctx) => {
    // Get token from query param
    const token = ctx.queryParam('token') as string;
    if (!token) {
      return ctx.status(401).json({ error: 'Token required in query param' });
    }

    let payload: { userId: string; username: string };
    try {
      const result = await jwt.verify(token);
      payload = result.payload as { userId: string; username: string };
    } catch {
      return ctx.status(401).json({ error: 'Invalid token' });
    }

    const clientId = ctx.requestId;
    const stream = new SSEStream();

    // Store connection
    const client: ConnectedClient = {
      clientId,
      userId: payload.userId,
      username: payload.username,
      rooms: new Set(),
      stream,
      subscriptions: [],
    };
    connectedClients.set(clientId, client);

    // Send connected message
    stream.sendEvent('connected', JSON.stringify({
      clientId,
      user: { userId: payload.userId, username: payload.username },
    }));

    // Subscribe to room events
    const roomSub = await pubsub.subscribe('rooms', (msg) => {
      stream.sendEvent('room_update', msg as string);
    });
    client.subscriptions.push(roomSub);

    // Handle disconnect
    const signal = ctx.req.request.signal;
    if (signal) {
      signal.addEventListener('abort', () => {
        // Cleanup subscriptions
        for (const sub of client.subscriptions) {
          sub.unsubscribe();
        }

        // Leave all rooms
        for (const roomId of client.rooms) {
          const room = rooms.get(roomId);
          if (room) {
            room.members.delete(client.userId);

            const leaveMessage: ChatMessage = {
              id: String(Date.now()),
              roomId,
              userId: client.userId,
              username: client.username,
              content: `${client.username} disconnected`,
              timestamp: new Date().toISOString(),
              type: 'leave',
            };

            const roomMessages = messages.get(roomId) || [];
            roomMessages.push(leaveMessage);
            messages.set(roomId, roomMessages);

            pubsub.publish(`room:${roomId}`, JSON.stringify({
              type: 'user_left',
              message: leaveMessage,
              memberCount: room.members.size,
            }));
          }
        }

        connectedClients.delete(clientId);
        stream.close();
      });
    }

    return stream.getResponse();
  });

  // Join a room
  chat.post('/join', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const body = await ctx.readJson();
    const result = validateJoinRoom(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { roomId } = result.value;
    const payload = ctx.get('user') as { userId: string; username: string };

    const room = rooms.get(roomId);
    if (!room) {
      return ctx.notFound('Room not found');
    }

    // Find client connection
    const clientId = ctx.header('x-client-id');
    const client = clientId ? connectedClients.get(clientId) : null;

    // Add to room
    room.members.add(payload.userId);

    if (client) {
      client.rooms.add(roomId);

      // Subscribe to room messages
      const sub = await pubsub.subscribe(`room:${roomId}`, (msg) => {
        client.stream.sendEvent('room_message', msg as string);
      });
      client.subscriptions.push(sub);
    }

    // Broadcast join message
    const joinMessage: ChatMessage = {
      id: String(Date.now()),
      roomId,
      userId: payload.userId,
      username: payload.username,
      content: `${payload.username} joined the room`,
      timestamp: new Date().toISOString(),
      type: 'join',
    };

    const roomMessages = messages.get(roomId) || [];
    roomMessages.push(joinMessage);
    messages.set(roomId, roomMessages);

    pubsub.publish(`room:${roomId}`, JSON.stringify({
      type: 'user_joined',
      message: joinMessage,
      memberCount: room.members.size,
    }));

    return ctx.json({
      joined: true,
      roomId,
      roomName: room.name,
      memberCount: room.members.size,
    });
  });

  // Leave a room
  chat.post('/leave', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const body = await ctx.readJson();
    const result = validateJoinRoom(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { roomId } = result.value;
    const payload = ctx.get('user') as { userId: string; username: string };

    const room = rooms.get(roomId);
    if (!room) {
      return ctx.notFound('Room not found');
    }

    // Remove from room
    room.members.delete(payload.userId);

    // Find client connection
    const clientId = ctx.header('x-client-id');
    const client = clientId ? connectedClients.get(clientId) : null;

    if (client) {
      client.rooms.delete(roomId);
    }

    // Broadcast leave message
    const leaveMessage: ChatMessage = {
      id: String(Date.now()),
      roomId,
      userId: payload.userId,
      username: payload.username,
      content: `${payload.username} left the room`,
      timestamp: new Date().toISOString(),
      type: 'leave',
    };

    const roomMessages = messages.get(roomId) || [];
    roomMessages.push(leaveMessage);
    messages.set(roomId, roomMessages);

    pubsub.publish(`room:${roomId}`, JSON.stringify({
      type: 'user_left',
      message: leaveMessage,
      memberCount: room.members.size,
    }));

    return ctx.json({ left: true, roomId });
  });

  // Send a message
  chat.post('/send', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const body = await ctx.readJson();
    const result = validateSendMessage(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { content, roomId } = result.value;
    const payload = ctx.get('user') as { userId: string; username: string };

    const room = rooms.get(roomId);
    if (!room) {
      return ctx.notFound('Room not found');
    }

    // Check if user is in room
    if (!room.members.has(payload.userId)) {
      return ctx.status(403).json({ error: 'You must join the room first' });
    }

    const chatMessage: ChatMessage = {
      id: String(Date.now()),
      roomId,
      userId: payload.userId,
      username: payload.username,
      content,
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    const roomMessages = messages.get(roomId) || [];
    roomMessages.push(chatMessage);
    messages.set(roomId, roomMessages);

    // Broadcast to room
    pubsub.publish(`room:${roomId}`, JSON.stringify({
      type: 'new_message',
      message: chatMessage,
    }));

    return ctx.json({ sent: true, message: chatMessage });
  });

  // Send typing indicator
  chat.post('/typing', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const body = await ctx.readJson();
    const result = validateJoinRoom(body);

    if (!result.valid) {
      return ctx.json({ ok: false });
    }

    const { roomId } = result.value;
    const payload = ctx.get('user') as { userId: string; username: string };

    const room = rooms.get(roomId);
    if (!room || !room.members.has(payload.userId)) {
      return ctx.json({ ok: false });
    }

    pubsub.publish(`room:${roomId}`, JSON.stringify({
      type: 'user_typing',
      userId: payload.userId,
      username: payload.username,
      roomId,
    }));

    return ctx.json({ ok: true });
  });
});

// Error handler
app.setErrorHandler(async (error, ctx) => {
  console.error(`Error: ${error.message}`);
  return ctx.status(500).json({
    error: 'Internal server error',
    requestId: ctx.requestId,
  });
});

// Print routes
app.printRoutes();

// Start server
app.listen(3001).then(() => {
  const addr = app.address();
  if (addr) {
    console.log(`
    Real-Time Chat Server started!

    HTTP API: http://localhost:${addr.port}

    Quick Start:

    1. Register a user:
       curl -X POST http://localhost:${addr.port}/auth/register \\
         -H "Content-Type: application/json" \\
         -d '{"username": "myuser", "password": "mypassword"}'

    2. Login and get token:
       curl -X POST http://localhost:${addr.port}/auth/login \\
         -H "Content-Type: application/json" \\
         -d '{"username": "alice", "password": "password123"}'

    3. List rooms:
       curl http://localhost:${addr.port}/rooms

    4. Connect via SSE:
       curl http://localhost:${addr.port}/chat/stream?token=YOUR_JWT_TOKEN

    5. Join a room:
       curl -X POST http://localhost:${addr.port}/chat/join \\
         -H "Content-Type: application/json" \\
         -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
         -d '{"roomId": "general"}'

    6. Send a message:
       curl -X POST http://localhost:${addr.port}/chat/send \\
         -H "Content-Type: application/json" \\
         -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
         -d '{"roomId": "general", "content": "Hello everyone!"}'
    `);
  }
});
