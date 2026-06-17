import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gift, Star, Settings, HelpCircle, ChevronRight, Languages } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../i18n';
import { updateMerchantMe } from '../api';

const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
  es: '🇪🇸',
};

type MenuItem = {
  icon: typeof Gift;
  label: string;
  description: string;
  path: string;
  color: string;
};

export default function MenuPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { program } = useAuth();
  const [savingLocale, setSavingLocale] = useState<SupportedLocale | null>(null);
  const [languageExpanded, setLanguageExpanded] = useState(false);

  const currentLocale = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0] as SupportedLocale;

  const handleLocaleChange = async (locale: SupportedLocale) => {
    if (locale === currentLocale) return;

    // 1. Apply locally — UI updates immediately, i18next-browser-languagedetector
    //    persists it in localStorage under key "preferredLocale".
    await i18n.changeLanguage(locale);
    setSavingLocale(locale);

    // 2. Persist on the backend so the choice follows the merchant across
    //    devices. Best-effort: a network failure shouldn't undo the UI change.
    try {
      await updateMerchantMe({ preferredLocale: locale });
    } catch {
      // swallow — localStorage + i18n already applied
    } finally {
      setSavingLocale(null);
    }
  };

  const acquisitionItems: MenuItem[] = [
    {
      icon: Gift,
      label: t('menu.campaigns', 'Gamification Campaigns'),
      description: t('menu.campaignsDesc', 'Scratch cards, spin wheels & prizes'),
      path: '/campaigns',
      color: '#667eea',
    },
    {
      icon: Star,
      label: t('menu.reviews', 'Customer Reviews'),
      description: t('menu.reviewsDesc', 'QR code & review settings'),
      path: '/review-settings',
      color: '#667eea',
    },
  ];

  const accountItem: MenuItem = {
    icon: Settings,
    label: t('menu.account', 'Account Settings'),
    description: t('menu.accountDesc', 'Profile, plan & preferences'),
    path: '/settings',
    color: '#666',
  };

  const supportItem: MenuItem = {
    icon: HelpCircle,
    label: t('menu.help', 'Help & Documentation'),
    description: t('menu.helpDesc', 'Guides, FAQs & support'),
    path: '/help',
    color: '#666',
  };

  const renderMenuItem = (item: MenuItem, key: string | number) => (
    <div
      key={key}
      className="app-menu-item"
      onClick={() => navigate(item.path)}
    >
      <div className="app-menu-item-body">
        <div className={item.color === '#667eea' ? 'app-icon-chip app-icon-chip-primary' : 'app-icon-chip app-icon-chip-neutral'}>
          <item.icon size={24} color={item.color} />
        </div>
        <div className="app-menu-item-text">
          <div className="app-menu-item-title">{item.label}</div>
          <div className="app-menu-item-description">{item.description}</div>
        </div>
        <ChevronRight size={20} color="#999" />
      </div>
    </div>
  );

  return (
    <div className="app-page stack-lg">
      <PWAInstallPrompt mode="menu" />

      {/* Active Program Card — moved from LoyaltyHubPage so it's reachable from
          any tab via the always-visible Menu in the bottom nav. */}
      {program ? (
        <div className="program-card-minimal aviator-shadow">
          {!program.hasTransactions && (
            <button className="btn-edit" onClick={() => navigate('/setup')}>
              {t('hub.edit')}
            </button>
          )}
          <div className="program-card-info">
            <h2 className="program-card-name">{t('hub.activeProgram')}</h2>
            <p className="program-card-type">
              {program.type === 'STAMPS' ? t('hub.stampCard') : t('hub.pointsProgram')}
            </p>
            <div className="program-card-stats">
              {program.type === 'STAMPS' && (
                <>
                  <div className="program-stat">
                    <p className="program-stat-label">{t('hub.welcomeBonus')}</p>
                    <p className="program-stat-value">{program.welcomeStamps || 0} {t('hub.stampsUnit')}</p>
                  </div>
                  <div className="program-stat">
                    <p className="program-stat-label">{t('hub.goal')}</p>
                    <p className="program-stat-value">{program.goalStamps} {t('hub.stampsUnit')}</p>
                  </div>
                </>
              )}
              {program.type === 'POINTS' && (
                <>
                  <div className="program-stat">
                    <p className="program-stat-label">{t('hub.pointsPerEuro')}</p>
                    <p className="program-stat-value">{program.pointsPerCurrency}</p>
                  </div>
                  <div className="program-stat">
                    <p className="program-stat-label">{t('hub.welcomeBonus')}</p>
                    <p className="program-stat-value">{program.welcomePoints || 0} {t('hub.pointsUnit')}</p>
                  </div>
                </>
              )}
            </div>

            {program.rewardTiers.length > 0 && (
              <ul className="program-card-tiers">
                {program.rewardTiers.map((tier, idx) => (
                  <li key={tier.id} className="program-card-tier">
                    <span className="program-card-tier-index">{idx + 1}</span>
                    <span className="program-card-tier-name">{tier.rewardName || tier.name}</span>
                    <span className="program-card-tier-threshold">
                      {tier.threshold} {program.type === 'STAMPS' ? t('hub.stampsUnit') : t('hub.pointsUnit')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="program-card-minimal program-card-empty aviator-shadow">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">{t('hub.noProgramTitle')}</div>
          <div className="empty-state-desc">{t('hub.noProgramDesc')}</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/setup')}>
            {t('hub.setupProgram')}
          </button>
        </div>
      )}

      {/* Acquisition */}
      <section className="app-menu-section">
        <div>
          <span className="section-kicker">{t('menu.acquisition', 'Acquisition')}</span>
        </div>
        <div className="app-menu-list">
          {acquisitionItems.map((item, idx) => renderMenuItem(item, idx))}
        </div>
      </section>

      {/* Settings — includes the inline-expandable Language item */}
      <section className="app-menu-section">
        <div>
          <span className="section-kicker">{t('menu.settings', 'Settings')}</span>
        </div>
        <div className="app-menu-list">
          {/* Language: tap to expand the 3-pill picker inline */}
          <div className="app-menu-item">
            <div
              className="app-menu-item-body"
              onClick={() => setLanguageExpanded((v) => !v)}
              role="button"
              aria-expanded={languageExpanded}
              aria-controls="language-picker"
            >
              <div className="app-icon-chip app-icon-chip-neutral">
                <Languages size={24} color="#666" />
              </div>
              <div className="app-menu-item-text">
                <div className="app-menu-item-title">{t('locale.label')}</div>
                <div className="app-menu-item-description">
                  {LOCALE_FLAGS[currentLocale]} {t(`locale.${currentLocale}`)}
                </div>
              </div>
              <ChevronRight
                size={20}
                color="#999"
                style={{
                  transform: languageExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease',
                }}
              />
            </div>
            {languageExpanded && (
              <div
                id="language-picker"
                className="lang-picker"
                role="radiogroup"
                aria-label={t('locale.label')}
              >
                {SUPPORTED_LOCALES.map((locale) => {
                  const isActive = locale === currentLocale;
                  const isSaving = savingLocale === locale;
                  return (
                    <button
                      key={locale}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      disabled={isSaving}
                      onClick={() => handleLocaleChange(locale)}
                      className={`lang-picker-option${isActive ? ' active' : ''}`}
                    >
                      <span className="lang-picker-flag" aria-hidden="true">{LOCALE_FLAGS[locale]}</span>
                      <span className="lang-picker-name">{t(`locale.${locale}`)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {renderMenuItem(accountItem, 'account')}
        </div>
      </section>

      {/* Support */}
      <section className="app-menu-section">
        <div>
          <span className="section-kicker">{t('menu.support', 'Support')}</span>
        </div>
        <div className="app-menu-list">
          {renderMenuItem(supportItem, 'help')}
        </div>
      </section>
    </div>
  );
}
