# PRD: Loyalty Platform PWA & Mobile-First Redesign

**Versione**: 1.0  
**Data**: 2026-04-17  
**Owner**: Team Loyalty Platform  
**Status**: Draft for Review

---

## 1. Executive Summary

### Problem Statement
L'attuale web app del loyalty platform non è ottimizzata per l'uso mobile da parte dei commercianti, con conseguente bassa retention e engagement. Manca supporto offline, installabilità e una UX pensata per scenari mobile-first (es. scansione QR in negozio).

### Proposed Solution
Trasformare l'app esistente in una Progressive Web App (PWA) completa con UI completamente riprogettata mobile-first, funzionalità offline-first e sistema di notifiche push per massimizzare l'engagement dei commercianti.

### Success Criteria
1. **Retention D7**: >= 60% commercianti attivi dopo 7 giorni dall'installazione
2. **Retention D30**: >= 40% commercianti attivi dopo 30 giorni
3. **Engagement Rate**: >= 3 sessioni/settimana per commerciante attivo
4. **Install Rate**: >= 50% utenti web installano la PWA entro 3 sessioni
5. **Offline Usage**: >= 30% sessioni iniziano offline (es. in negozio senza WiFi)

---

## 2. User Experience & Functionality

### User Personas

**Persona Primaria: Il Commerciante Mobile**
- **Chi**: Titolare/gestore di negozio fisico (bar, ristorante, retail)
- **Contesto d'uso**: In negozio, durante servizio clienti, spesso con mani occupate
- **Device**: Smartphone (80% Android, 20% iOS)
- **Pain points attuali**:
  - App web non si carica senza connessione
  - UI desktop-first difficile da usare su mobile
  - Scanner QR scomodo e lento
  - Nessuna notifica per feedback clienti
  - Deve aprire browser ogni volta (no app icon)

### User Stories & Acceptance Criteria

#### Epic 1: Installabilità PWA
**US-001**: Come commerciante, voglio installare l'app sul mio smartphone per accedervi rapidamente come un'app nativa.

**Acceptance Criteria**:
- [ ] Manifest.json configurato con nome, icone (192x192, 512x512), colori tema
- [ ] Install prompt personalizzato appare dopo 2 visite o 1 azione significativa
- [ ] App si apre in standalone mode (no browser UI)
- [ ] Splash screen con branding durante launch
- [ ] iOS: supporto Add to Home Screen con meta tags

---

#### Epic 2: Offline-First Experience
**US-002**: Come commerciante, voglio usare l'app anche senza connessione per non bloccare il servizio clienti.

**Acceptance Criteria**:
- [ ] Service Worker intercetta tutte le richieste
- [ ] **Dashboard**: dati cached (ultimo sync visibile)
- [ ] **Scansione QR**: funziona offline, sync automatico quando online
- [ ] **Carte fedeltà**: lista clienti cached (aggiornata ogni 6h o manuale)
- [ ] **Campagne**: visualizzazione cached, creazione queued
- [ ] **Feedback**: raccolta offline con sync queue visibile
- [ ] **Recensioni Google**: form cached, invio differito
- [ ] Indicator chiaro dello stato online/offline
- [ ] Background sync API per operazioni pending

---

#### Epic 3: Mobile-First UI Redesign

**US-003**: Come commerciante, voglio una UI ottimizzata per touch e uso con una mano.

**Acceptance Criteria**:
- [ ] Bottom Navigation Bar (5 tabs max, icone + label):
  - Home (dashboard quick stats)
  - Scanner QR (accesso rapido)
  - Campagne
  - Clienti
  - Menu (insights, settings, logout)
- [ ] Touch targets minimi 44x44px (iOS HIG)
- [ ] Spacing ottimizzato per pollice (content in zona raggiungibile)
- [ ] Gesture support: swipe-back navigation, pull-to-refresh
- [ ] No hover states, solo tap/long-press
- [ ] Font size >= 16px (evita zoom iOS)
- [ ] High contrast ratio (WCAG AA)

**US-004**: Come commerciante, voglio scansionare QR code velocemente anche in condizioni di scarsa luce.

**Acceptance Criteria**:
- [ ] Scanner QR full-screen con camera ottimizzata
- [ ] Auto-focus continuo
- [ ] Feedback aptico + visuale su scan success
- [ ] Fallback manual code input
- [ ] History ultimi 10 scan (offline-capable)
- [ ] Torch/flashlight toggle

---

