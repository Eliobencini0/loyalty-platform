# Deploy — andare live (Vercel)

> Stato attuale: progetto **local-first**, gira solo sul tuo Mac. Nessun server pubblico.
> Questo documento è il piano per rimetterlo online quando vuoi. **Niente è ancora deployato.**

## Com'è fatto (cosa va deployato)

| Pezzo | Cos'è | Vercel-friendly? |
|---|---|---|
| `marketing/` | Next.js con `output: "export"` → **sito 100% statico** | ✅ Nativo, banale |
| `dashboard/` | React + Vite → **SPA statica** (base `/dashboard/`) | ✅ Build statica |
| `customer/` | HTML statico servito oggi da Express su `/app/*` | ✅ Statico (va ripuntato) |
| `src/` (API) | **Express + Prisma + connection pool** su una porta | ⚠️ Non serverless-native |
| DB | **PostgreSQL** (16 modelli, migrazioni Prisma) | ☁️ Serve un Postgres gestito |

Il punto delicato è **solo l'API**: è un server Express long-running con un pool di connessioni Prisma (`min:2 / max:10`). Vercel è serverless (funzioni effimere, niente connessioni persistenti), quindi ci sono due strade.

---

## Opzione A — consigliata: frontend su Vercel, API altrove + Neon

**La più veloce e con meno modifiche al codice.** L'Express resta identico.

1. **Database → [Neon](https://neon.tech)** (Postgres serverless, free tier)
   - Crea progetto, copia la **connection string pooled** (PgBouncer).
   - `DATABASE_URL` = quella stringa. `npx prisma migrate deploy` + seed.
2. **API → [Railway](https://railway.app) o [Render](https://render.com)** (free/hobby)
   - Deploy del repo, start `npm run build && npm start`, env `DATABASE_URL`, `PORT`, `CORS_ORIGIN`.
   - Ottieni un URL tipo `https://loyalty-api.up.railway.app`.
   - L'Express continua a servire `/api/*` **e** `/app/*` (pagine customer) senza modifiche.
3. **Frontend → Vercel** (2 progetti, stesso repo)
   - **marketing**: root `marketing/`, framework Next.js → deploy automatico.
   - **dashboard**: root `dashboard/`, build `npm run build`, output `dist/`, env `VITE_API_BASE_URL=https://loyalty-api.up.railway.app/api`.
4. **Dominio**: punti `app.tuodominio` → dashboard Vercel, root → marketing. `CORS_ORIGIN` sull'API = dominio dashboard.

Costo: **$0** sui free tier finché il traffico è basso.

---

## Opzione B — tutto su Vercel (full serverless)

Più "pulito" come unico provider, ma richiede di **adattare l'Express a funzione serverless**.

1. **DB → Neon** (o Vercel Postgres, che è Neon sotto). Stringa **pooled** obbligatoria.
2. **API → Vercel Serverless Function**
   - Crea `api/index.ts` che importa l'`app` Express e fa `export default app` (Vercel monta Express come catch-all function).
   - Sostituire il pool `pg` con **`@prisma/adapter-neon`** (o `pg` sulla stringa pooled) e abbassare `max` connessioni → in serverless ogni lambda apre le sue.
   - `express-rate-limit` in-memory **non** è condiviso tra lambda (ok a basso traffico; per seriet → Upstash Redis).
   - Le pagine `customer/` statiche vanno servite da Vercel static, non più da Express.
3. **Frontend**: come Opzione A.

Da valutare: cold start, niente stato in RAM tra invocazioni, eventuali path su filesystem (certificati wallet → vanno in env/secret).

---

## Raccomandazione

Parti con **Opzione A**: zero refactor dell'API, tutto live in mezza giornata, $0. Se più avanti vuoi consolidare su Vercel solo, migri all'Opzione B.

---

## 🚀 Deploy scelto: Render (Blueprint `render.yaml`)

Tutto lo stack con un solo "Apply". Il file `render.yaml` provisiona:
- **loyalty-db** — Postgres free (⚠️ cancellato dopo 30 giorni — per persistenza usa Neon, vedi sotto)
- **loyalty-api** — web service Docker: Express API + dashboard (`/dashboard`) + pagine customer (`/app/*`)
- **loyalty-marketing** — static site (CDN, sempre acceso): sito Next.js

### Passi (solo questi sono manuali — il resto è automatico)
1. Vai su **https://render.com** → registrati con **GitHub** (free, niente carta).
2. **New → Blueprint** → autorizza e seleziona il repo **`Eliobencini0/loyalty-platform`**.
3. Render legge `render.yaml` → **Apply**. Crea DB + API + marketing e cabla `DATABASE_URL` da solo.
4. Aspetta il build (~5-10 min la prima volta). Ottieni due URL:
   - App/dashboard → `https://loyalty-api.onrender.com/dashboard/`
   - Marketing → `https://loyalty-marketing.onrender.com`
5. Le migrazioni Prisma girano da sole all'avvio (`CMD` del Dockerfile). Per i dati demo, dalla shell del servizio `loyalty-api`: `npm run db:seed` (facoltativo, NON in produzione vera).

### Limiti del free su Render (da sapere)
- Il **web service** (API+dashboard) **si addormenta dopo ~15 min** di inattività → primo accesso lento (~30-60s). Il marketing (static) **non dorme mai**.
- Il **Postgres free scade a 30 giorni**. Per un DB persistente: crea un progetto free su **https://neon.tech**, copia la *pooled connection string*, e in `render.yaml` sostituisci il blocco `fromDatabase` con `sync: false` incollando la stringa nelle env del servizio. (rimuovi anche il blocco `databases:`)

### Nota cross-dominio
Marketing e app stanno su due URL diversi: i link "Inizia/Signup" del marketing puntano a `/dashboard/...` → vanno fatti puntare all'URL dell'API quando lo conosci (`marketing/src/lib/contact.ts` / link nelle pagine). Per ora dashboard e API condividono la stessa origine, quindi il login funziona senza CORS.

---

## Pre-flight checklist (prima di andare live)
- [ ] `npm audit` — ci sono vulnerabilità note (root + dashboard); valutare `npm audit fix`.
- [ ] `vite-plugin-pwa` non supporta Vite 8 → oggi install con `--legacy-peer-deps`. Bumpare il plugin o pinnare Vite prima del deploy.
- [ ] Variabili: `DATABASE_URL`, `CORS_ORIGIN`, eventuali `GOOGLE_MAPS_API_KEY`, `RESEND_API_KEY` (mailer), chiavi wallet.
- [ ] Rigenerare gli apiKey/seed: **non** usare i dati di seed in produzione.
- [ ] Dominio + DNS (il vecchio `loyali.online` puntava a una VPS ora riusata da un altro progetto — serve un dominio/DNS nuovo).
