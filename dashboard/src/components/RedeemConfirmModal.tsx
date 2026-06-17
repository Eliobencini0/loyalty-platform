import { Gift, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RewardTier } from '../api';

interface RedeemConfirmModalProps {
  reward: RewardTier;
  currentBalance: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  error?: string;
}

export default function RedeemConfirmModal({
  reward,
  currentBalance,
  onConfirm,
  onCancel,
  loading,
  error,
}: RedeemConfirmModalProps) {
  const { t } = useTranslation();
  const newBalance = currentBalance - reward.threshold;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content redeem-modal" onClick={(e) => e.stopPropagation()}>
        <div className="apm-header">
          <div className="apm-header-text">
            <h2 className="apm-name">{t('scanQR.redeemConfirm.title')}</h2>
          </div>
          <button className="modal-close-btn" onClick={onCancel} aria-label={t('scanQR.redeemConfirm.cancel')}>
            <X size={22} />
          </button>
        </div>

        <div className="redeem-hero">
          <div className="redeem-hero-icon">
            <Gift size={28} strokeWidth={2} />
          </div>
          <div className="redeem-hero-text">
            <div className="redeem-hero-label">{t('scanQR.redeemConfirm.reward')}</div>
            <div className="redeem-hero-name">{reward.rewardName}</div>
          </div>
        </div>

        <div className="redeem-rows">
          <div className="redeem-row">
            <span className="redeem-row-label">{t('scanQR.redeemConfirm.currentBalance')}</span>
            <span className="redeem-row-value">{currentBalance}</span>
          </div>
          <div className="redeem-row">
            <span className="redeem-row-label">{t('scanQR.redeemConfirm.pointsToDeduct')}</span>
            <span className="redeem-row-value redeem-row-deduct">−{reward.threshold}</span>
          </div>
          <div className="redeem-row redeem-row-total">
            <span className="redeem-row-label">{t('scanQR.redeemConfirm.newBalance')}</span>
            <span className="redeem-row-value">{newBalance}</span>
          </div>
        </div>

        {error && <div className="apm-alert apm-alert-error">{error}</div>}

        <button className="apm-hero-btn" onClick={onConfirm} disabled={loading}>
          {loading ? t('scanQR.redeemConfirm.processing') : t('scanQR.redeemConfirm.confirmButton')}
        </button>
        <button className="apm-btn-ghost" onClick={onCancel} disabled={loading}>
          {t('scanQR.redeemConfirm.cancel')}
        </button>
      </div>
    </div>
  );
}
