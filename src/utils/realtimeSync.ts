import { ScheduleMap, UserAccount, AttendanceLog } from '../types';

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'connecting';

interface RealtimeCallbacks {
  onSchedulesUpdate?: (schedules: ScheduleMap) => void;
  onUsersUpdate?: (users: Record<string, UserAccount>) => void;
  onFullSync?: (data: { schedules?: ScheduleMap; users?: Record<string, UserAccount>; attendanceLogs?: AttendanceLog[] }) => void;
  onStatusChange?: (status: SyncStatus, info?: string) => void;
}

let eventSource: EventSource | null = null;
let broadcastChannel: BroadcastChannel | null = null;
let reconnectTimer: any = null;
let currentStatus: SyncStatus = 'connecting';

// Multi-tab BroadcastChannel
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('therapy_hub_realtime_channel');
  }
} catch (e) {
  console.warn('[Realtime] BroadcastChannel unavailable:', e);
}

export function initRealtimeSync(callbacks: RealtimeCallbacks): () => void {
  // 1. BroadcastChannel listener for local cross-tab instant sync
  const handleBroadcastMessage = (event: MessageEvent) => {
    if (!event.data) return;
    const { type, data } = event.data;

    if (type === 'schedules_updated' && callbacks.onSchedulesUpdate) {
      callbacks.onSchedulesUpdate(data);
    } else if (type === 'users_updated' && callbacks.onUsersUpdate) {
      callbacks.onUsersUpdate(data);
    } else if (type === 'sync_updated' && callbacks.onFullSync) {
      callbacks.onFullSync(data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // 2. Server-Sent Events (SSE) for cross-device/online multi-client sync
  function connectSSE() {
    if (typeof window === 'undefined') return;

    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    callbacks.onStatusChange?.('connecting', 'Connecting to real-time server...');

    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        currentStatus = 'connected';
        callbacks.onStatusChange?.('connected', 'Live Online Sync Active (Changes sync in seconds)');
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      };

      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          const { type, data } = payload;

          if (type === 'connected') {
            currentStatus = 'connected';
            callbacks.onStatusChange?.('connected', 'Live Online Sync Active');
          } else if (type === 'schedules_updated' && callbacks.onSchedulesUpdate) {
            callbacks.onSchedulesUpdate(data);
            callbacks.onStatusChange?.('connected', 'Schedules synced across online clients');
          } else if (type === 'users_updated' && callbacks.onUsersUpdate) {
            callbacks.onUsersUpdate(data);
            callbacks.onStatusChange?.('connected', 'User profiles synced across online clients');
          } else if (type === 'sync_updated' && callbacks.onFullSync) {
            callbacks.onFullSync(data);
            callbacks.onStatusChange?.('connected', 'Clinic data synchronized');
          }
        } catch (err) {
          console.warn('[Realtime SSE] Non-JSON message:', e.data);
        }
      };

      eventSource.onerror = () => {
        currentStatus = 'offline';
        callbacks.onStatusChange?.('offline', 'Reconnecting to real-time sync...');
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Auto-reconnect after 3 seconds
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connectSSE();
          }, 3000);
        }
      };
    } catch (err) {
      console.warn('[Realtime] Failed to initialize EventSource:', err);
      callbacks.onStatusChange?.('offline', 'Local mode active');
    }
  }

  connectSSE();

  return () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };
}

// Push schedule updates to server and broadcast
export async function pushSchedulesToServer(schedules: ScheduleMap) {
  // Broadcast locally first for 0ms latency
  try {
    broadcastChannel?.postMessage({ type: 'schedules_updated', data: schedules });
  } catch (e) {}

  // Send to server to notify all other devices
  try {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedules }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Realtime] Server schedule sync fallback to local:', err);
    return false;
  }
}

// Push user profile updates to server and broadcast
export async function pushUsersToServer(users: Record<string, UserAccount>) {
  try {
    broadcastChannel?.postMessage({ type: 'users_updated', data: users });
  } catch (e) {}

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Realtime] Server user sync fallback to local:', err);
    return false;
  }
}

// Fetch initial data from server if available
export async function fetchServerClinicData(): Promise<{
  schedules: ScheduleMap | null;
  users: Record<string, UserAccount> | null;
  attendanceLogs: AttendanceLog[] | null;
} | null> {
  try {
    const res = await fetch('/api/clinic-data');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
