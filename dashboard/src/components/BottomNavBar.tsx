import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SyncQueueBadge } from './SyncQueueBadge';

export default function BottomNavBar() {
  const { t } = useTranslation();

  const tabs = [
    { to: '/', icon: 'calendar_today', label: t('nav.today'), end: true },
    { to: '/insights', icon: 'leaderboard', label: t('nav.insights'), filled: false },
    { to: '/customers', icon: 'group', label: t('nav.customers'), filled: false },
    { to: '/menu', icon: 'menu', label: t('nav.menu'), filled: false, badge: true },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, icon, label, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav-tab${isActive ? ' active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <div className="bottom-nav-icon-container">
                <span className={`material-symbols-outlined${isActive ? ' filled' : ''}`}>
                  {icon}
                </span>
                {badge && <SyncQueueBadge />}
              </div>
              <span className="bottom-nav-label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
