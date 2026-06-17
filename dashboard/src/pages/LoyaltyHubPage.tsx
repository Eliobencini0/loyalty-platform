import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { PullToRefresh } from '../components/ui/PullToRefresh';
import HomeTodayStrip from '../components/HomeTodayStrip';
import { useAuth } from '../AuthContext';

export default function LoyaltyHubPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { program } = useAuth();
  const hasProgram = Boolean(program);

  return (
    <PullToRefresh onRefresh={async () => {}}>
      <div className="hub-page">
        <PWAInstallPrompt mode="home" />

        <HomeTodayStrip />

        <div className="hub-secondary">
          {hasProgram && (
            <button
              type="button"
              className="hub-secondary-tile"
              onClick={() => navigate('/show-qr')}
            >
              <span className="hub-secondary-icon material-symbols-outlined">qr_code_2</span>
              <span className="hub-secondary-label">{t('hub.showQR')}</span>
            </button>
          )}
          <button
            type="button"
            className="hub-secondary-tile"
            onClick={() => navigate('/scan-qr?mode=redeem')}
          >
            <span className="hub-secondary-icon material-symbols-outlined">confirmation_number</span>
            <span className="hub-secondary-label">{t('hub.redeem')}</span>
          </button>
          <button
            type="button"
            className="hub-secondary-tile"
            onClick={() => navigate('/review-qr')}
          >
            <span className="hub-secondary-icon material-symbols-outlined">star</span>
            <span className="hub-secondary-label">{t('hub.reviews')}</span>
          </button>
        </div>

        <button
          type="button"
          className="hub-hero"
          onClick={() => navigate('/scan-qr')}
          aria-label={t('hub.addPoints')}
        >
          <span className="hub-hero-content">
            <span className="hub-hero-label">{t('hub.addPoints')}</span>
            <span className="hub-hero-sublabel">{t('hub.addPointsHint')}</span>
          </span>
          <span className="hub-hero-fab" aria-hidden="true">
            <span className="material-symbols-outlined">add</span>
          </span>
        </button>
      </div>
    </PullToRefresh>
  );
}
