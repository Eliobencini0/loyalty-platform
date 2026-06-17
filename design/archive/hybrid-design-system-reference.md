# 🎨 Hybrid Design System: Expressive + Technical

**Version**: 2.0  
**Date**: 2026-04-18  
**Philosophy**: Material Design 3 Expressive meets Technical Minimalism

---

## 🧬 Design DNA

Questo design system ibrido combina **due anime** complementari:

### 🌟 **EXPRESSIVE** (Material Design 3 Vibrante)
- **Dove**: Componenti interattivi, UI emozionale, CTAs
- **Come**: Colori vibranti, border-radius morbidi (12px), ombre colorate
- **Scopo**: Engagement, call-to-action, momenti di gioia

### 📐 **TECHNICAL** (Minimalism Preciso)
- **Dove**: Dashboard dati, insights, tabelle, KPI
- **Come**: Sfondo bianco, bordi sottili (4px), zero ombre, tipografia precisa
- **Scopo**: Leggibilità, focus sui dati, professionalità

---

## 🎨 Color System

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--md-sys-color-primary` | `#725BF3` | Viola vibrante - elementi interattivi, link, bordi attivi |
| `--md-sys-color-on-primary` | `#FFFFFF` | Testo su viola |

### Secondary (⚠️ USO LIMITATO)

| Token | Hex | Usage | Restriction |
|-------|-----|-------|-------------|
| `--md-sys-color-secondary-container` | `#EFFF74` | Giallo acido | ⚡ **SOLO FAB principale** + success badges |
| `--md-sys-color-on-secondary-container` | `#6B7600` | Verde oliva su giallo | |

**🚨 REGOLA CRITICA**: Il giallo #EFFF74 è il **punto focale unico**. Non diluirlo su 10 bottoni diversi!

### Surface & Neutral

| Token | Hex | Usage |
|-------|-----|-------|
| `--md-sys-color-surface` | `#FCF8FF` | Sfondo app generale (lilla neutrale) |
| `--md-sys-color-surface-container-lowest` | `#FFFFFF` | Sfondo cards technical/insights (bianco puro) |
| `--md-sys-color-outline-variant` | `#CAC4D0` | Bordi sottili technical |

---

## 📐 Shape System (Border Radius)

### Expressive Components (Vibranti)

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-expressive` | **12px** | Bottoni, FAB, chips, badges |
| `--radius-expressive-lg` | **16px** | Modali, drawer, grandi componenti UI |
| `--radius-expressive-full` | **9999px** | Avatar, indicator circolari |

**CSS Class**: `.expressive` o `.btn-expressive`

```css
.my-button {
  border-radius: var(--radius-expressive); /* 12px */
}
```

### Technical Components (Sharp)

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-technical` | **4px** | Cards dati, KPI containers, dashboard |
| `--radius-technical-sm` | **2px** | Bordi tabelle, divider sottili |
| `--radius-technical-none` | **0px** | Insights strict, data grids |

**CSS Class**: `.technical` o `.card-technical`

```css
.data-card {
  border-radius: var(--radius-technical); /* 4px */
}
```

---

## 🌓 Shadows (Dual System)

### Expressive Shadows (Colorate, Soft)

```css
--shadow-expressive-sm: 0 2px 8px rgba(114, 91, 243, 0.12);
--shadow-expressive-md: 0 4px 12px rgba(114, 91, 243, 0.16);
--shadow-expressive-lg: 0 8px 24px rgba(114, 91, 243, 0.2);
```

**Quando**: Bottoni hover, FAB, modali, elementi che "escono" dallo schermo

### Technical Shadows (Zero)

```css
--shadow-technical: none;
```

**Quando**: Insights page, dashboard cards, tabelle dati, KPI

**Regola**: Se è un numero/dato → no shadow. Se è un'azione → shadow ok.

---

## ✍️ Typography (Dual Purpose)

### Emozionale (Display, Titoli Hero)

```css
.title-expressive {
  font-family: 'DM Serif Display', Georgia, serif;
  font-style: italic;
  letter-spacing: -0.02em;
}
```

**Quando**: Titoli hero, headlines marketing, momenti "wow"

**Esempio**: "Benvenuto, Marco" (setup wizard), "Serafina" (card principale)

### Tecnica (Dati, KPI, Tabelle)

```css
.title-technical {
  font-family: 'DM Sans', sans-serif;
  font-style: normal; /* NO italic! */
  font-weight: 700;
  letter-spacing: -0.01em;
}

.text-data {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-variant-numeric: tabular-nums; /* Numeri allineati */
}
```

**Quando**: KPI, numeri dashboard, label insights, intestazioni tabelle

**Esempio**: "1,234 clienti attivi", "€5,678.90", "45% retention"

---

## 🎯 Component Guidelines

### 1. Bottoni (Expressive)

```html
<!-- FAB Principale (GIALLO - unico) -->
<button class="fab-primary">
  <span>Scansiona QR</span>
</button>

<!-- Bottone Interactive (Viola) -->
<button class="btn-expressive accent-purple-bg">
  Aggiungi Punti
</button>

<!-- Bottone Secondario (Outline) -->
<button class="btn-expressive" style="border: 2px solid var(--primary)">
  Annulla
</button>
```

