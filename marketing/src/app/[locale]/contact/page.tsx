'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { whatsappUrl, CONTACT_EMAIL } from '@/lib/contact';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      if (!res.ok) throw new Error('Send failed');
      setSuccess(true);
      form.reset();
    } catch {
      setError(t('errorBody'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section contact-page">
      <div className="section-header">
        <h1>{t('pageTitle')}</h1>
        <p>{t('pageSubtitle')}</p>
      </div>

      <div className="contact-grid">
        {/* WhatsApp primary channel */}
        <a
          className="contact-card contact-card-wa"
          href={whatsappUrl(t('whatsappPrefilledMessage'))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="contact-card-badge">{t('whatsappLabel')}</span>
          <div className="contact-card-icon">
            <svg viewBox="0 0 32 32" width="40" height="40" fill="currentColor" aria-hidden="true">
              <path d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.27.594 4.4 1.638 6.25L3.2 28.8l6.71-1.625A12.748 12.748 0 0 0 16 28.8C23.07 28.8 28.8 23.07 28.8 16S23.07 3.2 16.001 3.2zm5.713 16.42c-.314-.158-1.86-.917-2.148-1.022-.288-.106-.498-.158-.708.158-.21.314-.812 1.022-.997 1.232-.184.21-.367.236-.682.079-.314-.158-1.328-.49-2.531-1.562-.935-.834-1.566-1.864-1.751-2.179-.184-.314-.02-.484.138-.641.142-.142.314-.367.472-.55.157-.184.21-.314.314-.524.105-.21.052-.394-.026-.55-.078-.158-.708-1.71-.97-2.34-.255-.614-.515-.531-.708-.541l-.604-.011c-.21 0-.55.078-.838.394-.288.314-1.1 1.075-1.1 2.62s1.127 3.04 1.284 3.25c.158.21 2.218 3.39 5.378 4.748.751.324 1.337.518 1.794.663.753.24 1.439.206 1.981.125.604-.09 1.86-.76 2.122-1.493.262-.733.262-1.36.184-1.493-.078-.131-.288-.21-.602-.367z"/>
            </svg>
          </div>
          <h2>{t('whatsappCta')}</h2>
          <p>{t('whatsappBody')}</p>
        </a>

        {/* Email form fallback */}
        <div className="contact-card contact-card-form">
          <h2>{t('emailFormTitle')}</h2>
          <p>{t('emailFormSubtitle')}</p>

          {success ? (
            <div className="contact-success">
              <h3>{t('successTitle')}</h3>
              <p>{t('successBody')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              {/* FormSubmit configuration: hidden inputs */}
              <input type="hidden" name="_subject" value="New Loyali contact" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="text" name="_honey" style={{ display: 'none' }} />

              <label className="contact-field">
                <span>{t('emailField')}</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder={t('emailPlaceholder')}
                />
              </label>

              <label className="contact-field">
                <span>{t('messageField')}</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder={t('messagePlaceholder')}
                />
              </label>

              {error && <p className="contact-error">{error}</p>}

              <button type="submit" className="btn-hero btn-hero-primary" disabled={submitting}>
                {submitting ? t('submittingButton') : t('submitButton')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
