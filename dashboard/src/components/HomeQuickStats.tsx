import { useTranslation } from 'react-i18next';
import type { InsightsKpis } from '../api';
import { formatNumber } from '../i18n';

interface HomeQuickStatsProps {
  todayKpis: InsightsKpis;
  weekKpis: InsightsKpis;
  locale: string;
  onOpenInsights: () => void;
}

export default function HomeQuickStats({ todayKpis, weekKpis, locale, onOpenInsights }: HomeQuickStatsProps) {
  const { t } = useTranslation();

  return (
    <section className="home-insights-card">
      <div className="insights-card-container">
        {/* Header */}
        <div className="insights-card-header">
          <h4 className="insights-card-title">
            <span className="material-symbols-outlined">analytics</span>
            {t('insights.title')}
          </h4>
        </div>

        {/* Stats Rows */}
        <div className="insights-card-body">
          {/* Members Row */}
          <div className="insights-stat-row">
            <span className="insights-stat-icon insights-stat-icon-secondary material-symbols-outlined">
              groups
            </span>
            <div>
              <p className="insights-stat-label">{t('insights.kpis.activeMembers')}</p>
              <p className="insights-stat-value">{formatNumber(weekKpis.activeMembers, locale)}</p>
            </div>
          </div>

          {/* New Members (Highlighted) */}
          <div className="insights-stat-row insights-stat-row-primary">
            <span className="insights-stat-icon insights-stat-icon-white material-symbols-outlined">
              person_add
            </span>
            <div>
              <p className="insights-stat-label insights-stat-label-light">{t('hub.quickStats.newMembersToday')}</p>
              <p className="insights-stat-value insights-stat-value-white">{formatNumber(todayKpis.newMembers, locale)}</p>
            </div>
          </div>

          {/* Rating Row + Link */}
          <div className="insights-stat-row insights-stat-row-bottom">
            <div className="insights-stat-row-inner">
              <span className="insights-stat-icon insights-stat-icon-tertiary material-symbols-outlined">
                star
              </span>
              <div>
                <p className="insights-stat-label">{t('insights.kpis.avgRating')}</p>
                <p className="insights-stat-value">
                  {weekKpis.avgRating === null ? t('insights.noData') : weekKpis.avgRating.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="insights-stat-link-wrapper">
              <button onClick={onOpenInsights} className="insights-stat-link">
                {t('hub.quickStats.openInsights')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
