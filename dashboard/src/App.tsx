import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './AuthContext';
import { OnlineProvider } from './contexts/OnlineContext';
import { SyncProvider } from './contexts/SyncContext';
import { useKeyboardAwareFocus } from './hooks/useKeyboardAwareFocus';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LoyaltyHubPage from './pages/LoyaltyHubPage';
import SetupWizardPage from './pages/SetupWizardPage';
import InsightsPage from './pages/InsightsPage';
import ShowQRPage from './pages/ShowQRPage';
import ReviewSettingsPage from './pages/ReviewSettingsPage';
import ReviewQRPage from './pages/ReviewQRPage';
import ScanQRPage from './pages/ScanQRPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CampaignsPage from './pages/CampaignsPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import EditCampaignPage from './pages/EditCampaignPage';
import MenuPage from './pages/MenuPage';
import SettingsPage from './pages/SettingsPage';

function MobileLayout() {
  const location = useLocation();
  const { program } = useAuth();
  const isSetupRoute = location.pathname === '/setup' || (location.pathname === '/' && !program);

  return (
    <div className="app-shell">
      <Header />
      <main className={`app-main${isSetupRoute ? ' app-main-no-nav' : ''}`}>
        <Outlet />
      </main>
      {!isSetupRoute && <BottomNavBar />}
    </div>
  );
}

function FullPageLayout() {
  return (
    <div className="app-shell">
      <main className="app-main app-main-full">
        <Outlet />
      </main>
    </div>
  );
}

function HomePage() {
  const { program } = useAuth();
  return program ? <LoyaltyHubPage /> : <SetupWizardPage />;
}


function RequireAuth() {
  const { merchant, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return <div className="loading-screen">{t('common.loading')}</div>;
  if (!merchant) return <Navigate to="/login" replace />;

  return <Outlet />;
}

function AppRoutes() {
  const { merchant, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return <div className="loading-screen">{t('common.loading')}</div>;

  return (
    <Routes>
      <Route path="/login" element={merchant ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={merchant ? <Navigate to="/" replace /> : <SignupPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupWizardPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/menu" element={<MenuPage />} />
        </Route>
        <Route element={<FullPageLayout />}>
          <Route path="/show-qr" element={<ShowQRPage />} />
          <Route path="/review-settings" element={<ReviewSettingsPage />} />
          <Route path="/review-qr" element={<ReviewQRPage />} />
          <Route path="/scan-qr" element={<ScanQRPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="/campaigns/new" element={<CreateCampaignPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/campaigns/:id/edit" element={<EditCampaignPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

function AppShell() {
  useKeyboardAwareFocus();
  return <AppRoutes />;
}

export default function App() {
  return (
    <BrowserRouter basename="/dashboard">
      <OnlineProvider>
        <SyncProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </SyncProvider>
      </OnlineProvider>
    </BrowserRouter>
  );
}
