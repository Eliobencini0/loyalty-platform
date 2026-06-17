import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Share2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';

export default function ReviewQRPage() {
  const { t } = useTranslation();
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // In dev, Vite runs on 5173 but /app/* is served by the Express backend on 3000.
  const apiOrigin = ['5173', '5174', '5175'].includes(window.location.port)
    ? 'http://localhost:3000'
    : window.location.origin;
  const reviewUrl = `${apiOrigin}/app/review/${merchant?.id}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignored */
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('reviewQR.shareTitle', { name: merchant?.name, defaultValue: 'Review {{name}}' }),
          text: t('reviewQR.shareText', { defaultValue: 'Tell us about your experience!' }),
          url: reviewUrl,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="app-page stack-lg show-review-qr-page">
      <header className="app-page-header">
        <div className="app-page-header-row">
          <button className="app-page-back" onClick={() => navigate(-1)}>
            <X size={20} />
          </button>
          <div className="app-page-header-copy">
            <h1 className="app-page-title">{t('reviewQR.headerTitle', { defaultValue: 'Review QR' })}</h1>
          </div>
        </div>
      </header>

      <section className="app-surface-card app-surface-card-muted">
        <div className="app-surface-body show-review-qr-card">
          <div className="show-review-qr-code">
            <QRCodeSVG value={reviewUrl} size={240} level="H" includeMargin />
          </div>
        </div>
      </section>

      <p className="show-review-qr-instruction">
        {t('reviewQR.instruction', { defaultValue: 'Let customers scan this QR code to leave a review' })}
      </p>

      <div className="show-review-qr-actions">
        <button className="btn btn-secondary" onClick={handleCopy}>
          {copied ? <><Check size={16} /> {t('common.copied', { defaultValue: 'Copied' })}</> : <><Copy size={16} /> {t('common.copyLink', { defaultValue: 'Copy link' })}</>}
        </button>
        <button className="btn btn-primary" onClick={handleShare}>
          <Share2 size={16} /> {t('common.share', { defaultValue: 'Share' })}
        </button>
      </div>
    </div>
  );
}
