# 🎯 Loyalty Platform

> Digital loyalty card platform for merchants — Progressive Web App with offline-first capabilities.

**Version**: 3.0 (Hybrid Design System)  
**Tech Stack**: React 19 + TypeScript + Vite + Express + Prisma + PostgreSQL  
**Design**: Material Design 3 Expressive + Technical Minimalism

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start backend (port 3000)
npm run dev

# Start dashboard (port 5173)
cd dashboard
npm run dev
```

**Access**:
- Dashboard: http://localhost:5173
- API: http://localhost:3000
- API Health: http://localhost:3000/health

---

## 📁 Project Structure

```
loyalty-platform/
├── dashboard/              # Merchant PWA (React + Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, Offline)
│   │   ├── db/           # IndexedDB (offline storage)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── i18n/         # Internationalization
│   │   └── service-worker.ts  # PWA service worker
│   ├── public/
│   │   ├── manifest.json # PWA manifest
│   │   └── icons/        # App icons (192, 512)
│   └── vite.config.ts
│
├── src/                   # Backend API (Express + Prisma)
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, error handling
│   └── services/         # Business logic
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
│
├── design/               # 🎨 Design System Documentation
│   ├── README.md         # ← START HERE!
│   ├── DESIGN_SYSTEM.md  # Core design system
│   ├── COMPONENTS.md     # Component guidelines
│   ├── ACCESSIBILITY.md  # WCAG compliance
│   └── archive/          # Historical docs
│
└── docs/                 # Additional documentation
    └── PWA_MOBILE_FIRST_PRD.md
```

---

## 🎨 Design System

**Complete documentation**: **[design/README.md](./design/README.md)**

### Quick Reference

| Resource | Purpose |
|----------|---------|
| **[Design System](./design/DESIGN_SYSTEM.md)** | Colors, typography, tokens |
| **[Components](./design/COMPONENTS.md)** | UI component guidelines |
| **[Accessibility](./design/ACCESSIBILITY.md)** | WCAG compliance |
| **[Brand Guidelines](./design/brand-guidelines.md)** | Logo, brand identity |

**Philosophy**: Hybrid system with two personalities:
- 🌟 **Expressive** (Interactive UI) - Purple #725BF3, 12px radius, vibrant
- 📐 **Technical** (Data/Insights) - White, 4px radius, minimal

**Implementation**: CSS variables in `dashboard/src/index.css`, utility classes: `.expressive`, `.technical`, `.card-technical`

---

## 🏗️ Tech Stack

### Frontend (Dashboard)
- **Framework**: React 19.2.4 + TypeScript
- **Build Tool**: Vite 8.0.3
- **PWA**: vite-plugin-pwa (Workbox)
- **Routing**: React Router 7.13.2
- **i18n**: i18next (EN, IT, ES)
- **Offline**: IndexedDB + Background Sync
- **Fonts**: DM Serif Display, DM Sans

### Backend (API)
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: API Key based
- **CORS**: Enabled for dashboard

### PWA Features
- ✅ Offline-first (IndexedDB + Service Worker)
- ✅ Installable (manifest.json)
- ✅ Background sync (offline mutations)
- ✅ Push notifications (planned)
- ✅ Fast (precache + cache strategies)

---

## 📱 Features

### For Merchants
- 🎯 **Loyalty Programs**: Stamp cards & points systems
- 📊 **Analytics**: KPIs, retention, sentiment analysis
- 👥 **Customer Management**: CRM with search & filters
- 📣 **Campaigns**: Promotions & targeted offers
- ⭐ **Review Flow**: Google Maps review collection
- 📱 **QR Scanning**: Award points/stamps via QR
- 🌐 **Offline Mode**: Works without internet

### For Customers
- 🎴 **Digital Cards**: Wallet-ready loyalty cards
- 🎁 **Rewards Tracking**: Points & stamps progress
- 💬 **Feedback**: Rate & review experiences
- 🎮 **Gamification**: Spin-the-wheel, scratch cards

---

## 🛠️ Development

### Environment Variables

Create `.env` in root:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/loyalty"
PORT=3000
NODE_ENV=development
```

Create `dashboard/.env`:
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### Database Management

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Build & Deploy

```bash
# Build dashboard
cd dashboard
npm run build

# Build backend (TypeScript)
npm run build

# Production start
npm start
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[design/README.md](./design/README.md)** | Design system overview |
| **[docs/PWA_MOBILE_FIRST_PRD.md](./docs/PWA_MOBILE_FIRST_PRD.md)** | PWA product requirements |
| **[design/archive/migration-history.md](./design/archive/migration-history.md)** | Design evolution history |

---

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Lighthouse PWA audit
npm run lighthouse

# Accessibility audit
npm run a11y
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Update `VITE_API_BASE_URL` to production API
- [ ] Build dashboard: `cd dashboard && npm run build`
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Set secure environment variables
- [ ] Enable HTTPS
- [ ] Configure service worker caching
- [ ] Test offline functionality
- [ ] Verify PWA installability

### Deployment Platforms

- **Backend**: Railway, Render, Fly.io
- **Database**: Railway PostgreSQL, Supabase
- **Frontend**: Vercel, Netlify, Cloudflare Pages

---

## 🤝 Contributing

### Design System Updates

When updating design:
1. Update relevant file in `design/`
2. Update CSS variables in `dashboard/src/index.css`
3. Increment version in `design/README.md`
4. Document in `design/archive/implementation-log.md`

### Code Guidelines

- Follow existing code style
- Use TypeScript strict mode
- Test on mobile devices
- Verify WCAG AA compliance
- Check Lighthouse score (>90)

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Support

- **Design Questions**: See [design/README.md](./design/README.md)
- **Technical Issues**: Check API health endpoint
- **Database Issues**: Check Prisma Studio

---

**Built with ❤️ using React + Material Design 3**
