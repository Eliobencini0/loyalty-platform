import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, User, TrendingUp, TrendingDown, Calendar, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCustomerCard, getAvailableRewards, type CustomerCardDetail, type RewardTier } from '../api';

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [customer, setCustomer] = useState<CustomerCardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextReward, setNextReward] = useState<RewardTier | null>(null);
  const [pointsToNext, setPointsToNext] = useState<number | null>(null);

  const loadCustomer = useCallback(async () => {
    if (!customerId) return;

    setLoading(true);
    setError('');

    try {
      const [customerData, rewardsData] = await Promise.all([
        getCustomerCard(customerId),
        getAvailableRewards(customerId).catch(() => ({ availableRewards: [], allRewards: [], currentPoints: 0 })),
      ]);

      setCustomer(customerData);

      // Find next reward (first reward customer doesn't have yet)
      const unavailableRewards = rewardsData.allRewards.filter(
        (reward) => !rewardsData.availableRewards.some((ar) => ar.id === reward.id)
      );
      if (unavailableRewards.length > 0) {
        const next = unavailableRewards.sort((a, b) => a.threshold - b.threshold)[0];
        setNextReward(next);
        setPointsToNext(next.threshold - customerData.pointsBalance);
      }
    } catch (err) {
      console.error('Failed to load customer:', err);
      setError(t('customerDetail.notFound'));
    } finally {
      setLoading(false);
    }
  }, [customerId, t]);

  useEffect(() => {
    if (!customerId) return;
    void loadCustomer();
  }, [customerId, loadCustomer]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EARN':
      case 'BONUS':
        return <TrendingUp size={16} className="transaction-icon earn" />;
      case 'REDEEM':
      case 'EXPIRE':
        return <TrendingDown size={16} className="transaction-icon redeem" />;
      default:
        return <Calendar size={16} className="transaction-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="app-page">
        <div className="customer-detail-loading">{t('customerDetail.loading')}</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="app-page">
        <div className="customer-detail-error">
          <p>{error || t('customerDetail.notFound')}</p>
          <button className="btn-primary" onClick={() => navigate('/customers')}>
            {t('customerDetail.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page stack-lg">
      <header className="app-page-header">
        <div className="app-page-header-row">
          <button className="app-page-back" onClick={() => navigate('/customers')}>
            <ChevronLeft size={24} />
          </button>
          <div className="app-page-header-copy">
            <span className="app-page-kicker">{t('customerDetail.title')}</span>
            <h1 className="app-page-title">
              {customer.firstName} {customer.lastName}
            </h1>
          </div>
        </div>
      </header>

      <section className="app-surface-card app-surface-card-muted">
        <div className="app-surface-body customer-detail-profile">
          <div className="customer-detail-avatar">
            {customer.avatarUrl ? (
              <img src={customer.avatarUrl} alt={`${customer.firstName} ${customer.lastName}`} />
            ) : (
              <div className="customer-detail-avatar-placeholder">
                <User size={40} />
              </div>
            )}
          </div>
          <div className="customer-detail-contacts">
            {customer.email && (
              <div className="customer-detail-contact">
                <Mail size={14} />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="customer-detail-contact">
                <Phone size={14} />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {nextReward && pointsToNext !== null && pointsToNext <= 20 && (
        <div className="app-soft-card">
          <div className="app-soft-card-body customer-detail-alert">
            <Award size={20} />
            <div>
              <div className="customer-detail-alert-title">{t('customerDetail.nearReward')}</div>
              <div className="customer-detail-alert-desc">
                {t('customerDetail.pointsToNext', { points: pointsToNext })}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="app-surface-card">
        <div className="app-surface-body">
          <div className="app-section-header">
            <div>
              <span className="section-kicker">{t('customerDetail.title')}</span>
              <h2 className="app-section-title">{t('customerDetail.recentActivity')}</h2>
            </div>
          </div>
          <div className="app-stat-grid">
            <div className="app-stat-card">
              <div className="app-stat-label">{t('customerDetail.currentPoints')}</div>
              <div className="app-stat-value">{customer.pointsBalance}</div>
            </div>
            <div className="app-stat-card">
              <div className="app-stat-label">{t('customerDetail.totalEarned')}</div>
              <div className="app-stat-value">{customer.totalEarned}</div>
            </div>
            <div className="app-stat-card">
              <div className="app-stat-label">{t('customerDetail.totalRedeemed')}</div>
              <div className="app-stat-value">{customer.totalRedeemed}</div>
            </div>
            {nextReward && pointsToNext !== null ? (
              <div className="app-stat-card">
                <div className="app-stat-label">{t('customerDetail.nearReward')}</div>
                <div className="app-stat-value">{pointsToNext}</div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="app-section">
        <div>
          <span className="section-kicker">{t('customerDetail.recentActivity')}</span>
          <h3 className="app-section-title">{t('customerDetail.recentActivity')}</h3>
        </div>

        {customer.recentTransactions.length === 0 ? (
          <div className="customer-detail-no-activity">{t('customerDetail.noActivity')}</div>
        ) : (
          <div className="customer-detail-timeline">
            {customer.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="timeline-item">
                <div className="timeline-icon">{getTransactionIcon(transaction.type)}</div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-type">
                      {t(`customerDetail.transactionTypes.${transaction.type}`)}
                    </span>
                    <span className="timeline-date">{formatDateTime(transaction.createdAt)}</span>
                  </div>
                  {transaction.description && (
                    <div className="timeline-description">{transaction.description}</div>
                  )}
                  <div className="timeline-points">
                    <span className={transaction.points > 0 ? 'points-positive' : 'points-negative'}>
                      {transaction.points > 0 ? '+' : ''}
                      {transaction.points}
                    </span>
                    <span className="timeline-balance">Balance: {transaction.balanceAfter}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
