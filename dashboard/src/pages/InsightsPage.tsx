import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import KPICard from '../components/KPICard';
import TimeFilter from '../components/TimeFilter';
import FeedbackList from '../components/FeedbackList';
import SentimentChart from '../components/SentimentChart';
import InsightsAlerts from '../components/InsightsAlerts';
import {
  DEFAULT_RANGE,
  getInsightsFeedback,
  getInsightsKpis,
  getInsightsNotifications,
  getInsightsSentiment,
  type FeedbackItem,
  type InsightsKpis,
  type InsightsNotification,
  type InsightsRange,
  type InsightsSentiment,
} from '../api';
import { formatNumber } from '../i18n';

const DEFAULT_KPIS: InsightsKpis = {
  activeMembers: 0,
  newMembers: 0,
  returningCustomers: 0,
  reviewsCount: 0,
  nearRewardCustomers: 0,
  avgRating: null,
  retention: null,
  trends: {
    activeMembers: 0,
    newMembers: 0,
    nearRewardCustomers: null,
    avgRating: null,
    retention: null,
  },
};

const EMPTY_SENTIMENT: InsightsSentiment = {
  total: 0,
  average: null,
  distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
};

export default function InsightsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState<InsightsRange>(DEFAULT_RANGE);
  const [kpis, setKpis] = useState<InsightsKpis>(DEFAULT_KPIS);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [sentiment, setSentiment] = useState<InsightsSentiment>(EMPTY_SENTIMENT);
  const [notifications, setNotifications] = useState<InsightsNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadInsights = async () => {
      setLoading(true);
      try {
        const [nextKpis, nextFeedback, nextSentiment, nextNotifications] = await Promise.all([
          getInsightsKpis(range),
          getInsightsFeedback(range),
          getInsightsSentiment(range),
          getInsightsNotifications(),
        ]);
        if (cancelled) return;
        setKpis(nextKpis);
        setFeedback(nextFeedback);
        setSentiment(nextSentiment);
        setNotifications(nextNotifications);
        setAnimationKey((prev) => prev + 1);
      } catch {
        if (cancelled) return;
        setKpis(DEFAULT_KPIS);
        setFeedback([]);
        setSentiment(EMPTY_SENTIMENT);
        setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadInsights();

    return () => {
      cancelled = true;
    };
  }, [range]);

  const avgRatingValue = kpis.avgRating === null ? t('insights.noData') : kpis.avgRating.toFixed(1);
  const retentionValue = kpis.retention === null ? t('insights.noData') : `${kpis.retention.toFixed(1)}%`;

  return (
    <div className="app-page stack-lg page-insights">
      <header className="app-page-header">
        <p className="app-page-subtitle">{t('insights.subtitle')}</p>
      </header>

      <TimeFilter value={range} onChange={setRange} />

      {loading ? (
        <div className="insights-loading">{t('insights.loading')}</div>
      ) : (
        <div key={animationKey} className="insights-animated-content">
          <InsightsAlerts items={notifications} onNavigate={(path) => navigate(path)} />

          <section className="insights-kpi-grid">
            <KPICard
              title={t('insights.kpis.activeMembers')}
              value={formatNumber(kpis.activeMembers, i18n.language)}
              trend={kpis.trends.activeMembers}
            />
            <KPICard
              title={t('insights.kpis.newMembers')}
              value={formatNumber(kpis.newMembers, i18n.language)}
              trend={kpis.trends.newMembers}
            />
            <KPICard
              title={t('insights.kpis.avgRating')}
              value={avgRatingValue}
              trend={kpis.trends.avgRating}
            />
            <KPICard
              title={t('insights.kpis.retention')}
              value={retentionValue}
              trend={kpis.trends.retention}
            />
            <KPICard
              title={t('insights.kpis.nearReward')}
              value={formatNumber(kpis.nearRewardCustomers, i18n.language)}
              trend={kpis.trends.nearRewardCustomers}
            />
          </section>

          <SentimentChart sentiment={sentiment} />

          <section className="insights-feedback-section">
            <div className="insights-feedback-header">
              <h2>{t('insights.feedbackTitle')}</h2>
              <span className="insights-feedback-count">{feedback.length}</span>
            </div>
            <FeedbackList items={feedback} />
          </section>
        </div>
      )}
    </div>
  );
}
