'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

interface SocketProviderProps {
  children: ReactNode;
  userEmail?: string;
  isAdmin?: boolean;
}

export function SocketProvider({ children, userEmail, isAdmin }: SocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

    const s = io(`${url}/notifications`, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      console.log('✅ Socket connecté:', s.id);
      setConnected(true);

      // Rejoindre la room personnelle (email)
      if (userEmail) {
        s.emit('join-room', userEmail);
        console.log('🔔 Rejoint room:', userEmail);
      }

      // Rejoindre la room admins si admin
      if (isAdmin) {
        s.emit('join-room', 'admins');
        console.log('🔔 Rejoint room: admins');
      }
    });

    s.on('disconnect', () => {
      console.log('❌ Socket déconnecté');
      setConnected(false);
    });

    s.on('connect_error', (err) => {
      console.error('🔴 Erreur connexion socket:', err.message);
    });

    return () => {
      s.disconnect();
    };
  }, [userEmail, isAdmin]);

  // Si les infos utilisateur changent après connexion (ex: profil chargé en async)
  // on rejoints les rooms sans recréer le socket
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !s.connected) return;

    if (userEmail) {
      s.emit('join-room', userEmail);
      console.log('🔔 (re)Rejoint room:', userEmail);
    }
    if (isAdmin) {
      s.emit('join-room', 'admins');
      console.log('🔔 (re)Rejoint room: admins');
    }
  }, [userEmail, isAdmin]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}