import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { getCampaign, getCampaignStats, type Campaign, type CampaignStats } from '../api';
import { formatNumber } from '../i18n';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [campaignData, statsData] = await Promise.all([
          getCampaign(id),
          getCampaignStats(id),
        ]);
        setCampaign(campaignData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load campaign:', err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading || !campaign || !stats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <div className="empty-state-title">{t('common.loading', 'Loading...')}</div>
      </div>
    );
  }

  const qrUrl = `${window.location.origin}/app/play/${campaign.merchantId}`;

  return (
    <div className="app-page stack-lg">
      <header className="app-page-header">
        <div className="app-page-header-row">
          <button className="app-page-back" onClick={() => navigate('/campaigns')}>
          <ArrowLeft size={20} />
        </button>
          <div className="app-page-header-copy">
            <span className="app-page-kicker">
              {campaign.gameType === 'SCRATCH_CARD'
                ? t('campaigns.scratchCard', 'Scratch Card')
                : t('campaigns.spinWheel', 'Spin Wheel')}
            </span>
            <h1 className="app-page-title">{campaign.name}</h1>
          </div>
          <button className="btn btn-secondary app-pill-button" onClick={() => setShowQR(true)}>
            <QrCode size={20} />
            {t('campaigns.scanToPlay', 'Scan to Play')}
          </button>
        </div>
        {campaign.description && <p className="app-page-subtitle">{campaign.description}</p>}
      </header>

      <section className="app-surface-card app-surface-card-muted">
        <div className="app-surface-body">
        <div className="app-section-header">
          <div>
            <span className="section-kicker">{t('campaigns.viewStats', 'View Stats')}</span>
            <h2 className="app-section-title">{t('campaigns.viewStats', 'View Stats')}</h2>
          </div>
        </div>
        <div className="app-stat-grid">
          <div className="app-stat-card">
            <div className="app-stat-label">{t('campaigns.totalPlays', 'Total Plays')}</div>
            <div className="app-stat-value">{formatNumber(stats.totalPlays)}</div>
          </div>
          <div className="app-stat-card">
            <div className="app-stat-label">{t('campaigns.redeemed', 'Redeemed')}</div>
            <div className="app-stat-value">{formatNumber(stats.totalRedeemed)}</div>
          </div>
          <div className="app-stat-card">
            <div className="app-stat-label">{t('campaigns.pending', 'Pending')}</div>
            <div className="app-stat-value">{formatNumber(stats.totalPending)}</div>
          </div>
          <div className="app-stat-card">
            <div className="app-stat-label">{t('campaigns.redemptionRate', 'Redemption Rate')}</div>
            <div className="app-stat-value">{stats.redemptionRate.toFixed(1)}%</div>
          </div>
        </div>
        </div>
      </section>

      <section className="app-section">
        <div>
          <span className="section-kicker">{t('campaigns.prizeDistribution', 'Prize Distribution')}</span>
          <h2 className="app-section-title">{t('campaigns.prizeDistribution', 'Prize Distribution')}</h2>
        </div>
        <div className="app-card-grid">
          {stats.prizeDistribution.map((prizeData, index) => (
            <div key={index} className="app-soft-card">
              <div className="app-soft-card-body">
              <div className="app-surface-header">
                <h3 className="app-surface-title">{prizeData.prizeName}</h3>
                <span className={`badge badge-${prizeData.prizeType === 'PHYSICAL' ? 'primary' : 'secondary'}`}>
                  {prizeData.prizeType}
                </span>
              </div>
              <div className="app-meta-list">
                <div className="app-meta-row">
                  <span className="app-meta-label">{t('campaigns.timesWon', 'Times Won')}</span>
                  <span className="app-meta-value">{prizeData.timesWon}</span>
                </div>
                <div className="app-meta-row">
                  <span className="app-meta-label">{t('campaigns.probability', 'Weight')}</span>
                  <span className="app-meta-value">{prizeData.probability}</span>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QR Code Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="show-qr-page" onClick={(e) => e.stopPropagation()}>
            <div className="show-qr-header">
              <button className="show-qr-close" onClick={() => setShowQR(false)}>
                ×
              </button>
              <h1 className="show-qr-title">{t('campaigns.scanToPlay', 'Scan to Play')}</h1>
            </div>
            <div className="show-qr-content">
              <div className="show-qr-card">
                <div className="show-qr-merchant">
                  <div className="show-qr-merchant-name">{campaign.name}</div>
                  <div className="show-qr-merchant-subtitle">
                    {campaign.gameType === 'SCRATCH_CARD'
                      ? t('campaigns.scratchCard', 'Scratch Card')
                      : t('campaigns.spinWheel', 'Spin Wheel')}
                  </div>
                </div>
                <div className="show-qr-code">
                  <QRCodeSVG
                    value={qrUrl}
                    size={240}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <div className="show-qr-instruction">
                  {t('campaigns.qrInstruction', 'Customers scan this QR code to play')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
