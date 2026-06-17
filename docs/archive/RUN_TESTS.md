# 🧪 Test delle Fix Critiche - Guida Completa

## Quick Start

```bash
# 1. Avvia il server in una finestra terminale
npm run dev

# 2. In un'altra finestra, esegui i test
node test-critical-fixes.js
```

## Cosa Viene Testato

### ✅ Test 1: API Key Authentication
- Creazione nuove API key hashate
- Formato corretto (`loy_test_*` / `loy_live_*`)
- Autenticazione con chiave hashata
- Backward compatibility con UUID legacy
- Reject di chiavi invalide
- Listing API keys (senza esporre hash)

### ✅ Test 2: Points Race Condition
- **10 richieste earn concorrenti** (100 punti totali)
- Verifica che tutti i 100 punti siano contati
- **5 richieste redeem concorrenti** (25 punti totali)
- Verifica atomicità delle operazioni
- Nessun punto perso in concorrenza

### ✅ Test 3: Rate Limiting
- `/auth/login` - 5 req/min (testa con 7 richieste)
- `/feedback` - 10 req/min (testa con 12 richieste)
- Verifica risposta 429 con Retry-After header
- Verifica reset dopo timeout

### ✅ Test 4: Connection Pool
- 20 richieste simultanee al database
- Verifica che tutte vadano a buon fine
- Tempo totale < 5 secondi
- Pool gestisce il carico senza timeout

## Output Atteso

```
============================================================
🧪 Critical Fixes Test Suite
============================================================

ℹ Testing API at: http://localhost:3000
ℹ Checking if server is running...

✓ Server is running
✓ Test merchant created
✓ Test card created

------------------------------------------------------------
TEST 1: Hashed API Key Authentication
------------------------------------------------------------

✓ Legacy UUID key still works (backward compatible)
✓ New API key created
✓ API key has correct format (loy_test_*)
✓ API key has correct length (73 chars)
✓ New API key authenticates successfully
✓ Can list API keys
✓ keyHash is not exposed in API response
✓ Invalid API key is rejected

✓ API Key Authentication: ALL TESTS PASSED

------------------------------------------------------------
TEST 2: Points Transaction Race Condition
------------------------------------------------------------

✓ All concurrent earn requests succeeded
✓ No race condition: 150 === 150 (all 100 points counted)
✓ All concurrent redeem requests succeeded
✓ Redeem race condition fixed: 125 === 125

✓ Points Race Condition: ALL TESTS PASSED

------------------------------------------------------------
TEST 3: Rate Limiting
------------------------------------------------------------

✓ Rate limit triggered after 5 requests (2 requests blocked)
✓ Feedback rate limit triggered (2 requests blocked)

✓ Rate Limiting: ALL TESTS PASSED

------------------------------------------------------------
TEST 4: PostgreSQL Connection Pool
------------------------------------------------------------

✓ All 20 concurrent requests succeeded (pool handled load)
✓ Pool handled requests efficiently (< 5 seconds total)

✓ Connection Pool: ALL TESTS PASSED

============================================================
📊 Test Results
============================================================
✓ Passed: 18
✗ Failed: 0
============================================================

✓ 🎉 ALL TESTS PASSED! Code is ready for production.
```

## Troubleshooting

### ❌ "Server is not running"
```bash
# Assicurati che il server sia avviato
npm run dev

# Verifica che sia in ascolto sulla porta corretta
curl http://localhost:3000/health
```

### ❌ "Database connection failed"
```bash
# Verifica che PostgreSQL sia in esecuzione
docker ps | grep postgres

# Oppure avvia con docker-compose
docker-compose up -d
```

### ❌ Test falliti
Se alcuni test falliscono:
1. Controlla i log del server (`npm run dev`)
2. Verifica che il database sia vuoto/pulito
3. Esegui le migration: `npx prisma migrate deploy`
4. Rigenera il client: `npx prisma generate`

## Esecuzione in CI/CD

Puoi aggiungere questo test alla pipeline GitHub Actions:

```yaml
# .github/workflows/test.yml
- name: Run Critical Fixes Tests
  run: |
    npm run dev &
    sleep 5
    node test-critical-fixes.js
```

## Variabili d'Ambiente

```bash
# Test su ambiente diverso
API_URL=http://staging.loyali.online node test-critical-fixes.js
```

## Prossimi Passi

Dopo che tutti i test passano:
1. ✅ Commit dello script di test
2. ✅ Push su GitHub
3. ✅ Creare PR-39
4. ✅ Merge dopo review
5. ⏸️ Implementare Task #2 (Wallet Auth) se necessario
