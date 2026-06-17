import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}

function PrivacyContent() {
  const t = useTranslations('privacy');
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(40px, 8vw, 64px) clamp(16px, 5vw, 24px) clamp(64px, 12vw, 96px)' }}>
      <h1 style={{ fontSize: 'clamp(28px, 7vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.1 }}>
        {t('title')}
      </h1>
      <p style={{ color: '#6b6760', fontSize: 14, marginBottom: 40 }}>{t('updated')}</p>

      <Section title={t('intro.title')} body={t('intro.body')} />
      <Section title={t('controller.title')} body={t('controller.body')} />
      <Section title={t('data.title')} body={t('data.body')} />
      <Section title={t('purposes.title')} body={t('purposes.body')} />
      <Section title={t('legal.title')} body={t('legal.body')} />
      <Section title={t('retention.title')} body={t('retention.body')} />
      <Section title={t('rights.title')} body={t('rights.body')} />
      <Section title={t('contact.title')} body={t('contact.body')} />
    </main>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 10 }}>{title}</h2>
      <p style={{ fontSize: 'clamp(15px, 3.5vw, 16px)', lineHeight: 1.6, color: '#1a1a1a', whiteSpace: 'pre-line' }}>{body}</p>
    </section>
  );
}
