import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "Privacy",
  description: `Informativa privacy di ${SITE_NAME}.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm font-medium text-sage hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Privacy</h1>
      <p className="mt-2 text-sm text-muted">Ultimo aggiornamento: maggio 2026</p>

      <div className="card mt-8 space-y-6 rounded-2xl p-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-semibold text-foreground">Chi siamo</h2>
          <p className="mt-2">
            {SITE_NAME} è una piattaforma per condividere appunti universitari in PDF
            tra studenti. Questa informativa descrive come trattiamo i dati personali
            in questa prima versione del servizio.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground">Dati che raccogliamo</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Account: email, username, nome visualizzato (se fornito).</li>
            <li>Contenuti: PDF caricati, titolo, corso, università, descrizione.</li>
            <li>Interazioni: like (cuori), commenti, conteggio download.</li>
            <li>Tecnici: cookie di sessione per l&apos;autenticazione (Supabase).</li>
            <li>
              Statistiche di utilizzo aggregate tramite{" "}
              <a
                href="https://plausible.io/privacy-policy"
                className="font-medium text-sage hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Plausible Analytics
              </a>
              : pagine visitate ed eventi anonimi (es. registrazione, upload, download).
              Plausible non usa cookie di profilazione e non raccoglie dati personali
              identificativi per finalità pubblicitarie.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-foreground">Perché li usiamo</h2>
          <p className="mt-2">
            Per permetterti di registrarti, caricare e cercare appunti, mostrare il tuo
            profilo pubblico e gestire like e commenti. I PDF sono memorizzati su
            infrastruttura cloud (Supabase Storage) e sono consultabili dagli utenti del
            sito salvo rimozione da parte tua. Le statistiche Plausible ci aiutano a
            capire come viene usato il servizio (es. quali funzioni sono più utili), in
            forma aggregata.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground">Base giuridica</h2>
          <p className="mt-2">
            Esecuzione del servizio richiesto (art. 6.1.b GDPR) e, ove applicabile,
            legittimo interesse a far funzionare una community studentesca e migliorare il
            sito con metriche aggregate (art. 6.1.f).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground">Condivisione</h2>
          <p className="mt-2">
            Utilizziamo Supabase (hosting database, autenticazione e file), Vercel
            (hosting dell&apos;applicazione) e Plausible (analytics privacy-friendly).
            Non vendiamo i tuoi dati a terzi.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground">I tuoi diritti</h2>
          <p className="mt-2">
            Puoi richiedere accesso, rettifica o cancellazione dei dati scrivendo al
            responsabile del servizio. Puoi eliminare i tuoi appunti dal profilo,
            aggiornare username e nome dalla pagina modifica profilo, oppure eliminare
            l&apos;intero account dalla stessa pagina (sezione &quot;Elimina account&quot;).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground">Conservazione</h2>
          <p className="mt-2">
            I dati restano finché mantieni l&apos;account o finché non elimini i contenuti.
            In caso di chiusura del servizio, i dati saranno cancellati o anonimizzati
            nei tempi ragionevoli.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground">Contatti</h2>
          <p className="mt-2">
            Per domande sulla privacy, contatta il team {SITE_NAME} tramite i canali
            ufficiali del progetto.
          </p>
        </section>
      </div>
    </div>
  );
}
