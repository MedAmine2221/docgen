'use client';

import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { SocketProvider } from '@/providers/SocketProvider';
import { NotificationToast } from '@/components/NotificationsToast';

/**
 * Composant intermédiaire nécessaire pour accéder à Redux
 * depuis le layout (qui est un Server Component).
 *
 * Ce composant est un Client Component, donc il peut utiliser
 * useSelector. Il lit le profil et passe l'email + le rôle
 * au SocketProvider afin qu'il rejoigne les bonnes rooms WebSocket.
 */
export function AppWithSocket({ children }: { children: ReactNode }) {
  const profil = useSelector((state: RootState) => state.profil.profil);

  const userEmail = profil?.email as string | undefined;

  // Adapter selon le nom exact du rôle dans ton projet
  const roleName = (profil?.role?.name_eng ?? '').toLowerCase();
  const isAdmin = roleName.includes('admin') || roleName.includes('administrateur');

  return (
    <SocketProvider userEmail={userEmail} isAdmin={isAdmin}>
      {children}
      <NotificationToast />
    </SocketProvider>
  );
}