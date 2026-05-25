# Performance e database

## Cosa è già ottimizzato nel codice

| Area | Dettaglio |
|------|-----------|
| Logo | `public/logo1.avif` (~18 KB), cache immutable 1 anno |
| Font | Nunito 400/600/700, `display: swap` |
| Header | `getAuthContext()` con `React.cache` — 1× auth + profilo + notifiche |
| Proxy | Salta refresh sessione se non ci sono cookie Supabase |
| PDF upload | Max 20 MB; estrazione testo in background (`after()`) |
| Storage | `cacheControl: public, max-age=31536000, immutable` su upload PDF |
| Liste appunti | Query senza `pdf_text` (`NOTE_LIST_COLUMNS`) |
| Home anonimi | `unstable_cache` appunti recenti, revalidate 60s |
| Streaming | `Suspense` su home, cerca, commenti appunto |
| Sitemap | Cache 1h (`unstable_cache`) |
| Thumbnail PDF | Prima pagina JPEG in background, card + anteprima lazy |
| Rate limit | Ricerche (90/min) e download (50/h) |

## Database — cosa devi fare tu

### 1. Esegui la migration 010

In **Supabase → SQL Editor**, esegui:

`supabase/migrations/010_performance_indexes.sql`

Aggiunge indici **trigram** (extension `pg_trgm`) per accelerare i filtri `ILIKE` su università, corso e facoltà, più indici su `download_count` e `like_count`.

### 2. Verifica che la FTS funzioni

La ricerca testuale (`q=...`) usa la colonna generata `fts` e l’indice GIN `notes_fts_gin` (migration 006/009). Non serve altro se le migration sono tutte applicate.

### 3. Controlla query lente (opzionale)

In Supabase → **Reports → Query performance**, cerca:

- `select` con `ilike '%...%'` senza indice (dopo 010 dovrebbero migliorare)
- `count` esatti su ricerche molto ampie

Per una query specifica in locale:

```sql
explain analyze
select id from notes
where university ilike '%Milano%'
order by created_at desc
limit 24;
```

Se vedi `Seq Scan` su tabelle grandi, gli indici trigram aiutano; per la sola FTS usa `textSearch` sull’app (già implementato).

### 4. Storage CDN

Supabase Storage espone i file via CDN. Con `cacheControl` lungo sull’upload, il browser e l’edge cache riusano i PDF.

In dashboard: **Storage → notes → Settings** — bucket pubblico in lettura come da policy MVP.

### 5. Estrazione PDF in background

Richiede `SUPABASE_SERVICE_ROLE_KEY` in produzione (consigliato), altrimenti il job usa la sessione utente e può fallire dopo il redirect.

Dopo l’upload, il testo PDF può comparire in ricerca con pochi secondi di ritardo.

## Infrastruttura (punto 5)

| Azione | Dove |
|--------|------|
| `NEXT_PUBLIC_SITE_URL` | URL canonico per OG/sitemap |
| `SUPABASE_SERVICE_ROLE_KEY` | Job PDF + admin |
| Regione Vercel | Vicina al progetto Supabase (es. `fra1`) |
| Plausible / Sentry | Opzionali; non bloccano il rendering |

## Misurazione

1. [PageSpeed Insights](https://pagespeed.web.dev/) su `/`, `/cerca`, un `/appunti/[id]`
2. `npm run build` — controlla route statiche/dinamiche
3. Vercel Speed Insights in produzione
