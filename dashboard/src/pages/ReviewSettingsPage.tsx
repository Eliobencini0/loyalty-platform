import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, Star, Lock, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { updateMerchantMe } from '../api';

export default function ReviewSettingsPage() {
  const { t } = useTranslation();
  const { merchant, refreshProgram } = useAuth();
  const navigate = useNavigate();
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const settings = useMemo(() => {
    try {
      return JSON.parse(merchant?.settings || '{}') as { googleMapsUrl?: string };
    } catch {
      return {};
    }
  }, [merchant?.settings]);

  const configuredUrl = settings.googleMapsUrl?.trim() || '';
  const isConfigured = Boolean(configuredUrl);

  useEffect(() => {
    setGoogleMapsUrl(configuredUrl);
  }, [configuredUrl]);

  function isValidUrl(url: string): boolean {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async function handleSave() {
    setSaveError('');
    if (!isValidUrl(googleMapsUrl)) {
      setSaveError(t('settings.invalidUrl', 'Please enter a valid URL'));
      return;
    }
    setSaving(true);
    try {
      const next = { ...settings, googleMapsUrl: googleMapsUrl.trim() || null };
      await updateMerchantMe({ settings: JSON.stringify(next) });
      await refreshProgram();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('settings.saveFailed', 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-page stack-lg">
      <header className="app-page-header">
        <div className="app-page-header-row">
          <button className="app-page-back" onClick={() => navigate(-1)}>
            <X size={20} />
          </button>
          <div className="app-page-header-copy">
            <h1 className="app-page-title">{t('reviewSettings.headerTitle', { defaultValue: 'Review settings' })}</h1>
          </div>
        </div>
      </header>

      {/* Card 1 — How it works (always visible, educational) */}
      <section className="app-surface-card review-flow-card">
        <div className="app-surface-body stack-md">
          <span className="app-page-kicker">{t('reviewSettings.howItWorks', 'How it works')}</span>
          <ul className="review-flow-steps">
            <li>
              <span className="review-flow-icon review-flow-icon-success" aria-hidden="true">
                <Star size={16} />
              </span>
              <div>
                <strong>{t('reviewSettings.fiveStars', '5★ ratings')}</strong>
                <p>{t('reviewSettings.fiveStarsDesc', 'Forwarded to your Google Business page to grow your local SEO.')}</p>
              </div>
            </li>
            <li>
              <span className="review-flow-icon review-flow-icon-private" aria-hidden="true">
                <Lock size={16} />
              </span>
              <div>
                <strong>{t('reviewSettings.lowStars', '1–4★ ratings')}</strong>
                <p>{t('reviewSettings.lowStarsDesc', 'Kept private as feedback for you — no public negative reviews.')}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Card 2 — Connect Google */}
      <section className="app-surface-card">
        <div className="app-surface-body stack-md">
          <div className={`app-status-pill app-status-pill-${isConfigured ? 'ok' : 'warn'}`}>
            <span className="app-status-pill-dot" aria-hidden="true" />
            {isConfigured
              ? t('reviewSettings.statusActive', 'Forwarding active')
              : t('reviewSettings.statusInactive', 'Forwarding inactive — connect Google to activate')}
          </div>

          {isConfigured && !editing ? (
            <div className="review-config-status">
              <div className="review-config-status-text">
                <span className="review-config-label">{t('reviewSettings.configuredLabel', 'Reviews go to')}</span>
                <a href={configuredUrl} target="_blank" rel="noopener noreferrer" className="review-config-link">
                  {configuredUrl}
                </a>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                {t('common.edit', 'Edit')}
              </button>
            </div>
          ) : (
            <>
              <p className="review-lede">
                {t('reviewSettings.lede', 'Paste the link to your business on Google Maps to activate forwarding.')}
              </p>

              <div className="form-group">
                <label>{t('reviewSettings.googleMapsUrl', 'Google Maps URL')}</label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => { setGoogleMapsUrl(e.target.value); setSaveError(''); }}
                  placeholder="https://maps.app.goo.gl/..."
                />
                <p className="settings-hint">
                  {t('reviewSettings.googleMapsHint', 'Find your business on Google Maps, click Share, and paste the link here.')}
                </p>
              </div>

              {saveError && <div className="settings-error">{saveError}</div>}

              <div className="setup-buttons">
                {isConfigured && (
                  <button className="btn" onClick={() => { setGoogleMapsUrl(configuredUrl); setEditing(false); setSaveError(''); }}>
                    {t('common.cancel', 'Cancel')}
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving || !isValidUrl(googleMapsUrl)}
                >
                  {saving ? t('common.saving', 'Saving…')
                    : saved ? <><Check size={16} /> {t('common.saved', 'Saved')}</>
                    : <><Save size={16} /> {t('reviewSettings.saveActivate', 'Save & activate')}</>}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
