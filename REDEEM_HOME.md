# Home Redeem — Project Plan

Entry-point "Riscatta" sulla home del dashboard merchant. Riconciliato da UX + UI review (2026-05-05).

## TL;DR — decisione

**Home "Riscatta" v1 = riscatto codice premio campaign.** Non unifichiamo con threshold redeem.

- **Threshold redeem** (es. 10 timbri = caffè): resta dov'è (banner dentro `CustomerProfileModal` post-scan). È un side-effect dell'azione "Aggiungi punti", non un job autonomo.
- **Prize redeem** (codice 6-char da campaign): è un job autonomo, attivato dal cliente che esibisce un codice. Merita entry-point home dedicato.

Niente bottom-sheet di scelta tra i due. Niente `?mode=redeem` su `/scan-qr`.

## JTBD

> "Un cliente arriva al banco e mi mostra un codice (o QR) che dice di aver vinto. Voglio verificare velocemente se è valido, vedere cosa ha vinto, e riscattare in 2-3 secondi senza ansia."

Frequenza prevista: 0-2 volte al giorno per merchant attivo, ma alta ansia (codice mai visto) e alta magia percepita per il cliente. Vale il real estate.

## Tile home

File: `dashboard/src/pages/LoyaltyHubPage.tsx` (riga 32-35)

Cambia: aggiungi `onClick`, badge "pending prize wins".

```tsx
<button
  type="button"
  className="hub-secondary-tile"
  onClick={() => navigate('/redeem-code')}
  disabled={!hasActiveCampaignsWithPrizes}  // hide tile when no prizes are out
>
  <span className="hub-secondary-icon material-symbols-outlined">
    confirmation_number
  </span>
  {hasPendingPrizeWins && <span className="hub-tile-badge" aria-label="Premi in attesa" />}
  <span className="hub-secondary-label">{t('hub.redeem')}</span>
</button>
```

- Icona: `confirmation_number` (resta — semantica "ticket/voucher" giusta)
- Badge: dot `8px chartreuse #EFFF74` con `border 2px solid var(--surface)`, posizionato top-right dell'icona, no numero
- Tile **disabled / nascosto** se `activeCampaignsWithPrizeWins == 0` — evita cognitive load su merchant senza campaign

Nuova classe CSS: `.hub-tile-badge`.

## Pagina `/redeem-code`

Nuovo file: `dashboard/src/pages/RedeemCodePage.tsx`. Fullpage sotto `FullPageLayout`.

### Layout (top → bottom)

1. **Header** — `back ← + title "Riscatta premio"`
2. **Hero input segmentato** `.prize-code-input` — 6 box OTP-style
3. **Helper subtitle** — *"Inserisci il codice di 6 caratteri del cliente"*
4. **Pulsante secondario** — *"Scansiona QR premio"* (riusa scanner di `/scan-qr` ma POST a `/api/prize-wins/lookup`)
5. **Stati condizionali sotto l'input** — preview valido / errore / validating

### Input segmentato `.prize-code-input`

- 6 box, `48×56px`, gap `8px`, `border-radius: 12px`, `border: 1.5px solid var(--border)`
- Font: `24px / 700 / monospace` (riusa stack già presente)
- Focus: `border-color: var(--primary)`, `box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent)`
- Auto-uppercase, `inputMode="text"`, `pattern="[A-Z0-9]"`
- Paste 6-char auto-split sui box
- Auto-submit a 6 char con debounce 200ms

### Stati

| Stato | UI |
|---|---|
| **Vuoto / inserimento** | Solo subtitle helper + scan QR secondary |
| **Validating** | Skeleton card sotto + spinner inline "Verifica in corso..." |
| **Valido** | Card preview `.prize-code-preview`: icona `card_giftcard` + nome reward `18px/700` + riga cliente (`avatar + nome 14px`) + riga scadenza (`schedule + "Scade GG/MM"`) + CTA `.apm-hero-btn` chartreuse "Conferma riscatto" |
| **Errore** | Box `.prize-code-error` rosso pastello, icona `error_outline` + messaggio specifico, animazione `shake 0.3s` + reset input |

### Errori (gerarchia chiara, no leak)

