import { useMemo, useState } from 'react';
import { AlertTriangle, BellRing, CircleAlert, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { InsightsNotification } from '../api';

interface InsightsAlertsProps {
  items: InsightsNotification[];
  onNavigate: (path: string) => void;
}

function getIcon(type: InsightsNotification['type']) {
  if (type === 'reward_ready') return BellRing;
  if (type === 'near_reward') return CircleAlert;
  return AlertTriangle;
}

export default function InsightsAlerts({ items, onNavigate }: InsightsAlertsProps) {
  const { t } = useTranslation();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => !dismissedIds.includes(item.id));
    return showAll ? filtered : filtered.slice(0, 3);
  }, [items, dismissedIds, showAll]);

  const hasMore = items.filter((item) => !dismissedIds.includes(item.id)).length > 3;

  if (visibleItems.length === 0) return null;

  return (
    <section className="insights-alerts app-surface-card">
      <div className="app-surface-body">
      <div className="insights-alerts-header">
        <h2>{t('insights.alertsTitle')}</h2>
        {hasMore && !showAll && (
          <button type="button" className="insights-alerts-view-all" onClick={() => setShowAll(true)}>
            {t('insights.viewAll')}
          </button>
        )}
      </div>

      <div className="insights-alerts-list">
        {visibleItems.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <article key={item.id} className={`insights-alert-item ${item.severity}`}>
              <button type="button" className="insights-alert-main" onClick={() => onNavigate(item.actionPath)}>
                <Icon size={16} />
                <div>
                  <p className="insights-alert-title">{item.title}</p>
                  <p className="insights-alert-description">{item.description}</p>
                </div>
              </button>
              <button
                type="button"
                className="insights-alert-dismiss"
                aria-label={t('insights.dismissAlert')}
                onClick={() => setDismissedIds((prev) => [...prev, item.id])}
              >
                <X size={14} />
              </button>
            </article>
          );
        })}
      </div>
      </div>
    </section>
  );
}
