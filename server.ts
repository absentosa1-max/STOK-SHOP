import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_PRODUCTS,
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INCOMING_RECORDS,
  INITIAL_OUTGOING_RECORDS,
} from './src/data/mockData.js';
import { INITIAL_USERS } from './src/data/initialUsers.js';

const STORE_FILE = path.join(process.cwd(), 'data_store.json');

// Helper to load persistent state from disk
function loadPersistedState() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        products: parsed.products || INITIAL_PRODUCTS,
        logs: parsed.logs || INITIAL_LOGS,
        notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
        incomingRecords: parsed.incomingRecords || INITIAL_INCOMING_RECORDS,
        outgoingRecords: parsed.outgoingRecords || INITIAL_OUTGOING_RECORDS,
        users: parsed.users && parsed.users.length > 0 ? parsed.users : INITIAL_USERS,
      };
    }
  } catch (err) {
    console.error('[Server] Error reading persistent data_store.json:', err);
  }
  return {
    products: INITIAL_PRODUCTS,
    logs: INITIAL_LOGS,
    notifications: INITIAL_NOTIFICATIONS,
    incomingRecords: INITIAL_INCOMING_RECORDS,
    outgoingRecords: INITIAL_OUTGOING_RECORDS,
    users: INITIAL_USERS,
  };
}

// Helper to save state to disk
function savePersistedState(state: any) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Error writing to data_store.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json());

  // Load initial state from disk or fallback to defaults
  let currentState = loadPersistedState();

  // Save initial state to disk if not exists
  savePersistedState(currentState);

  // WebSocket Server
  const wss = new WebSocketServer({ server });

  const broadcastState = (sender?: WebSocket) => {
    const payload = JSON.stringify({
      type: 'STATE_UPDATE',
      data: currentState,
      timestamp: new Date().toISOString(),
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');

    // Send initial state upon connection
    ws.send(
      JSON.stringify({
        type: 'INIT_STATE',
        data: currentState,
      })
    );

    ws.on('message', (message: string) => {
      try {
        const action = JSON.parse(message.toString());
        console.log('[WebSocket] Action received:', action.type);

        switch (action.type) {
          case 'UPDATE_FULL_STATE':
            if (action.data) {
              if (action.data.products) currentState.products = action.data.products;
              if (action.data.logs) currentState.logs = action.data.logs;
              if (action.data.notifications) currentState.notifications = action.data.notifications;
              if (action.data.incomingRecords) currentState.incomingRecords = action.data.incomingRecords;
              if (action.data.outgoingRecords) currentState.outgoingRecords = action.data.outgoingRecords;
              if (action.data.users) currentState.users = action.data.users;

              savePersistedState(currentState);
              broadcastState(ws);
            }
            break;

          case 'PING':
            ws.send(JSON.stringify({ type: 'PONG' }));
            break;

          default:
            console.log('[WebSocket] Unknown action type:', action.type);
        }
      } catch (err) {
        console.error('[WebSocket] Error parsing message:', err);
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
    });
  });

  // REST API Endpoints for optional REST polling/sync
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', connections: wss.clients.size });
  });

  app.get('/api/state', (req, res) => {
    res.json(currentState);
  });

  // Vite or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Realtime inventory server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
});

