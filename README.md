# Stufy

Piattaforma web per condividere appunti universitari. MVP semplice: account, upload PDF, ricerca, download, like (cuori) e commenti.

**Stack:** Next.js · Supabase (Auth, DB, Storage) · Vercel

## Funzionalità

| Pagina | Route | Descrizione |
|--------|-------|-------------|
| Homepage | `/` | Ricerca, università popolari, appunti recenti |
| Cerca | `/cerca` | Filtri per titolo, università, corso |
| Carica | `/carica` | Upload PDF (richiede login) |
| Appunto | `/appunti/[id]` | Preview, download, like (cuore), commenti |
| Profilo | `/profilo` | Appunti caricati, download ricevuti |

## Setup locale

### 1. Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. In **SQL Editor**, esegui in ordine:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_note_comments.sql`
   - `supabase/migrations/003_username_normalize.sql`
   - `supabase/migrations/004_mvp_hardening.sql`
3. In **Authentication → URL Configuration**, aggiungi:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. (Opzionale) Disattiva **Confirm email** in Authentication → Providers → Email per test rapidi in locale
5. Copia **Project URL** e **anon key** da Settings → API

### 2. Variabili d'ambiente

```bash
cp .env.local.example .env.local
```

Compila `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# Opzionale (Open Graph in produzione):
# NEXT_PUBLIC_SITE_URL=https://tuo-dominio.vercel.app
```

### 3. Avvia

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Deploy su Vercel

1. Push del repo su GitHub
2. Import su [vercel.com](https://vercel.com)
3. Aggiungi le stesse variabili `NEXT_PUBLIC_SUPABASE_*`
4. In Supabase, aggiorna Site URL e Redirect URLs con il dominio Vercel (es. `https://stufy.vercel.app/auth/callback`)

## Struttura

```
src/
  app/           # Pagine e server actions
  components/    # UI condivisa
  lib/           # Supabase client, helper
  types/         # Tipi TypeScript
supabase/
  migrations/    # Schema SQL
```

## Schema dati

- `profiles` — utenti (collegati ad Auth)
- `notes` — appunti PDF
- `note_likes` — mi piace (un cuore per utente per appunto)
- `note_comments` — commenti sotto ogni appunto
- Storage bucket `notes` — file PDF pubblici in lettura