#### Epic 4: Notifiche Push Engagement

**US-005**: Come commerciante, voglio ricevere notifiche quando un cliente lascia feedback per rispondere rapidamente.

**Acceptance Criteria**:
- [ ] Permission request nativa dopo primo feedback ricevuto (contesto chiaro)
- [ ] **Priorità 1 - Feedback Reminder**:
  - Notifica dopo 2h se cliente non ha lasciato feedback post-acquisto
  - Deep link diretto a form feedback
  - Testo personalizzato con nome cliente
- [ ] **Priorità 2 - Nuovi Feedback**:
  - Real-time quando cliente invia feedback
  - Preview sentimento (positivo/negativo/neutro)
  - Action button "Rispondi"
- [ ] **Priorità 3**:
  - Campagna in scadenza (3 giorni prima)
  - Nuovo cliente fedeltà registrato
  - Milestone raggiunto (es. 100 clienti)
- [ ] Notification center in-app per storico
- [ ] Settings granulari per tipo notifica

---

### Non-Goals (Fuori Scope v1.0)
- ❌ App native iOS/Android (solo PWA)
- ❌ Sistema pagamenti integrato (Stripe, PayPal)
- ❌ Multi-lingua oltre IT/EN (i18n già presente)
- ❌ Dark mode (post-v1.0)
- ❌ Funzionalità per clienti finali (focus 100% commercianti)
- ❌ Analytics avanzate real-time (manteniamo insights attuali)
- ❌ Integrazione POS/casse

---

## 3. Technical Specifications

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         PWA Frontend (React 19)         │
│  ┌─────────────────────────────────┐   │
│  │    Service Worker Layer         │   │
│  │  - Cache Strategy (Workbox)     │   │
│  │  - Background Sync Queue        │   │
│  │  - Push Notification Handler    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │    UI Layer (Mobile-First)      │   │
│  │  - Bottom Nav (React Router)    │   │
│  │  - Touch-optimized components   │   │
│  │  - QR Scanner (html5-qrcode)    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │    State Management             │   │
│  │  - Online/Offline State         │   │
│  │  - Sync Queue State             │   │
│  │  - IndexedDB for offline data   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
               ↕ (REST API)
