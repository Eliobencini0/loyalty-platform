import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getInsightsNotifications, type InsightsNotification } from '../api';

// Toggle to true for visual preview with seeded sample data
const MOCK = false;

const MOCK_ITEMS: InsightsNotification[] = [
  {
    id: 'mock-reward-ready',
    type: 'reward_ready',
    title: '5 clienti pronti a riscattare',
    description: 'Hanno raggiunto la soglia premio — avvisali quando entrano.',
    actionPath: '/customers',
    severity: 'high',
  },
  {
    id: 'mock-near-reward',
    type: 'near_reward',
    title: '8 clienti vicini al premio',
    description: 'A 1-2 timbri dal traguardo. Una visita in più e ci sono.',
    actionPath: '/insights',
    severity: 'medium',
  },
  {
    id: 'mock-inactive',
    type: 'inactive',
    title: '12 clienti inattivi',
    description: 'Nessuna visita da oltre 30 giorni.',
    actionPath: '/customers',
    severity: 'high',
  },
];

const STORAGE_KEY = 'notifications_dismissed_v1';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type DismissMap = Record<string, number>;

function loadDismissed(): DismissMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DismissMap;
    const now = Date.now();
    return Object.fromEntries(Object.entries(parsed).filter(([, expiresAt]) => expiresAt > now));
  } catch {
    return {};
  }
}

function saveDismissed(map: DismissMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* localStorage may be disabled */
  }
}

function iconFor(type: InsightsNotification['type']): string {
  if (type === 'reward_ready') return 'redeem';
  if (type === 'near_reward') return 'flag';
  return 'schedule';
}

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsSheet({ open, onClose }: NotificationsSheetProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [items, setItems] = useState<InsightsNotification[]>([]);
  const [dismissed, setDismissed] = useState<DismissMap>(() => loadDismissed());

  useEffect(() => {
    if (!open) return;
    if (MOCK) {
      setItems(MOCK_ITEMS);
      return;
    }
    let cancelled = false;
    getInsightsNotifications()
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const visible = useMemo(
    () => items.filter((it) => !(it.id in dismissed)),
    [items, dismissed],
  );

  if (!open) return null;

  const handleDismiss = (id: string) => {
    const next = { ...dismissed, [id]: Date.now() + COOLDOWN_MS };
    setDismissed(next);
    saveDismissed(next);
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="notifications-sheet-backdrop" onClick={onClose}>
      <div
        className="notifications-sheet"
        role="dialog"
        aria-label={t('notifications.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notifications-sheet-header">
          <h3>{t('notifications.title')}</h3>
          <button
            type="button"
            className="notifications-sheet-close"
            aria-label={t('common.close')}
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="notifications-sheet-body">
          {visible.length === 0 ? (
            <div className="notifications-empty">
              <span className="material-symbols-outlined">notifications_off</span>
              <p>{t('notifications.empty')}</p>
            </div>
          ) : (
            visible.map((item) => {
              const count = item.count ?? 0;
              const localizedTitle = t(`notifications.types.${item.type}.title`, { defaultValue: item.title });
              const localizedDescription = t(`notifications.types.${item.type}.description`, {
                count,
                defaultValue: item.description,
              });
              return (
              <article key={item.id} className={`notification-item notification-${item.severity}`}>
                <button
                  type="button"
                  className="notification-main"
                  onClick={() => handleNavigate(item.actionPath)}
                >
                  <span className="notification-icon material-symbols-outlined">{iconFor(item.type)}</span>
                  <span className="notification-text">
                    <span className="notification-title">{localizedTitle}</span>
                    <span className="notification-description">{localizedDescription}</span>
                  </span>
                  <span className="notification-chevron material-symbols-outlined">chevron_right</span>
                </button>
                <button
                  type="button"
                  className="notification-dismiss"
                  aria-label={t('hub.alertsStrip.dismiss')}
                  onClick={() => handleDismiss(item.id)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
