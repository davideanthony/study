# Stufy

Piattaforma web per condividere appunti universitari.

**Stack:** Next.js · Supabase (Auth, DB, Storage) · Vercel

## Funzionalità

| Area | Dettaglio |
|------|-----------|
| Auth | Email/password, recupero password, Google/Apple OAuth, cambio password |
| Appunti | Upload/modifica PDF (max **20 MB**), estrazione testo in background, duplicati, like, salvati |
| Ricerca | Filtri, ordinamento, paginazione, **full-text su PDF** (PostgreSQL FTS) |
| Social | Follow, blocca utente, **messaggi DM**, notifiche in-app, profili |
| Tag | **Obbligatorio** (min 1), suggerimenti popolari, filtro ricerca + **full-text** |
| Versioni PDF | Storico versioni su modifica/upload |
| Moderazione | Segnalazioni, admin commenti (nascondi/elimina), dashboard |
| Rate limit | Limiti su upload, commenti, like, messaggi, follow, report |
| SEO | `robots.txt`, `sitemap.xml` dinamica |

## Setup locale

### 1. Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. In **SQL Editor**, esegui in ordine tutte le migration in `supabase/migrations/` (001 → **011**)
3. In **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. Abilita provider **Google** e **Apple** se usi OAuth
5. Per admin: `update profiles set is_admin = true where username = 'tuo_user';`

### 2. Variabili d'ambiente

```bash
cp .env.local.example .env.local
```

### 3. Avvia

```bash
npm install
npm run dev
```

## Test

```bash
npm run test          # unit (validazione PDF)
npm run test:e2e      # Playwright (avvia dev server automaticamente)
```

## Deploy su Vercel

Variabili consigliate:

| Variabile | Uso |
|-----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase |
| `NEXT_PUBLIC_SITE_URL` | URL canonico (`https://…`) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Analytics Plausible |
| `SUPABASE_SERVICE_ROLE_KEY` | Elimina account, re-indicizzazione PDF admin |
| `SENTRY_DSN` | Monitoring errori (server) |
| `NEXT_PUBLIC_SENTRY_DSN` | Opzionale, errori client (può coincidere con `SENTRY_DSN`) |

### Dominio custom (Vercel + Supabase)

Quando colleghi un dominio personalizzato, aggiorna entrambi i pannelli:

1. **Vercel → Project → Domains**
   - aggiungi il dominio (es. `app.tuodominio.it`);
   - imposta redirect da eventuale dominio secondario (`www`) verso il dominio canonico.

2. **Vercel → Environment Variables**
   - imposta `NEXT_PUBLIC_SITE_URL=https://app.tuodominio.it`;
   - aggiorna `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` allo stesso host, se usi Plausible.

3. **Supabase → Authentication → URL Configuration**
   - Site URL: `https://app.tuodominio.it`;
   - Redirect URLs (consigliato includere tutti gli ambienti usati):
     - `http://localhost:3000/auth/callback`
     - `https://app.tuodominio.it/auth/callback`
     - `https://app.tuodominio.it/auth/reset-password`
     - `https://<project>.vercel.app/auth/callback` (fallback)
     - `https://<project>.vercel.app/auth/reset-password` (fallback)

4. **OAuth provider (Google/Apple)**
   - allinea gli "Authorized redirect URI" agli stessi callback configurati in Supabase.

5. **Redeploy su Vercel**
   - dopo update dominio/env, fai un nuovo deploy per propagare i valori.

Il codice usa `NEXT_PUBLIC_SITE_URL` per generare i link auth e, in fallback, `VERCEL_URL`, quindi non servono cambi applicativi per il dominio in sé. Esegui anche la migration **007** per le notifiche realtime.

## Performance

Vedi [docs/PERFORMANCE.md](docs/PERFORMANCE.md) per cache, logo AVIF, indici DB e deploy.

## Schema dati (principale)

- `profiles` — utenti (+ bio, avatar, is_admin)
- `notes` — appunti (+ like_count, anno, semestre, facoltà, **pdf_text**, **fts**)

## Plausible Analytics

1. Crea account su [plausible.io](https://plausible.io) e aggiungi il sito (es. `app.tuodominio.it`).
2. In `.env.local` (e su Vercel → Environment Variables):

```env
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=app.tuodominio.it
```

3. Redeploy. Il pacchetto `@plausible-analytics/tracker` invia pageview ed eventi (`signup`, `note_upload`, `note_download`) solo se la variabile è impostata.
4. Configura gli stessi nomi evento come **Goals** nel pannello Plausible.
5. Nessun cookie banner obbligatorio in molti casi (Plausible è cookie-less), ma verifica la normativa applicabile.

## Appunti già caricati (full-text)

La ricerca nel PDF funziona solo per appunti caricati **dopo** la migration 006. Per re-indicizzare un PDF esistente, modifica l'appunto e ricarica il file.

Altre tabelle: `note_favorites`, `user_follows`, `notifications`, `content_reports`, `note_downloads`.

## Admin: re-indicizzazione PDF

In `/admin`, con `SUPABASE_SERVICE_ROLE_KEY` configurata, puoi rilanciare l'estrazione testo per la ricerca full-text (batch da 25 o tutti gli appunti).
