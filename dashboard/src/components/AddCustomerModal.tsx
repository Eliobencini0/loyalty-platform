import { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { manualAddCustomer, type ManualAddResult } from '../api';

interface AddCustomerModalProps {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddCustomerModal({ onClose, onAdded }: AddCustomerModalProps) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ManualAddResult | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (!firstName.trim() || !email.trim()) {
      setError(t('customers.add.requiredFields'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await manualAddCustomer({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
      });
      setResult(res);
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('customers.add.error'));
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.loyaltyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="apm-header">
          <div className="apm-header-text">
            <h2 className="apm-name">{result ? t('customers.add.successTitle') : t('customers.add.title')}</h2>
            {!result && <p className="apm-meta">{t('customers.add.subtitle')}</p>}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label={t('scanQR.cancel')}>
            <X size={22} />
          </button>
        </div>

        {!result ? (
          <>
            <div className="add-customer-form">
              <label className="add-customer-field">
                <span>{t('customers.add.firstName')} *</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
              </label>
              <label className="add-customer-field">
                <span>{t('customers.add.lastName')}</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </label>
              <label className="add-customer-field">
                <span>{t('customers.add.email')} *</span>
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </label>
              <p className="add-customer-disclosure">
                {t('customers.add.disclosure')}
              </p>
            </div>

            {error && <div className="apm-alert apm-alert-error">{error}</div>}

            <button className="apm-hero-btn" onClick={submit} disabled={loading}>
              {loading ? t('common.loading') : t('customers.add.submit')}
            </button>
            <button className="apm-btn-ghost" onClick={onClose} disabled={loading}>
              {t('scanQR.cancel')}
            </button>
          </>
        ) : (
          <>
            <div className="add-customer-success">
              <div className="apm-success-check">
                <Check size={40} strokeWidth={3} />
              </div>
              <p className="add-customer-success-line">
                {result.alreadyEnrolled
                  ? t('customers.add.alreadyEnrolled', { email: result.customer.email })
                  : result.emailSent
                  ? t('customers.add.emailSent', { email: result.customer.email })
                  : t('customers.add.emailNotSent')}
              </p>
            </div>

            <div className="add-customer-link-row">
              <code className="add-customer-link">{result.loyaltyUrl}</code>
              <button className="apm-secondary-btn add-customer-copy" onClick={copyLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t('customers.add.copied') : t('customers.add.copyLink')}
              </button>
            </div>

            <button className="apm-hero-btn" onClick={onClose}>
              {t('customers.add.done')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
