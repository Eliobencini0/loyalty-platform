import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CreditCard, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-page stack-lg">
      <header className="app-page-header">
        <div className="app-page-header-row">
          <button className="app-page-back" onClick={() => navigate('/menu')}>
            <ArrowLeft size={20} />
          </button>
          <div className="app-page-header-copy">
            <h1 className="app-page-title">{t('menu.account', 'Account Settings')}</h1>
          </div>
        </div>
      </header>

      {/* Card 1 — what's coming */}
      <section className="app-surface-card">
        <div className="app-surface-body stack-md">
          <span className="app-page-kicker">{t('settings.comingSoon', 'Coming soon')}</span>
          <ul className="review-flow-steps">
            <li>
              <span className="review-flow-icon review-flow-icon-private" aria-hidden="true">
                <User size={16} />
              </span>
              <div>
                <strong>{t('settings.profileSection', 'Business profile')}</strong>
                <p>{t('settings.profileSectionDesc', 'Edit your business name, address, contact details and opening hours.')}</p>
              </div>
            </li>
            <li>
              <span className="review-flow-icon review-flow-icon-private" aria-hidden="true">
                <CreditCard size={16} />
              </span>
              <div>
                <strong>{t('settings.planSection', 'Plan & billing')}</strong>
                <p>{t('settings.planSectionDesc', 'Manage your subscription, payment method and invoices.')}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Card 2 — session */}
      <section className="app-surface-card">
        <div className="app-surface-body stack-md">
          <span className="app-page-kicker">{t('settings.sessionTitle', 'Session')}</span>
          <button onClick={handleLogout} className="app-danger-button">
            <LogOut size={20} />
            {t('menu.logout', 'Logout')}
          </button>
        </div>
      </section>
    </div>
  );
}
