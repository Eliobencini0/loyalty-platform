'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { CONTACT_EMAIL } from '@/lib/contact';

/**
 * Newsletter "Join the community" form. Posts to FormSubmit so each
 * signup arrives as an email at CONTACT_EMAIL — operator can filter
 * by subject "New newsletter signup" in Gmail to build a list view.
 */
export default function NewsletterSignup() {
  const t = useTranslations('footer');
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
      setError(t('joinError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <p className="newsletter-success" role="status">
        {t('joinSuccess')}
      </p>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input type="hidden" name="_subject" value="New newsletter signup" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <label className="newsletter-input-wrap">
        <span className="visually-hidden">{t('emailLabel')}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
        />
      </label>

      <button
        type="submit"
        className="newsletter-submit"
        disabled={submitting}
      >
        {submitting ? t('joinSubmitting') : t('joinButton')}
      </button>

      {error && <p className="newsletter-error" role="alert">{error}</p>}
    </form>
  );
}