| Caso | Messaggio |
|---|---|
| Codice scaduto | *"Codice scaduto il {data}"* + secondary "Contatta il cliente" |
| Già usato | *"Già riscattato il {data} alle {ora}"* — mostra ricevuta, blocca |
| Altro merchant | *"Codice non valido per questo locale"* (NO leak: non rivelare quale merchant) |
| Inesistente | Stesso messaggio di "altro merchant" — non distinguere (riduce attack surface guessing) |

### Successo

- Conferma → POST API
- `.apm-success-overlay` (riusato) check chartreuse + *"Premio riscattato!"* 1.5s
- Auto-redirect a home (`navigate('/')`) — è un job atomico, finito

## Backend

### Endpoint nuovo: `GET /api/prize-wins/lookup`

Query: `?code=ABC123` → ritorna `PrizeWin` se appartiene al merchant + active.

**Response valido:**
```json
{
  "id": "uuid",
  "redemptionCode": "ABC123",
  "status": "ACTIVE",
  "expiresAt": "2026-06-01T...",
  "wonAt": "2026-04-15T...",
  "prize": { "name": "Caffè gratis", "description": "...", "prizeType": "..." },
  "customer": { "firstName": "Mario", "lastName": "R.", "avatarUrl": null }
}
```

**Response errore:** 404 con `error: "expired" | "redeemed" | "not_found"` (404 anche per "altro merchant" + "inesistente" — non distinguere)

Auth: `authenticateMerchant`, scope al `merchantId`.

### Endpoint nuovo: `POST /api/prize-wins/:id/redeem`

Body: `{ }` (idempotente sull'id).

- Verifica status=ACTIVE
- Verifica merchantId match
- Set `status='REDEEMED'`, `redeemedAt=now()`
- Ritorna `{ success: true, prizeWin: {...} }`

Già esiste schema `PrizeWin.status` + `PrizeWin.redeemedAt` → no migration.

### Endpoint nuovo: `GET /api/campaigns/active-prize-stats`

Per il tile badge:
```json
{ "hasActiveCampaignsWithPrizes": true, "pendingPrizeWins": 3 }
```

Usato da home tile per disabled-state + badge.

## Frontend file plan

| File | Azione |
|---|---|
| `dashboard/src/pages/LoyaltyHubPage.tsx` | Aggiungi onClick + badge logic. Carica stats via nuovo endpoint. |
| `dashboard/src/pages/RedeemCodePage.tsx` | **Nuovo**. Logica + UI come sopra. |
| `dashboard/src/components/PrizeCodeInput.tsx` | **Nuovo**. Input segmentato 6-box riusabile. |
| `dashboard/src/App.tsx` | Aggiungi route `/redeem-code`. |
| `dashboard/src/api.ts` | Aggiungi `lookupPrizeCode(code)`, `redeemPrize(id)`, `getActivePrizeStats()`. |
| `dashboard/src/index.css` | Aggiungi `.hub-tile-badge`, `.prize-code-input`, `.prize-code-preview`, `.prize-code-error`. |
| `dashboard/src/i18n/{en,it,es}.json` | Nuove chiavi sotto `redeemCode.*`. |
| `src/routes/prize-wins.ts` | **Nuovo**. Lookup + redeem endpoints. |
| `src/routes/campaigns.ts` | Aggiungi `/active-prize-stats`. |
| `src/index.ts` | Mount `/api/prize-wins`. |

## Cosa NON fare in v1

- ❌ Bottom-sheet di scelta tra threshold/prize (rejected da UX)
- ❌ `/scan-qr?mode=redeem` (overhead inutile, threshold redeem già in profile modal)
- ❌ Search-by-name nel prize redeem (il codice identifica univocamente cliente+premio)
- ❌ Nuovo `RedeemConfirmModal` per i prizes — usa preview card inline + `.apm-hero-btn` invece
- ❌ Nuovo success screen — riusa `.apm-success-overlay`

## Ordine implementazione suggerito

1. **Backend prima** (lookup + redeem + stats) — testabile via curl
2. **PrizeCodeInput component** isolato (storybook-style, no integrazione)
3. **RedeemCodePage** scheletro + integrazione lookup → preview
4. **Confirm + success flow** + redirect home
5. **Tile badge + stats endpoint** — finitura
6. **i18n** in parallelo con (3-5)

Stima rough: backend 2-3h, frontend 4-6h, polish/QA 2h.
