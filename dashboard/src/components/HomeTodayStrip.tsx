import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getInsightsKpis } from '../api';

// Toggle to true for visual preview with seeded sample data
const MOCK = false;

interface TodayStats {
  newUsers: number;
  returning: number;
  reviews: number;
}

export default function HomeTodayStrip() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState<TodayStats | null>(null);

  useEffect(() => {
    if (MOCK) {
      setStats({ newUsers: 3, returning: 12, reviews: 2 });
      return;
    }
    let cancelled = false;
    getInsightsKpis({ kind: 'preset', preset: '24h' })
      .then((kpis) => {
        if (cancelled) return;
        setStats({
          newUsers: kpis.newMembers,
          returning: kpis.returningCustomers,
          reviews: kpis.reviewsCount,
        });
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) return null;

  const total = stats.newUsers + stats.returning + stats.reviews;
  const isLive = total > 0;

  return (
    <button
      type="button"
      className="hub-today-card"
      onClick={() => navigate('/insights')}
    >
      <div className="hub-today-card-header">
        <span className="hub-today-card-title">
          <span className="material-symbols-outlined">calendar_today</span>
          {t('hub.todayStrip.heading')}
        </span>
        {isLive && <span className="hub-today-card-live">{t('hub.todayStrip.live')}</span>}
      </div>
      <div className="hub-today-card-stats">
        <div className="hub-today-card-stat">
          <span className="hub-today-card-stat-value">+{stats.newUsers}</span>
          <span className="hub-today-card-stat-label">{t('hub.todayStrip.newUsers')}</span>
        </div>
        <div className="hub-today-card-stat">
          <span className="hub-today-card-stat-value">{stats.returning}</span>
          <span className="hub-today-card-stat-label">{t('hub.todayStrip.returning')}</span>
        </div>
        <div className="hub-today-card-stat">
          <span className="hub-today-card-stat-value">{stats.reviews}</span>
          <span className="hub-today-card-stat-label">{t('hub.todayStrip.reviews')}</span>
        </div>
      </div>
    </button>
  );
}
