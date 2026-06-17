import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('signup.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-icon">
          <Star size={28} fill="#2563EB" color="#2563EB" />
        </div>
        <h1 className="auth-title">{t('signup.title')}</h1>
        <p className="auth-subtitle">{t('signup.subtitle')}</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('signup.shopName')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('signup.shopNamePlaceholder')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('signup.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('signup.emailPlaceholder')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('signup.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? t('signup.creating') : t('signup.createAccount')}
          </button>
        </form>

        <p className="auth-link">
          {t('signup.hasAccount')} <Link to="/login">{t('signup.logIn')}</Link>
        </p>
      </div>
    </div>
  );
}
