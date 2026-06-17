'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, observerOptions);
    revealElements.forEach((el) => observer.observe(el));

    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counting', 'counted');
          const target = entry.target as HTMLElement;
          const text = target.textContent || '';
          const hasPlus = text.includes('+');
          const hasPercent = text.includes('%');
          const numericValue = parseInt(text.replace(/[^0-9]/g, ''));
          if (!isNaN(numericValue)) {
            let current = 0;
            const increment = numericValue / 30;
            const timer = setInterval(() => {
              current += increment;
              if (current >= numericValue) {
                target.textContent = text;
                clearInterval(timer);
              } else {
                const suffix = hasPlus ? '+' : hasPercent ? '%' : '';
                target.textContent = Math.floor(current) + suffix;
              }
            }, 30);
          }
        }
      });
    }, observerOptions);
    statNumbers.forEach((el) => statsObserver.observe(el));

    return () => {
      observer.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Hero - Split Layout */}
      <section className="hero-split">
        <div className="hero-split-image">
          <video
            className="hero-video"
            src="/hero.mp4"
            poster="/hero-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={t('hero.videoAria')}
          />
        </div>
        <div className="hero-split-content">
          <div className="hero-badge">
            <span className="hero-badge-text">{t('hero.badge')}</span>
          </div>
          <h1>
            {t('hero.titlePrefix')} <span className="hero-shimmer">{t('hero.titleShimmer')}</span>
          </h1>
          <p className="hero-subtitle">
            {t('hero.subtitleLine1')}
            <br />
            {t('hero.subtitleLine2')}
          </p>
          <div className="hero-buttons">
            <a href="/contact/" className="btn-hero btn-hero-secondary">
              {t('hero.ctaSecondary')}
            </a>
            <div className="hero-primary-group">
              <a href="/dashboard/signup" className="btn-hero btn-hero-primary">
                {t('hero.ctaPrimary')}
              </a>
              <p className="hero-trust">
                <span className="hero-trust-stat">{t('hero.trust')}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How-it-works section dropped (PR #67): the 3-step explainer
          overlapped heavily with Benefits below. The wallet differentiator
          (was Step 2) now lives in the hero subtitle. Translation keys in
          howItWorks.* and reassurance.* retained for future re-use. */}

      {/* Benefits */}
      <section id="benefits" className="benefits-section">
        <div className="section-header reveal">
          <h2>{t('benefits.sectionTitle')}</h2>
          <p>{t('benefits.sectionSubtitle')}</p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card benefit-loyalty reveal-stagger delay-1">
            <div className="benefit-icon">📱</div>
            <h3>{t('benefits.loyalty.title')}</h3>
            <p className="benefit-subtitle">{t('benefits.loyalty.subtitle')}</p>
            <p>{t('benefits.loyalty.body')}</p>
            <ul className="benefit-list">
              <li>{t('benefits.loyalty.bullet1')}</li>
              <li>{t('benefits.loyalty.bullet2')}</li>
              <li>{t('benefits.loyalty.bullet3')}</li>
            </ul>
          </div>

          <div className="benefit-card benefit-reputation reveal-stagger delay-2">
            <div className="benefit-icon">⭐</div>
            <h3>{t('benefits.reputation.title')}</h3>
            <p className="benefit-subtitle">{t('benefits.reputation.subtitle')}</p>
            <p>{t('benefits.reputation.body')}</p>
            <ul className="benefit-list">
              <li>{t('benefits.reputation.bullet1')}</li>
              <li>{t('benefits.reputation.bullet2')}</li>
              <li>{t('benefits.reputation.bullet3')}</li>
            </ul>
          </div>

          <div className="benefit-card benefit-growth reveal-stagger delay-3">
            <div className="benefit-icon">🚀</div>
            <h3>{t('benefits.growth.title')}</h3>
            <p className="benefit-subtitle">{t('benefits.growth.subtitle')}</p>
            <p>{t('benefits.growth.body')}</p>
            <ul className="benefit-list">
              <li>{t('benefits.growth.bullet1')}</li>
              <li>{t('benefits.growth.bullet2')}</li>
              <li>{t('benefits.growth.bullet3')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features — re-introduced after dropping How-it-works (PR #67).
          Now plays a clear role: capabilities-level detail below the
          high-level Benefits storytelling. */}
      <section id="features" className="section">
        <div className="section-header reveal">
          <h2>{t('features.sectionTitle')}</h2>
          <p>{t('features.sectionSubtitle')}</p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal-stagger delay-1">
            <div className="feature-icon">📱</div>
            <h3>{t('features.wallet.title')}</h3>
            <p>{t('features.wallet.body')}</p>
          </div>
          <div className="feature-card reveal-stagger delay-2">
            <div className="feature-icon">🔔</div>
            <h3>{t('features.push.title')}</h3>
            <p>{t('features.push.body')}</p>
          </div>
          <div className="feature-card reveal-stagger delay-3">
            <div className="feature-icon">🎯</div>
            <h3>{t('features.qr.title')}</h3>
            <p>{t('features.qr.body')}</p>
          </div>
          <div className="feature-card reveal-stagger delay-4">
            <div className="feature-icon">🎁</div>
            <h3>{t('features.rewards.title')}</h3>
            <p>{t('features.rewards.body')}</p>
          </div>
          <div className="feature-card reveal-stagger delay-5">
            <div className="feature-icon">📊</div>
            <h3>{t('features.analytics.title')}</h3>
            <p>{t('features.analytics.body')}</p>
          </div>
          <div className="feature-card reveal-stagger delay-6">
            <div className="feature-icon">⭐</div>
            <h3>{t('features.reviews.title')}</h3>
            <p>{t('features.reviews.body')}</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section" style={{ background: 'var(--background-surface)' }}>
        <div className="section-header reveal">
          <h2>{t('pricing.sectionTitle')}</h2>
          <p>{t('pricing.sectionSubtitle')}</p>
        </div>

        <div className="pricing-grid pricing-grid-two">
          <div className="pricing-card reveal-stagger delay-1">
            <h3>{t('pricing.core.name')}</h3>
            <div className="pricing-price">
              €9<span>{t('pricing.perMonth')}</span>
            </div>
            <p className="pricing-tagline">{t('pricing.core.tagline')}</p>
            <ul className="pricing-features">
              <li>{t('pricing.core.feature1')}</li>
              <li>{t('pricing.core.feature2')}</li>
              <li>{t('pricing.core.feature3')}</li>
              <li>{t('pricing.core.feature4')}</li>
              <li>{t('pricing.core.feature5')}</li>
              <li>{t('pricing.core.feature6')}</li>
            </ul>
            <a href="/dashboard/signup" className="pricing-cta">{t('pricing.core.cta')}</a>
          </div>

          <div className="pricing-card featured reveal-stagger delay-2">
            <h3>{t('pricing.grow.name')}</h3>
            <div className="pricing-price">
              €12<span>{t('pricing.perMonth')}</span>
            </div>
            <p className="pricing-tagline">{t('pricing.grow.tagline')}</p>
            <ul className="pricing-features">
              <li>{t('pricing.grow.feature1')}</li>
              <li><strong>{t('pricing.grow.feature2')}</strong></li>
              <li>{t('pricing.grow.feature3')}</li>
              <li>{t('pricing.grow.feature4')}</li>
              <li>{t('pricing.grow.feature5')}</li>
              <li>{t('pricing.grow.feature6')}</li>
            </ul>
            <a href="/dashboard/signup" className="pricing-cta">{t('pricing.grow.cta')}</a>
          </div>
        </div>
      </section>

      {/* Testimonials section removed pre-launch (PR #63 — no fake social
          proof while we're at 0 customers). Translation keys retained in
          messages/*.json for re-introduction once we have real pilot
          quotes. */}

      {/* Final CTA */}
      <section className="cta-section reveal">
        <h2>{t('finalCta.title')}</h2>
        <p>{t('finalCta.body')}</p>
        <a href="/dashboard/signup" className="btn-cta">{t('finalCta.button')}</a>
        <p className="cta-trust">{t('finalCta.trust')}</p>
      </section>
    </>
  );
}
