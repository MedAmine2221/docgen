'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNotifications, NotificationPayload } from '@/hooks/useNotif';
import { useTranslation } from 'react-i18next';

interface StoredNotification extends NotificationPayload {
  id: string;
  read: boolean;
}

const EVENT_META: Record<string, { icon: string; color: string; bg: string }> = {
  'doc:created':    { icon: '📄', color: '#10b981', bg: '#d1fae5' },
  'doc:updated':    { icon: '✏️', color: '#3b82f6', bg: '#dbeafe' },
  'doc:deleted':    { icon: '🗑️', color: '#ef4444', bg: '#fee2e2' },
  'user:created':   { icon: '👤', color: '#8b5cf6', bg: '#ede9fe' },
  'user:updated':   { icon: '👤', color: '#3b82f6', bg: '#dbeafe' },
  'user:deleted':   { icon: '👤', color: '#ef4444', bg: '#fee2e2' },
  'api:created':    { icon: '🔌', color: '#10b981', bg: '#d1fae5' },
  'api:updated':    { icon: '🔌', color: '#3b82f6', bg: '#dbeafe' },
  'api:deleted':    { icon: '🔌', color: '#ef4444', bg: '#fee2e2' },
  'activity:logged':{ icon: '📊', color: '#f59e0b', bg: '#fef3c7' },
  'email:sent':     { icon: '✉️', color: '#8b5cf6', bg: '#ede9fe' },
};

function timeAgo(iso: string, t: (key: string) => string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}${t('notifications.time.seconds')}`;
  if (diff < 3600) return `${Math.floor(diff / 60)}${t('notifications.time.minutes')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${t('notifications.time.hours')}`;
  return `${Math.floor(diff / 86400)}${t('notifications.time.days')}`;
}

export function NotificationBell() {
  const { t } = useTranslation('common');
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleNotification = useCallback((payload: NotificationPayload) => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
    setNotifications((prev) => [
      { ...payload, id: `${Date.now()}-${Math.random()}`, read: false },
      ...prev,
    ].slice(0, 50));
  }, []);

  useNotifications(handleNotification);

  // Fermer en cliquant dehors
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unread = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const toggle = () => {
    setOpen((v) => !v);
    if (!open) markAllRead();
  };

  return (
    <div ref={panelRef} style={{ position: 'relative', display: 'inline-block' }}>
      <style>{`
        @keyframes bellShake {
          0%,100% { transform: rotate(0deg); }
          15% { transform: rotate(18deg); }
          30% { transform: rotate(-16deg); }
          45% { transform: rotate(12deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
        }
        @keyframes badgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .notif-item { animation: fadeIn 0.25s ease both; }
        .notif-item:hover { background: #f8fafc !important; }
        .bell-btn:hover { background: #f1f5f9 !important; }
        .clear-btn:hover { color: #ef4444 !important; }
        .notif-panel { animation: slideDown 0.2s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      {/* Bouton cloche */}
      <button
        className="bell-btn"
        onClick={toggle}
        aria-label={unread > 0 
          ? t('notifications.aria_label_with_count', { count: unread })
          : t('notifications.aria_label')}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
      >
        {/* Icône cloche SVG */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={open ? '#c5262e' : '#64748b'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: animating ? 'bellShake 0.6s ease' : 'none',
            transition: 'stroke 0.2s',
            transformOrigin: 'top center',
          }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Badge */}
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            minWidth: '17px',
            height: '17px',
            borderRadius: '99px',
            background: '#c5262e',
            color: '#fff',
            fontSize: '0.6rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid #fff',
            animation: 'badgePop 0.3s cubic-bezier(.16,1,.3,1)',
            lineHeight: 1,
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Panneau */}
      {open && (
        <div
          className="notif-panel"
          role="dialog"
          aria-label={t('notifications.title')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '360px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 40px -8px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                {t('notifications.title')}
              </span>
              {unread > 0 && (
                <span style={{
                  background: '#c5262e',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: '99px',
                }}>
                  {unread} {unread > 1 ? t('notifications.unread_plural') : t('notifications.unread_singular')}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                className="clear-btn"
                onClick={clearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500,
                  transition: 'color 0.15s',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                {t('notifications.clear_all')}
              </button>
            )}
          </div>

          {/* Liste */}
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: '380px',
            overflowY: 'auto',
          }}>
            {notifications.length === 0 ? (
              <li style={{
                padding: '3rem 1rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                  {t('notifications.empty_title')}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  {t('notifications.empty_description')}
                </p>
              </li>
            ) : (
              notifications.map((n, i) => {
                const meta = EVENT_META[n.event] ?? { icon: '🔔', color: '#64748b', bg: '#f1f5f9' };
                return (
                  <li
                    key={n.id}
                    className="notif-item"
                    style={{
                      padding: '12px 16px',
                      borderBottom: i < notifications.length - 1 ? '1px solid #f8fafc' : 'none',
                      background: n.read ? '#fff' : '#fef9f9',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      cursor: 'default',
                      animationDelay: `${i * 0.03}s`,
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Icône */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: meta.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}>
                      {meta.icon}
                    </div>

                    {/* Contenu */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontWeight: n.read ? 400 : 600,
                        color: '#0f172a',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}>
                        {n.message}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px',
                      }}>
                        {n.triggeredBy && (
                          <>
                            <span style={{
                              fontSize: '0.7rem',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '140px',
                            }}>
                              {n.triggeredBy}
                            </span>
                            <span style={{ color: '#cbd5e1', fontSize: '0.65rem' }}>·</span>
                          </>
                        )}
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>
                          {timeAgo(n.timestamp, t)}
                        </span>
                      </div>
                    </div>

                    {/* Dot non lu */}
                    {!n.read && (
                      <div style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#c5262e',
                        flexShrink: 0,
                        marginTop: '6px',
                      }} />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}