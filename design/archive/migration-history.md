# Design System Migration: Material Design 3

**Data**: 2026-04-18  
**Obiettivo**: Migrazione completa da design system custom a Material Design 3

## 🎨 Palette Colori

### PRIMA (Design Attuale)
```css
--primary: #0050d4 (blu corporate)
--secondary: #006947 (verde)
--tertiary: #815100 (arancione)
--surface: #F4F6FF (azzurro chiaro)
```

### DOPO (Material Design 3)
```css
--md-sys-color-primary: #725BF3 (viola vibrante)
--md-sys-color-secondary-container: #EFFF74 (giallo acido)
--md-sys-color-on-secondary-container: #6B7600 (verde oliva)
--md-sys-color-surface: #FCF8FF (lilla neutrale)
```

## 📝 Tipografia

### PRIMA
- Headline: Plus Jakarta Sans
- Body: Manrope

### DOPO
- Display Large: **DM Serif Display, Italic** (titoli impatto)
- Label/Body: **DM Sans, Bold** (bottoni, etichette)

## 📐 Shape System

### PRIMA
- Bottoni: 8-12px border-radius
- Cards: 12-16px border-radius

### DOPO (M3 Minimum)
- Bottoni: 28px border-radius (minimo M3)
- Cards: 48px border-radius (card principali)
- TextField: 28px border-radius

## 🎯 Componenti Chiave Modificati

1. **Buttons**: Border-radius aumentato a 28px, nuovi colori
2. **Cards**: Border-radius aumentato a 48px per card principali
3. **Text Fields**: Outlined style con border viola (#725BF3)
4. **FAB**: Extended FAB con sfondo giallo (#EFFF74)
5. **Icons**: Material Symbols Variable

## ⚠️ Note Implementazione

- ✅ Mantenere compatibilità con componenti React esistenti
- ✅ Non migrare a Web Components (troppo invasivo)
- ✅ Applicare solo design tokens M3
- ✅ Verificare contrasti WCAG AA
- ✅ Rigenerare icone PWA con nuovi colori

## 📋 Checklist Migrazione

- [x] Backup index.css
- [ ] Aggiornare CSS color tokens
- [ ] Integrare Google Fonts
- [ ] Aggiornare border-radius
- [ ] Rigenerare icone PWA
- [ ] Aggiornare manifest.json
- [ ] Test componenti
- [ ] Verifica accessibilità