**Border-radius**: 12px  
**Shadow su hover**: `.shadow-expressive-md`

### 2. Cards Dashboard (Technical)

```html
<div class="card-technical">
  <div class="kpi-label">Clienti Attivi</div>
  <div class="kpi-value text-data">1,234</div>
</div>
```

**Border-radius**: 4px  
**Border**: 1px solid outline-variant  
**Shadow**: none  
**Background**: #FFFFFF

### 3. Insights Page (Ultra Clean)

```html
<div class="page-insights">
  <h2 class="title-technical">Analytics Overview</h2>
  
  <div class="card-technical">
    <table class="table-technical">
      <thead>
        <tr>
          <th>Metrica</th>
          <th>Valore</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-data">Retention D7</td>
          <td class="number-display">62.4%</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Background**: #FFFFFF (bianco puro)  
**Cards**: Bordi sottili, zero ombre  
**Font**: DM Sans (NO italic), tabular numerals

### 4. Success Indicators (Giallo limitato)

```html
<!-- Piccoli badge success -->
<span class="success-badge">+10 punti</span>

<!-- Status indicator -->
<div class="indicator-success">Completato</div>
```

**Background**: #EFFF74 (giallo acido)  
**Text**: #6B7600 (verde oliva)  
**Border-radius**: Full circular  
**Dimensione**: Piccola (2px padding, 0.75rem font)

---

## 📋 Quick Actions Color Map

| Action | Color | Type | Reasoning |
|--------|-------|------|-----------|
| **Add Points** | 🟡 `#EFFF74` | Success | Positive action → giallo (unico caso) |
| **Redeem** | 🟣 `#725BF3` | Interactive | Azione viola standard |
| **Show QR** | 🟣 `#725BF3` | Interactive | Era giallo → cambiato a viola |
| **Contest** | ⚪ `#E7E0EC` | Neutral | Grigio chiaro neutrale |

**Risultato**: Solo 1 elemento giallo in dashboard (Add Points) = punto focale unico ✅

---

## 🧪 Usage Matrix

| Elemento | Expressive | Technical | Border-Radius | Shadow |
|----------|------------|-----------|---------------|--------|
| **FAB principale** | ✅ | ❌ | 12px | Gialla soft |
| **Bottoni azione** | ✅ | ❌ | 12px | Viola hover |
| **KPI cards** | ❌ | ✅ | 4px | None |
| **Insights page** | ❌ | ✅ | 4px | None |
| **Tabelle dati** | ❌ | ✅ | 2px | None |
| **Success badge** | ✅ | ❌ | Full | None |
| **Titoli hero** | ✅ | ❌ | - | - |
| **Numeri KPI** | ❌ | ✅ | - | - |

---

## ✅ Checklist Design Review

Quando crei un nuovo componente, chiediti:

- [ ] **È un'azione** (bottone, FAB, CTA)?  
  → Usa `.expressive` (12px radius, colori vibranti)

- [ ] **È un dato** (KPI, tabella, metrica)?  
  → Usa `.technical` (4px radius, bordi sottili, no shadow)

- [ ] **Contiene numeri** (prezzi, statistiche, count)?  
  → Font: DM Sans (NO italic), `font-variant-numeric: tabular-nums`

- [ ] **È un titolo emozionale** (welcome, hero)?  
  → Font: DM Serif Display (italic)

- [ ] **Serve il giallo** (#EFFF74)?  
  → ⚠️ SOLO se è success indicator o FAB principale!

---

## 🚀 Implementation Examples

### Esempio 1: Dashboard Page (Mix)

```tsx
// Hero Title (Expressive)
<h1 className="title-expressive">Ciao, Marco!</h1>

// KPI Cards (Technical)
<div className="card-technical">
  <span className="kpi-label">Clienti Attivi</span>
  <span className="kpi-value text-data">1,234</span>
</div>

// FAB Azione (Expressive + Giallo)
<button className="fab-primary">
  <span>Scansiona QR</span>
</button>
```

### Esempio 2: Insights Page (Full Technical)

```tsx
<div className="page-insights">
  <h2 className="title-technical">Analytics</h2>
  
  <div className="card-technical">
    <table className="table-technical">
      {/* Dati qui */}
    </table>
  </div>
</div>
```

---

## 📊 Before vs After

| Aspetto | Before (Full M3) | After (Hybrid) |
|---------|------------------|----------------|
| Buttons | 28px radius | 12px radius (expressive) |
| Data cards | 28px radius | 4px radius (technical) |
| Shadows | Everywhere | Solo interactive |
| Yellow usage | Multiple | SOLO FAB + success |
| Insights | Colorato | Bianco puro, minimal |
| KPI font | Italic possibile | DM Sans normal |

**Risultato**: UI più sofisticata, focus chiaro, dati leggibili! 🎯

---

## 🎨 Live Examples

1. **Expressive**: FAB scan QR (giallo), bottoni azione (viola 12px)
2. **Technical**: Cards dashboard (bianco 4px), insights tables
3. **Hybrid**: Homepage (titolo italic + KPI technical)

---

**Mantieni questa filosofia**: Se fa qualcosa → expressive. Se mostra dati → technical.
