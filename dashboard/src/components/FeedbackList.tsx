import { useMemo, useState } from 'react';
import { MessageCircleWarning, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../i18n';
import type { FeedbackItem } from '../api';

interface FeedbackListProps {
  items: FeedbackItem[];
}

function sortByDateDesc(items: FeedbackItem[]): FeedbackItem[] {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function FeedbackList({ items }: FeedbackListProps) {
  const { t, i18n } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const sortedItems = useMemo(() => sortByDateDesc(items), [items]);
  const visibleItems = showAll ? sortedItems : sortedItems.slice(0, 3);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (sortedItems.length === 0) {
    return <div className="feedback-empty">{t('insights.feedbackEmpty')}</div>;
  }

  return (
    <section className="feedback-list">
      {visibleItems.map((item) => {
        const isNegative = item.rating < 3;
        const isExpanded = !!expandedItems[item.id];
        const canExpand = item.text.length > 120;

        const hasDetailedRatings = item.foodRating || item.serviceRating || item.atmosphereRating;

        return (
          <article key={item.id} className={`feedback-item${isNegative ? ' negative' : ''}`}>
            <div className="feedback-top-row">
              <div>
                <p className="feedback-customer">{item.customerName}</p>
                <p className="feedback-date">{formatDate(item.createdAt, i18n.language)}</p>
              </div>
              <div className="feedback-rating-wrap">
                {item.isNew && <span className="feedback-new-badge">{t('insights.newBadge')}</span>}
                {item.source === 'GOOGLE_MAPS' && <span className="feedback-source-badge">📍 Google Maps</span>}
                <div className={`feedback-rating${isNegative ? ' negative' : ''}`}>
                  {isNegative && <MessageCircleWarning size={14} />}
                  <Star size={14} fill="currentColor" />
                  <span>{item.rating.toFixed(1)}</span>
                </div>
                {item.source === 'GOOGLE_MAPS' && (
                  <span style={{ fontSize: '11px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>
                    Google Maps
                  </span>
                )}
              </div>
            </div>

            {hasDetailedRatings && (
              <div className="feedback-detailed-ratings">
                {item.foodRating && (
                  <span className="feedback-detailed-rating">
                    🍽️ {t('insights.foodLabel', 'Food')}: <Star size={12} fill="#ffd700" style={{ display: 'inline-block', verticalAlign: 'text-bottom', color: '#ffd700' }} /> {item.foodRating.toFixed(1)}
                  </span>
                )}
                {item.serviceRating && (
                  <span className="feedback-detailed-rating">
                    🤝 {t('insights.serviceLabel', 'Service')}: <Star size={12} fill="#ffd700" style={{ display: 'inline-block', verticalAlign: 'text-bottom', color: '#ffd700' }} /> {item.serviceRating.toFixed(1)}
                  </span>
                )}
                {item.atmosphereRating && (
                  <span className="feedback-detailed-rating">
                    🎨 {t('insights.atmosphereLabel', 'Atmosphere')}: <Star size={12} fill="#ffd700" style={{ display: 'inline-block', verticalAlign: 'text-bottom', color: '#ffd700' }} /> {item.atmosphereRating.toFixed(1)}
                  </span>
                )}
              </div>
            )}

            <p className={`feedback-text${isExpanded ? ' expanded' : ''}`}>{item.text}</p>

            {(item.foodRating || item.serviceRating || item.atmosphereRating) && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#666' }}>
                {item.foodRating && <span>&#127869; {item.foodRating}/5</span>}
                {item.serviceRating && <span>&#129309; {item.serviceRating}/5</span>}
                {item.atmosphereRating && <span>&#127912; {item.atmosphereRating}/5</span>}
              </div>
            )}

            {canExpand && (
              <button type="button" className="feedback-expand" onClick={() => toggleExpanded(item.id)}>
                {isExpanded ? t('insights.showLess') : t('insights.showMore')}
              </button>
            )}
          </article>
        );
      })}

      {sortedItems.length > 3 && !showAll && (
        <button type="button" className="btn feedback-view-all" onClick={() => setShowAll(true)}>
          {t('insights.viewAll')}
        </button>
      )}
    </section>
  );
}