┌─────────────────────────────────────────┐
│      Backend (Express + Prisma)         │
│  - Existing API (no breaking changes)   │
│  - New: Push Notification Service       │
│  - New: Background Sync Endpoints       │
└─────────────────────────────────────────┘
```

### Technology Stack

**Frontend Core** (no changes):
- React 19.2.4 + TypeScript
- Vite 8.0.1
- React Router 7.13.2

**New Dependencies**:
```json
{
  "workbox-webpack-plugin": "^7.0.0",  // Service Worker
  "idb": "^8.0.0",                     // IndexedDB wrapper
  "web-push": "^3.6.0",                // Push notifications (backend)
  "react-pwa-install": "^2.0.0"        // Install prompt component
}
```

**Browser Support**:
- Chrome/Edge >= 90
- Safari >= 15.4 (iOS PWA support)
- Firefox >= 88
- Samsung Internet >= 15

### PWA Implementation Details

#### 1. Manifest Configuration
File: `dashboard/public/manifest.json`

```json
{
  "name": "Loyalty Platform",
  "short_name": "Loyalty",
  "description": "Gestisci la tua carta fedeltà digitale",
  "start_url": "/dashboard/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#725BF3",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

#### 2. Service Worker Strategy (Workbox)

**Cache Strategy per Route**:
- **Static Assets** (JS, CSS, fonts): `CacheFirst` - 30 giorni
- **API Dashboard Data** (`/api/dashboard`, `/api/campaigns`): `NetworkFirst` - fallback cache 24h
- **API Scan** (`/api/cards/scan`): `NetworkFirst` + Background Sync
- **API Feedback** (`/api/feedback`): Background Sync Queue
- **Images/Icons**: `CacheFirst` - 7 giorni
- **Google Maps API**: `StaleWhileRevalidate`

**Background Sync Queues**:
1. `feedback-queue`: Feedback form submissions
2. `scan-queue`: QR scans offline
3. `campaign-queue`: Nuove campagne create offline

#### 3. Offline Data Storage (IndexedDB)

**Stores**:
```typescript
interface OfflineDB {
  customers: Customer[];        // Last 500 customers
  campaigns: Campaign[];        // Active campaigns
  dashboardStats: DashboardData; // Last sync timestamp
  scanHistory: Scan[];          // Last 100 scans
  pendingSync: SyncItem[];      // Queue items
}
```

**Sync Strategy**:
- Auto-sync ogni 6h quando online
- Manual pull-to-refresh
- Background Sync quando torna online

#### 4. Push Notifications Architecture

**Backend**:
- Libreria: `web-push` (VAPID keys)
- Endpoint: `POST /api/notifications/subscribe` (salva subscription)
- Worker: Cron job checks feedback triggers
- Priority queue: Critical (feedback) vs. Informational

**Frontend**:
- Permission request dopo primo utilizzo significativo
- Service Worker `push` event handler
- Notification click → deep link nella app

### Mobile-First Component Library

**New Design System**:
- Touch targets: 44x44px min
- Spacing scale: 4px base (4, 8, 16, 24, 32, 48)
- Typography: 16px base, scale mobile-optimized
- Bottom sheet modals (native mobile feel)
- Skeleton loaders per perceived performance

**Key Components da Creare**:
1. `<BottomNav />` - 5 tab navigation
2. `<QRScannerFull />` - Full-screen scanner
3. `<OfflineIndicator />` - Status banner
4. `<SyncQueueBadge />` - Pending items counter
5. `<InstallPrompt />` - Custom A2HS prompt
6. `<PushPermissionCard />` - Contextual ask
7. `<PullToRefresh />` - Manual sync trigger

### Integration Points

**Existing APIs** (no changes):
- Auth: `POST /api/auth/login`, `/api/auth/signup`
- Dashboard: `GET /api/dashboard`
- Cards: `POST /api/cards/scan`, `GET /api/cards`
- Campaigns: `GET /api/campaigns`, `POST /api/campaigns`
- Customers: `GET /api/customers/:id`
- Feedback: `POST /api/feedback`, `GET /api/feedback`

**New APIs** (da creare):
- `POST /api/notifications/subscribe` - Save push subscription
- `POST /api/notifications/unsubscribe`
- `POST /api/sync/batch` - Batch sync offline operations
- `GET /api/sync/status` - Check pending server-side updates

**External APIs**:
- Google Maps (già integrato) - per review flow
- Camera API (html5-qrcode wrapper)
- Web Push API (browser native)

### Security & Privacy

**PWA Security**:
- HTTPS obbligatorio (già presente via deployment)
- Service Worker scope limited a `/dashboard/`
- Content Security Policy header aggiornato per SW

**Offline Data**:
- IndexedDB encrypted at rest (browser-level)
- No dati sensibili clienti in cache (solo IDs + nomi)
- Auto-purge cache dopo 30 giorni inattività

**Push Notifications**:
- VAPID keys rotation policy (6 mesi)
- Subscription validation server-side
- No PII nei payload notifiche (solo IDs)

**Privacy**:
- Permission request con contesto chiaro (no dark patterns)
- Opt-out facile da settings
- GDPR-compliant: data deletion cancella anche subscriptions

### Performance Targets

**Core Web Vitals** (Mobile 4G):
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

**PWA-Specific**:
- Service Worker install: < 500ms
- Offline fallback: < 200ms
- Cache hit rate: > 80%

**Optimization Techniques**:
- Code splitting per route (React.lazy)
- Image optimization (WebP + lazy load)
- Preload critical routes
- Tree-shaking (Vite già ottimizzato)
- Gzip/Brotli compression

---

## 4. Implementation Roadmap

### Phase 1: PWA Foundation (Week 1-2)
**Obiettivo**: App installabile con offline basics

**Tasks**:
1. Setup Workbox + Service Worker
   - Configure cache strategies
   - Add offline fallback page
2. Create manifest.json + icons (5 sizes)
3. Implement IndexedDB schema
4. Add offline indicator UI
5. Basic install prompt
6. Test installazione iOS + Android

**Definition of Done**:
- [ ] App installabile su home screen
- [ ] Dashboard visibile offline (dati cached)
- [ ] Lighthouse PWA score >= 90

---

### Phase 2: Mobile-First UI Redesign (Week 3-4)
**Obiettivo**: UI completamente ripensata per mobile

**Tasks**:
1. Design system mobile (spacing, typography, touch targets)
2. Implementare Bottom Navigation
3. Ridisegnare tutte le pagine principali:
   - Home/Dashboard (quick stats card-based)
   - Scanner QR (full-screen, camera-first)
   - Campagne (list + detail mobile-optimized)
   - Clienti (search + profile modal)
   - Menu (settings, insights, logout)
4. Gesture support (swipe-back, pull-to-refresh)
5. Touch-optimized forms
6. Mobile-first modals (bottom sheets)

**Definition of Done**:
- [ ] Tutte le pagine responsive mobile-first
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll
- [ ] Lighthouse Accessibility >= 95

---

### Phase 3: Offline-First Data Sync (Week 5)
**Obiettivo**: Tutte le funzioni critiche offline

**Tasks**:
1. Background Sync Queue setup
   - Feedback offline → sync
   - QR scan offline → sync
   - Campaign creation → queue
2. IndexedDB CRUD operations
3. Sync status UI (pending badge)
4. Conflict resolution strategy
5. Manual sync trigger (pull-to-refresh)
6. Auto-sync on reconnect

**Definition of Done**:
- [ ] QR scan funziona offline
- [ ] Feedback inviabile offline
- [ ] Sync queue visibile in UI
- [ ] 0 data loss in offline mode

---

### Phase 4: Push Notifications (Week 6)
**Obiettivo**: Engagement via notifiche strategiche

**Tasks**:
1. Backend: web-push setup + VAPID keys
2. Backend: subscription endpoint + DB schema
3. Backend: trigger logic (feedback reminder, new feedback)
4. Frontend: permission request flow (contextual)
5. Frontend: notification handler in SW
6. Frontend: deep linking to app sections
7. Settings page: notification preferences

**Definition of Done**:
- [ ] Feedback reminder funzionanti
- [ ] Click notifica → app si apre su sezione corretta
- [ ] Opt-out da settings
- [ ] No permission spam (ask dopo utilizzo)

---

### Phase 5: Testing & Optimization (Week 7)
**Obiettivo**: Polish e performance

**Tasks**:
1. Cross-browser testing (Chrome, Safari iOS, Samsung Internet)
2. Performance audit (Lighthouse)
3. Offline scenario testing (airplane mode)
4. Push notification testing (critical path)
5. User testing con 5 commercianti beta
6. Fix bugs prioritari
7. Documentation (user guide PWA install)

**Definition of Done**:
- [ ] Lighthouse: Performance >= 90, PWA >= 95, A11y >= 95
- [ ] 0 critical bugs
- [ ] Beta feedback positivo (4/5 stars)

---

### Phase 6: Rollout & Monitoring (Week 8)
**Obiettivo**: Deploy produzione + osservabilità

**Tasks**:
1. Staging deployment + final QA
2. Production deployment
3. Setup analytics:
   - Install rate tracking
   - Offline usage %
   - Push notification CTR
   - Retention D7/D30
4. A/B test install prompt timing
5. Monitor error logs (SW errors, sync failures)
6. User communication (email + in-app banner)

**Definition of Done**:
- [ ] 100% utenti su PWA
- [ ] Monitoring attivo
- [ ] Rollback plan testato

---

## 5. Risks & Mitigation

### Technical Risks

**Risk 1: iOS PWA Limitations**
- **Probabilità**: Alta
- **Impatto**: Medio
- **Dettaglio**: Safari iOS limita PWA (no background sync completo, push notifications limitate pre-16.4)
- **Mitigation**:
  - Graceful degradation: se feature non supportata, mostra fallback
  - Documentare limitazioni iOS vs Android
  - Considerare "Add to Home Screen" come win anche senza full PWA

**Risk 2: Offline Data Conflicts**
- **Probabilità**: Media
- **Impatto**: Alto
- **Dettaglio**: Stessa carta scansionata offline da 2 device → conflitto sync
- **Mitigation**:
  - Last-write-wins con timestamp server
  - UI mostra warning se conflitto rilevato
  - Admin panel per risolvere edge cases

**Risk 3: Service Worker Cache Bloat**
- **Probabilità**: Media
- **Impatto**: Medio
- **Dettaglio**: Cache troppo grande → storage quota exceeded
- **Mitigation**:
  - Cache size limit: max 50MB
  - LRU eviction policy
  - Periodic cache cleanup (30 giorni)

**Risk 4: Push Notification Fatigue**
- **Probabilità**: Media
- **Impatto**: Alto (churn)
- **Dettaglio**: Troppe notifiche → utenti disabilitano o uninstall
- **Mitigation**:
  - Frequency cap: max 3 notifiche/giorno
  - Smart batching (raggruppa feedback)
  - A/B test timing e copy

### Business Risks

**Risk 5: Low Install Rate**
- **Probabilità**: Media
- **Impatto**: Alto
- **Dettaglio**: Commercianti non capiscono valore PWA vs. web
- **Mitigation**:
  - Onboarding flow educativo
  - Incentivo: "Installa per abilitare notifiche feedback"
  - A/B test prompt timing (dopo 1a scansione QR?)

**Risk 6: Offline Feature Adoption**
- **Probabilità**: Bassa
- **Impatto**: Medio
- **Dettaglio**: Commercianti hanno sempre WiFi → offline unused
- **Mitigation**:
  - Comunicare value anche online (faster load da cache)
  - Analytics per capire usage pattern reale

---

## 6. Success Metrics & Monitoring

### KPI Dashboard (Weekly Review)

**Adoption Metrics**:
- Install rate: `(PWA installs / total users) * 100`
- Target: >= 50% week 4 post-launch
- Uninstall rate: `(uninstalls / installs) * 100`
- Target: <= 10%

**Engagement Metrics**:
- Sessions/week per user (active): Target >= 3
- D7 Retention: Target >= 60%
- D30 Retention: Target >= 40%
- Avg session duration: Target >= 3min

**Feature Usage**:
- Offline sessions: `(sessions started offline / total sessions) * 100` - Target >= 30%
- QR scans from PWA: Target >= 80% total scans
- Push notification CTR: Target >= 20%
- Feedback via push click: Target >= 40% total feedback

**Performance**:
- Lighthouse scores (weekly audit)
- Service Worker errors: Target <= 0.5%
- Background sync success rate: Target >= 95%

### Analytics Implementation
- Google Analytics 4: eventi custom PWA
- Custom events:
  - `pwa_install`
  - `offline_session_start`
  - `background_sync_triggered`
  - `push_notification_sent`
  - `push_notification_clicked`
  - `qr_scan_offline`

---

## 7. Open Questions & Decisions Needed

**Q1**: Vogliamo supportare Apple Watch companion (post-v1.0)?
- Decision: **Out of scope v1.0** (valutare basandoci su adoption iOS)

**Q2**: Badge icon count (numero feedback non letti)?
- Decision: **TBD** - richiede Badging API, supporto limitato browser

**Q3**: Vogliamo permitire l'uso della PWA anche ai clienti finali (non solo commercianti)?
- Decision: **Out of scope v1.0** (focus commercianti, clienti in v2.0)

**Q4**: Strategia icone: generare automaticamente tutte le size o design custom?
- Decision: **Custom design** per 192x192 e 512x512, adaptive icon per Android

---

## 8. Appendix

### A. Competitor Analysis (PWA Loyalty Apps)

**Punch Card App** (punchcard.app):
- ✅ PWA installabile
- ✅ Offline QR scan
- ❌ No push notifications
- ❌ UI non mobile-first (desktop port)

**Loyverse** (loyverse.com):
- ✅ App nativa + PWA
- ✅ Offline POS integration
- ❌ Complessa (troppi feature)
- ❌ Slow (heavy app)

**Nostra Value Proposition**:
- 🎯 Mobile-first by design (no desktop legacy)
- 🎯 Offline-first (non afterthought)
- 🎯 Smart push (feedback-driven, non spam)
- 🎯 Fast (Vite + React 19)

### B. Design Inspiration

**Bottom Nav Pattern**: Spotify, Instagram, YouTube
**QR Scanner**: WeChat, WhatsApp Web
**Offline Indicator**: Gmail, Google Docs
**Install Prompt**: Twitter PWA, Starbucks PWA

### C. Technical Resources

**PWA**:
- [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps/)
- [Workbox Docs](https://developer.chrome.com/docs/workbox/)

**Push Notifications**:
- [Web Push Book](https://web-push-book.gauntface.com/)
- [VAPID Setup Guide](https://blog.mozilla.org/services/2016/04/04/using-vapid-with-webpush/)

**Offline**:
- [Offline Cookbook](https://web.dev/offline-cookbook/)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)

---

## Sign-off

**Prepared by**: Claude (PRD Skill)  
**Review Required**: Product Owner, Tech Lead  
**Approval Needed**: Before Phase 1 implementation start  

**Next Steps**:
1. Review questo PRD con stakeholder
2. Prioritize/de-scope se timeline aggressiva
3. Design review UI mockups (Phase 2)
4. Kickoff Phase 1 implementation

---

**Changelog**:
- 2026-04-17: v1.0 - Initial draft basato su discovery session
