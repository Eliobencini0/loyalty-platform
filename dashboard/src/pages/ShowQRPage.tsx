import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Share2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { listCampaigns } from '../api';

export default function ShowQRPage() {
  const { t } = useTranslation();
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [hasActiveCampaign, setHasActiveCampaign] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCampaigns()
      .then((campaigns) => {
        if (cancelled) return;
        setHasActiveCampaign(campaigns.some((c) => c.active));
      })
      .catch(() => !cancelled && setHasActiveCampaign(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // In development, Vite runs on different port than backend
  const apiOrigin = window.location.port === '5174' || window.location.port === '5173' || window.location.port === '5175'
    ? 'http://localhost:3000'
    : window.location.origin;
  const route = hasActiveCampaign ? 'play' : 'join';
  const signupUrl = `${apiOrigin}/app/${route}/${merchant?.id}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(signupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hasActiveCampaign
            ? t('showQR.shareTitle', { name: merchant?.name })
            : t('showQR.shareTitleJoin', { name: merchant?.name, defaultValue: "Join {{name}}'s loyalty program" }),
          text: hasActiveCampaign
            ? t('showQR.shareText', { name: merchant?.name })
            : t('showQR.shareTextJoin', { name: merchant?.name, defaultValue: 'Get your digital loyalty card from {{name}}.' }),
          url: signupUrl,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  }

  return (
    <div className="app-page stack-lg">
      <header className="app-page-header">
        <div className="app-page-header-row">
          <button className="app-page-back" onClick={() => navigate('/')}>
            <X size={24} />
          </button>
          <div className="app-page-header-copy">
            <h1 className="app-page-title">{t('showQR.headerTitle', { defaultValue: 'Show QR' })}</h1>
          </div>
        </div>
      </header>

      <section className="app-surface-card app-surface-card-muted">
        <div className="app-surface-body show-qr-body">
          <div className="show-qr-merchant">
            <div className="show-qr-merchant-name">{merchant?.name}</div>
            <div className="show-qr-merchant-subtitle">
              {hasActiveCampaign
                ? t('showQR.subtitle', 'Scan to play & win prizes!')
                : t('showQR.subtitleJoin', { defaultValue: 'Scan to join our loyalty program' })}
            </div>
          </div>

          <div className="show-qr-code">
            <QRCodeSVG
              value={signupUrl}
              size={240}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <div className="show-qr-instruction">
            {hasActiveCampaign
              ? t('showQR.instruction', 'Let customers scan this QR code to play the game and join your loyalty program')
              : t('showQR.instructionJoin', { defaultValue: 'Let customers scan this QR code to join your loyalty program and save their card to Apple/Google Wallet' })}
          </div>
        </div>
      </section>

        <div className="show-qr-actions">
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={20} /> : <Copy size={20} />}
            <span>{copied ? t('showQR.copied') : t('showQR.copyLink')}</span>
          </button>
          <button className="btn btn-primary" onClick={handleShare}>
            <Share2 size={20} />
            <span>{t('showQR.share')}</span>
          </button>
        </div>
    </div>
  );
}
