'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/providers/SocketProvider';

export type NotificationEvent =
  | 'doc:created'
  | 'doc:updated'
  | 'doc:deleted'
  | 'user:created'
  | 'user:updated'
  | 'user:deleted'
  | 'api:created'
  | 'api:updated'
  | 'api:deleted'
  | 'activity:logged'
  | 'email:sent';

export interface NotificationPayload {
  event: NotificationEvent;
  message: string;
  data?: Record<string, any>;
  triggeredBy?: string;
  timestamp: string;
}

type NotificationHandler = (payload: NotificationPayload) => void;

const ALL_EVENTS: NotificationEvent[] = [
  'doc:created',
  'doc:updated',
  'doc:deleted',
  'user:created',
  'user:updated',
  'user:deleted',
  'api:created',
  'api:updated',
  'api:deleted',
  'activity:logged',
  'email:sent',
];

/**
 * S'abonne aux événements WebSocket de notifications.
 *
 * @param handler  Appelé à chaque notification reçue
 * @param events   Filtrer sur des événements spécifiques (défaut = tous)
 *
 * @example
 * useNotifications((n) => console.log(n.message));
 * useNotifications((n) => refetch(), ['doc:created', 'doc:deleted']);
 */
export function useNotifications(
  handler: NotificationHandler,
  events: NotificationEvent[] = ALL_EVENTS,
) {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const stableHandler = useCallback((payload: NotificationPayload) => {
    handlerRef.current(payload);
  }, []);

  useEffect(() => {
    if (!socket) return;

    events.forEach((event) => socket.on(event, stableHandler));

    return () => {
      events.forEach((event) => socket.off(event, stableHandler));
    };
  }, [socket, stableHandler, events.join(',')]);
}