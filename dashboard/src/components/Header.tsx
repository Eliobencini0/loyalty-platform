import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { getInsightsNotifications } from '../api';
import { OfflineIndicator } from './OfflineIndicator';
import NotificationsSheet from './NotificationsSheet';

export default function Header() {
  const location = useLocation();
  const { t } = useTranslation();
  const { merchant } = useAuth();
  const [alertCount, setAlertCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!merchant) return;
    let cancelled = false;
    getInsightsNotifications()
      .then((items) => {
        if (!cancelled) setAlertCount(items.length);
      })
      .catch(() => {
        if (!cancelled) setAlertCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [merchant, location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname;
    const merchantName = merchant?.name || 'Dashboard';

    // Home page (Today) - show greeting
    if (path === '/') return t('hub.greeting', { name: merchantName });

    // Other pages - show bottom-bar tab label
    if (path === '/insights') return t('nav.insights');
    if (path === '/customers') return t('nav.customers');
    if (path === '/menu') return t('nav.menu');
    if (path === '/campaigns') return t('campaigns.title');
    if (path === '/settings') return t('settings.title');
    if (path === '/setup') return t('setup.title', 'Setup');

    return merchantName;
  };

  return (
    <>
      <OfflineIndicator />
      <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-profile">
          <div className="app-header-avatar app-header-avatar--initials" aria-hidden="true">
            {merchant?.name ? merchant.name.trim().charAt(0).toUpperCase() : '·'}
          </div>
          <h1 className="app-header-title app-header-title-home">
            {getPageTitle()}
          </h1>
        </div>
        <button
          className="app-header-bell"
          type="button"
          aria-label="Notifications"
          onClick={() => setNotificationsOpen(true)}
        >
          <span className="material-symbols-outlined">notifications</span>
          {alertCount > 0 && (
            <span className="app-header-bell-dot" aria-label={`${alertCount} alerts`} />
          )}
        </button>
      </div>
    </header>
    <NotificationsSheet open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
