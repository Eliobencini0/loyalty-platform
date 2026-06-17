import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getMerchantMe,
  getMyProgram,
  login as apiLogin,
  signup as apiSignup,
  type Merchant,
  type LoyaltyProgram,
} from './api';
import { SUPPORTED_LOCALES, type SupportedLocale } from './i18n';

interface AuthState {
  merchant: Merchant | null;
  program: LoyaltyProgram | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProgram: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('merchantApiKey'));
  const { i18n } = useTranslation();

  function applyMerchantLocale(m: Merchant) {
    if (m.preferredLocale && SUPPORTED_LOCALES.includes(m.preferredLocale as SupportedLocale)) {
      i18n.changeLanguage(m.preferredLocale);
      localStorage.setItem('preferredLocale', m.preferredLocale);
    }
  }

  const fetchProgram = useCallback(async () => {
    try {
      const p = await getMyProgram();
      setProgram(p);
    } catch {
      setProgram(null);
    }
  }, []);

  useEffect(() => {
    const key = localStorage.getItem('merchantApiKey');
    if (!key) return;
    let cancelled = false;
    getMerchantMe()
      .then(async (m) => {
        if (cancelled) return;
        setMerchant(m);
        applyMerchantLocale(m);
        try {
          const p = await getMyProgram();
          if (!cancelled) setProgram(p);
        } catch { /* no program yet */ }
      })
      .catch(() => localStorage.removeItem('merchantApiKey'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const { merchant: m, apiKey } = await apiLogin(email, password);
    localStorage.setItem('merchantApiKey', apiKey);
    setMerchant(m);
    applyMerchantLocale(m);
    try {
      const p = await getMyProgram();
      setProgram(p);
    } catch { /* no program */ }
  }

  async function signup(name: string, email: string, password: string) {
    const { merchant: m, apiKey } = await apiSignup(name, email, password);
    localStorage.setItem('merchantApiKey', apiKey);
    setMerchant(m);
    applyMerchantLocale(m);
    setProgram(null);
  }

  function logout() {
    localStorage.removeItem('merchantApiKey');
    setMerchant(null);
    setProgram(null);
  }

  return (
    <AuthContext.Provider value={{ merchant, program, loading, login, signup, logout, refreshProgram: fetchProgram }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
