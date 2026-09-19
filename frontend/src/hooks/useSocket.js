import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

/**
 * Custom hook for Socket.IO realtime event connection.
 * Joins room 'event:eventId', listens to 'live:update', and cleans up on unmount.
 */
export function useSocket(eventId) {
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    // Create single socket instance
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => {
      setConnected(true);
      // Emit 'join' with { eventId }
      socket.emit('join', { eventId });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen to 'live:update' (NOT 'live')
    socket.on('live:update', (payload) => {
      if (payload) {
        setLatestUpdate(payload);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('live:update');
      socket.disconnect();
    };
  }, [eventId]);

  return {
    latestUpdate,
    connected,
  };
}
