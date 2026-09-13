import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

const RENDER_BACKEND_URL = 'https://mechconnect-iwjv.onrender.com';

const getSocketUrl = (): string => {
  const envUrl =
    (import.meta as any).env?.VITE_SOCKET_URL ||
    (import.meta as any).env?.VITE_BACKEND_URL ||
    (import.meta as any).env?.VITE_API_URL;

  if (envUrl && typeof envUrl === 'string') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed !== '' && !trimmed.includes('vercel.app')) {
      return trimmed.replace(/\/api$/, '');
    }
  }

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000';
  }

  return RENDER_BACKEND_URL;
};

// Module-level singleton socket instance to prevent React StrictMode reconnect loops
let sharedSocket: Socket | null = null;

const getSharedSocket = (): Socket => {
  if (!sharedSocket) {
    const url = getSocketUrl();
    sharedSocket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true
    });
  }
  return sharedSocket;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const joinedUserKeyRef = useRef<string>('');

  useEffect(() => {
    const activeSocket = getSharedSocket();
    setSocket(activeSocket);
    setIsConnected(activeSocket.connected);

    const onConnect = () => {
      console.log('⚡ Connected to MechConnect Socket.IO:', activeSocket.id);
      setIsConnected(true);
      joinedUserKeyRef.current = ''; // Reset join key on fresh connect
    };

    const onDisconnect = (reason: string) => {
      console.log('❌ Disconnected from Socket.IO:', reason);
      setIsConnected(false);
      joinedUserKeyRef.current = '';
    };

    activeSocket.on('connect', onConnect);
    activeSocket.on('disconnect', onDisconnect);

    if (activeSocket.connected) {
      setIsConnected(true);
    }

    return () => {
      activeSocket.off('connect', onConnect);
      activeSocket.off('disconnect', onDisconnect);
    };
  }, []);

  // Join user room once when user or connection state changes
  useEffect(() => {
    const activeSocket = sharedSocket;
    if (!activeSocket || !isConnected || !user) return;

    const userKey = `${user.id}_${user.role}_${user.customerId || ''}_${user.mechanicId || ''}`;
    if (joinedUserKeyRef.current === userKey) return; // Prevent duplicate join emits

    joinedUserKeyRef.current = userKey;
    activeSocket.emit('join:user', {
      userId: user.id,
      role: user.role,
      customerId: user.customerId,
      mechanicId: user.mechanicId
    });
  }, [user?.id, user?.role, user?.customerId, user?.mechanicId, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
