import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, Gift, Check, Lock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  addPointsToCustomer,
  getAvailableRewards,
  redeemReward,
  type CustomerCardDetail,
  type RewardTier,
} from '../api';
import RedeemConfirmModal from './RedeemConfirmModal';

interface CustomerProfileModalProps {
  customer: CustomerCardDetail;
  onClose: () => void;
  initialView?: 'add' | 'redeem';
}

const CHARTREUSE_PALETTE = ['#D9F99D', '#BEF264', '#84CC16'];

function fireConfetti(colors = CHARTREUSE_PALETTE) {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
}

export default function CustomerProfileModal({ customer, onClose, initialView = 'add' }: CustomerProfileModalProps) {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState<{ title: string; subtitle?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentBalance, setCurrentBalance] = useState(customer.pointsBalance);
  const [redemptionsCount, setRedemptionsCount] = useState(customer.redemptionsCount);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, []);

  const [amountInput, setAmountInput] = useState(''); // for points pattern (in EUR)
  const [stampInput, setStampInput] = useState(''); // for stamps pattern (custom N)
  const [showStampMore, setShowStampMore] = useState(false);

  const [showRedeem, setShowRedeem] = useState(initialView === 'redeem');
  const [availableRewards, setAvailableRewards] = useState<RewardTier[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardTier | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState('');

  const program = customer.program;
  const isStamps = program?.type === 'STAMPS';
  const pointsPerEuro = program?.pointsPerCurrency ?? 1;
  const tiers = program?.rewardTiers ?? [];
  const maxThreshold = isStamps
    ? program?.goalStamps || tiers[tiers.length - 1]?.threshold || 10
    : tiers[tiers.length - 1]?.threshold || 100;

  const loadRewards = useCallback(async () => {
    setLoadingRewards(true);
    try {
      const data = await getAvailableRewards(customer.customerId);
      setAvailableRewards(data.availableRewards);
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoadingRewards(false);
    }
  }, [customer.customerId]);

  useEffect(() => {
    void loadRewards();
  }, [currentBalance, loadRewards]);

  // Live conversion for points pattern
  const amountNum = parseFloat(amountInput.replace(',', '.')) || 0;
  const computedPoints = Math.floor(amountNum * pointsPerEuro);

  const stampNum = parseInt(stampInput, 10) || 0;

  const enrolledLabel = useMemo(() => {
    const d = new Date(customer.enrolledAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' });
  }, [customer.enrolledAt, i18n.language]);

  const submitPoints = async (points: number) => {
    if (points <= 0) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await addPointsToCustomer(customer.customerId, points);
      const newBalance = response.card.pointsBalance;
      setCurrentBalance(newBalance);
      setAmountInput('');
      setStampInput('');
      setShowStampMore(false);

      const isCompletion = isStamps && program?.goalStamps != null && newBalance >= program.goalStamps;
      const title = isStamps
        ? t('scanQR.customerProfile.stampAdded', { count: points })
        : t('scanQR.customerProfile.success');
      const subtitle = isCompletion ? t('scanQR.customerProfile.cardCompleted') : undefined;
      setSuccessOverlay({ title, subtitle });

      const closeAfter = isCompletion ? 2500 : 1500;
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = setTimeout(() => {
        overlayTimerRef.current = null;
        setSuccessOverlay(null);
        onClose();
      }, closeAfter);
    } catch {
      setErrorMessage(t('scanQR.customerProfile.error'));
      setLoading(false);
      return;
    }
    // keep loading true until close to disable buttons during overlay
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    setRedeemLoading(true);
    setRedeemError('');
    try {
      const response = await redeemReward(customer.customerId, selectedReward.id);
      setCurrentBalance(response.card.pointsBalance);
      setRedemptionsCount((c) => c + 1);
      setSelectedReward(null);
      fireConfetti(['#10B981', '#34D399', '#6EE7B7']);
      setSuccessOverlay({ title: t('scanQR.customerProfile.redeemSuccess') });
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = setTimeout(() => {
        overlayTimerRef.current = null;
        setSuccessOverlay(null);
        onClose();
      }, 1500);
    } catch {
      setRedeemError(t('scanQR.customerProfile.redeemError'));
      setSelectedReward(null);
    } finally {
      setRedeemLoading(false);
    }
  };

  // Progress bar markers (positions 0..1)
  const markers = isStamps
    ? Array.from({ length: program?.goalStamps || 0 }, (_, i) => ({
        threshold: i + 1,
        label: '',
        isReward: i + 1 === (program?.goalStamps || 0),
      }))
    : tiers.map((tier) => ({
        threshold: tier.threshold,
        label: tier.rewardName,
        isReward: true,
      }));

  const progress = Math.min(currentBalance / maxThreshold, 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-points-modal" onClick={(e) => e.stopPropagation()}>
        <div className="apm-header">
          <div className="apm-header-text">
            <h2 className="apm-name">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="apm-meta">
              {enrolledLabel
                ? t('scanQR.customerProfile.contextEnrolled', { date: enrolledLabel })
                : t('scanQR.customerProfile.contextNew')}
            </p>
            {redemptionsCount > 0 && (
              <p className="apm-meta apm-meta-rewards">
                {t('scanQR.customerProfile.rewardsRedeemed', { count: redemptionsCount })}
              </p>
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label={t('scanQR.customerProfile.close')}>
            <X size={22} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="apm-progress" aria-label={`${currentBalance}/${maxThreshold}`}>
          <div className="apm-progress-track">
            <div className="apm-progress-fill" style={{ width: `${progress * 100}%` }} />
            {markers.map((m, idx) => {
              const left = Math.min((m.threshold / maxThreshold) * 100, 100);
              const reached = currentBalance >= m.threshold;
              return (
                <div
                  key={idx}
                  className={`apm-progress-marker ${reached ? 'is-reached' : ''} ${m.isReward ? 'is-reward' : ''}`}
                  style={{ left: `${left}%` }}
                />
              );
            })}
          </div>
          <div className="apm-progress-labels">
            <span className="apm-progress-current">
              {isStamps
                ? t('scanQR.customerProfile.stampsCount', { current: currentBalance, goal: maxThreshold })
                : `${currentBalance} pt`}
            </span>
            {!isStamps && tiers.length > 0 && (
              <span className="apm-progress-tiers">
                {tiers.map((tier) => (
                  <span key={tier.id} className={currentBalance >= tier.threshold ? 'reached' : ''}>
                    {tier.threshold} · {tier.rewardName}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>

        {errorMessage && <div className="apm-alert apm-alert-error">{errorMessage}</div>}

        {successOverlay && (
          <div className="apm-success-overlay" role="status" aria-live="polite">
            <div className="apm-success-check">
              <Check size={48} strokeWidth={3} />
            </div>
            <div className="apm-success-title">{successOverlay.title}</div>
            {successOverlay.subtitle && (
              <div className="apm-success-subtitle">{successOverlay.subtitle}</div>
            )}
          </div>
        )}

        {/* Body */}
        {showRedeem ? (
          <div className="apm-redeem">
            <h3>{t('scanQR.customerProfile.availableRewards')}</h3>
            {loadingRewards ? (
              <div className="rewards-loading">{t('common.loading')}</div>
            ) : availableRewards.length === 0 ? (
              (() => {
                const nextTier = tiers.find((tt) => tt.threshold > currentBalance) ?? tiers[0];
                const toGo = nextTier ? Math.max(nextTier.threshold - currentBalance, 0) : 0;
                return (
                  <div className="apm-redeem-empty">
                    <div className="apm-redeem-empty-icon"><Lock size={28} strokeWidth={2} /></div>
                    <p className="apm-redeem-empty-title">{t('scanQR.customerProfile.notEligibleTitle')}</p>
                    {nextTier && (
                      <p className="apm-redeem-empty-desc">
                        {isStamps
                          ? t('scanQR.customerProfile.stampsToReward', { count: toGo, reward: nextTier.rewardName })
                          : t('scanQR.customerProfile.pointsToReward', { count: toGo, reward: nextTier.rewardName })}
                      </p>
                    )}
                    <button className="apm-hero-btn" onClick={onClose}>
                      {t('scanQR.customerProfile.close')}
                    </button>
                    <button className="apm-btn-ghost" onClick={() => setShowRedeem(false)}>
                      {isStamps ? t('scanQR.customerProfile.addStamp') : t('scanQR.customerProfile.addPoints')}
                    </button>
                  </div>
                );
              })()
            ) : (
              <div className="rewards-list">
                {availableRewards.map((reward) => (
                  <button
                    key={reward.id}
                    className="reward-item"
                    onClick={() => setSelectedReward(reward)}
                    disabled={redeemLoading}
                  >
                    <div className="reward-item-icon"><Gift size={20} /></div>
                    <div className="reward-item-info">
                      <div className="reward-item-name">{reward.rewardName}</div>
                      <div className="reward-item-tier">
                        {t('scanQR.customerProfile.pointsCost', { points: reward.threshold })}
                      </div>
                    </div>
                    <div className="reward-item-cta">
                      <span>{t('scanQR.customerProfile.redeemReward')}</span>
                      <ChevronRight size={18} />
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="apm-actions">
              <button className="apm-btn-ghost" onClick={() => setShowRedeem(false)}>
                {t('scanQR.customerProfile.cancel')}
              </button>
            </div>
          </div>
        ) : isStamps ? (
          <div className="apm-stamps">
            {!showStampMore ? (
              <>
                <button
                  className="apm-hero-btn"
                  onClick={() => submitPoints(1)}
                  disabled={loading}
                >
                  {t('scanQR.customerProfile.addStamp')}
                </button>
                <button
                  className="apm-secondary-btn"
                  onClick={() => setShowStampMore(true)}
                  disabled={loading}
                >
                  {t('scanQR.customerProfile.addMoreStamps')}
                </button>
              </>
            ) : (
              <>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  className="apm-input apm-input-stamp"
                  placeholder="2"
                  value={stampInput}
                  onChange={(e) => setStampInput(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
                <button
                  className="apm-hero-btn"
                  onClick={() => submitPoints(stampNum)}
                  disabled={loading || stampNum <= 0}
                >
                  {stampNum > 0
                    ? t('scanQR.customerProfile.addNStamps', { count: stampNum })
                    : t('scanQR.customerProfile.addStamp')}
                </button>
                <button
                  className="apm-btn-ghost"
                  onClick={() => { setShowStampMore(false); setStampInput(''); }}
                  disabled={loading}
                >
                  {t('scanQR.customerProfile.cancel')}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="apm-points">
            <label className="apm-input-label" htmlFor="apm-amount">
              {t('scanQR.customerProfile.amountSpent')}
            </label>
            <div className="apm-amount-row">
              <span className="apm-currency">€</span>
              <input
                id="apm-amount"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                className="apm-input apm-input-amount"
                placeholder="0"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="apm-conversion">
              {amountNum > 0
                ? t('scanQR.customerProfile.equalsPoints', { count: computedPoints })
                : ' '}
            </div>
            <button
              className="apm-hero-btn"
              onClick={() => submitPoints(computedPoints)}
              disabled={loading || computedPoints <= 0}
            >
              {computedPoints > 0
                ? t('scanQR.customerProfile.addNPoints', { count: computedPoints })
                : t('scanQR.customerProfile.addPoints')}
            </button>
          </div>
        )}

        {!showRedeem && availableRewards.length > 0 && (
          <button
            className="apm-redeem-banner"
            onClick={() => setShowRedeem(true)}
            disabled={loadingRewards}
          >
            <Gift size={18} />
            {t('scanQR.customerProfile.redeemReward')}
          </button>
        )}

        {selectedReward && (
          <RedeemConfirmModal
            reward={selectedReward}
            currentBalance={currentBalance}
            onConfirm={handleConfirmRedeem}
            onCancel={() => { setSelectedReward(null); setRedeemError(''); }}
            loading={redeemLoading}
            error={redeemError}
          />
        )}
      </div>
    </div>
  );
}
