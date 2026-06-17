import { useTranslation } from 'react-i18next';
import type { InsightsSentiment } from '../api';

interface SentimentChartProps {
  sentiment: InsightsSentiment;
}

const STAR_BUCKETS: Array<'5' | '4' | '3' | '2' | '1'> = ['5', '4', '3', '2', '1'];

export default function SentimentChart({ sentiment }: SentimentChartProps) {
  const { t } = useTranslation();

  if (sentiment.total === 0) {
    return <div className="sentiment-empty">{t('insights.sentimentEmpty')}</div>;
  }

  const maxCount = Math.max(...STAR_BUCKETS.map((key) => sentiment.distribution[key]), 1);

  return (
    <section className="sentiment-card">
      <div className="sentiment-header">
        <p className="sentiment-title">{t('insights.sentimentTitle')}</p>
        <div className="sentiment-average-wrap">
          <span className="sentiment-average">{sentiment.average === null ? t('insights.noData') : sentiment.average.toFixed(1)}</span>
          <span className="sentiment-average-label">/5</span>
        </div>
      </div>

      <div className="sentiment-bars">
        {STAR_BUCKETS.map((bucket) => {
          const count = sentiment.distribution[bucket];
          const width = `${Math.round((count / maxCount) * 100)}%`;
          return (
            <div key={bucket} className="sentiment-row">
              <span className="sentiment-row-label">{bucket}★</span>
              <div className="sentiment-row-track">
                <div className="sentiment-row-fill" style={{ width }} />
              </div>
              <span className="sentiment-row-count">{count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
