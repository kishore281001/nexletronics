'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'cart';
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: Toast['type'], title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, type, title, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const remove = (id: string) => setToasts(t => t.filter(x => x.id !== id));

  const icons = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    info: <Info size={16} />,
    cart: <Zap size={16} />,
  };

  const colors = {
    success: { border: 'rgba(0,255,136,0.25)', icon: 'var(--success)', bg: 'rgba(0,255,136,0.06)' },
    error: { border: 'rgba(255,68,68,0.25)', icon: 'var(--error)', bg: 'rgba(255,68,68,0.06)' },
    info: { border: 'rgba(0,212,255,0.25)', icon: 'var(--accent-cyan)', bg: 'rgba(0,212,255,0.06)' },
    cart: { border: 'rgba(123,47,255,0.25)', icon: '#A855F7', bg: 'rgba(123,47,255,0.06)' },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map(toast => {
          const c = colors[toast.type];
          return (
            <div key={toast.id} className="toast" style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
              background: `color-mix(in srgb, var(--bg-surface) 90%, transparent)`,
              backdropFilter: 'blur(20px)', borderRadius: 12,
              border: `1px solid ${c.border}`, minWidth: 280, maxWidth: 360,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              pointerEvents: 'all',
              backgroundColor: 'var(--bg-surface)',
            }}>
              <div style={{ color: c.icon, marginTop: 1, flexShrink: 0 }}>{icons[toast.type]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{toast.title}</div>
                {toast.message && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{toast.message}</div>}
              </div>
              <button onClick={() => remove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0, padding: 0 }}>
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
