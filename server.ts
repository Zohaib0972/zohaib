import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Set up server-side data persistence folder
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'clinic_data.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

interface ClinicStore {
  schedules: any;
  users: any;
  attendanceLogs: any[];
  lastUpdated: string;
}

// In-memory store cached from disk
let memoryStore: ClinicStore = {
  schedules: null,
  users: null,
  attendanceLogs: [],
  lastUpdated: new Date().toISOString(),
};

// Try loading existing server database
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryStore = { ...memoryStore, ...parsed };
    console.log('[Server] Loaded persisted clinic data from disk.');
  } catch (e) {
    console.warn('[Server] Could not parse existing clinic_data.json, starting fresh.', e);
  }
}

function persistStore() {
  try {
    memoryStore.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to write clinic_data.json to disk:', err);
  }
}

// Real-Time Server-Sent Events (SSE) Client Pool
const sseClients = new Set<Response>();

function broadcastSSE(type: string, data: any) {
  const payload = JSON.stringify({ type, timestamp: new Date().toISOString(), data });
  const message = `data: ${payload}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Periodic keep-alive ping for SSE through proxies
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(`: ping\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}, 15000);

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    connectedClients: sseClients.size,
    lastUpdated: memoryStore.lastUpdated,
  });
});

// SSE Stream endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial connection state
  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      message: 'Therapy Hub Real-Time Online Stream Connected',
      lastUpdated: memoryStore.lastUpdated,
    })}\n\n`
  );

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Get clinic data
app.get('/api/clinic-data', (req: Request, res: Response) => {
  res.json({
    schedules: memoryStore.schedules,
    users: memoryStore.users,
    attendanceLogs: memoryStore.attendanceLogs,
    lastUpdated: memoryStore.lastUpdated,
  });
});

// Update Schedules (Triggered by Admin/Staff)
app.post('/api/schedules', (req: Request, res: Response) => {
  const { schedules } = req.body;
  if (!schedules || typeof schedules !== 'object') {
    return res.status(400).json({ error: 'Invalid schedules payload' });
  }

  memoryStore.schedules = schedules;
  persistStore();

  // Broadcast to all connected clients in milliseconds
  broadcastSSE('schedules_updated', schedules);

  res.json({ success: true, lastUpdated: memoryStore.lastUpdated });
});

// Update Users / Profiles
app.post('/api/users', (req: Request, res: Response) => {
  const { users } = req.body;
  if (!users || typeof users !== 'object') {
    return res.status(400).json({ error: 'Invalid users payload' });
  }

  memoryStore.users = users;
  persistStore();

  // Broadcast to all connected clients
  broadcastSSE('users_updated', users);

  res.json({ success: true, lastUpdated: memoryStore.lastUpdated });
});

// Full Sync endpoint (Schedules + Users)
app.post('/api/sync', (req: Request, res: Response) => {
  const { schedules, users, attendanceLogs } = req.body;

  let changed = false;
  if (schedules && typeof schedules === 'object') {
    memoryStore.schedules = schedules;
    changed = true;
  }
  if (users && typeof users === 'object') {
    memoryStore.users = users;
    changed = true;
  }
  if (Array.isArray(attendanceLogs)) {
    memoryStore.attendanceLogs = attendanceLogs;
    changed = true;
  }

  if (changed) {
    persistStore();
    broadcastSSE('sync_updated', {
      schedules: memoryStore.schedules,
      users: memoryStore.users,
      attendanceLogs: memoryStore.attendanceLogs,
    });
  }

  res.json({
    success: true,
    lastUpdated: memoryStore.lastUpdated,
  });
});

// ==========================================
// VITE & STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Therapy Hub] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
