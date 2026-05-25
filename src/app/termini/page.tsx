import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 86400;

export const metadata = {
  title: "Termini di servizio",
  description: `Termini di utilizzo di ${SITE_NAME}.`,
};

export default function TerminiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm font-medium text-sage hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Termini di servizio</h1>
      <p className="mt-2 text-sm text-muted">Ultimo aggiornamento: maggio 2026</p>

      <div className="card mt-8 space-y-6 rounded-2xl p-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-semibold text-foreground">1. Oggetto</h2>
          <p className="mt-2">
            {SITE_NAME} è una piattaforma che permette agli studenti di caricare, cercare e
            scaricare appunti in formato PDF. Utilizzando il servizio accetti questi termini.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-foreground">2. Contenuti caricati</h2>
          <p className="mt-2">
            Sei responsabile dei PDF che pubblichi. Devi avere il diritto di condividere il
            materiale (appunti propri, riassunti autorizzati, materiale libero da diritti).
            Non caricare esami riservati, libri protetti da copyright o dati personali di terzi
            senza consenso.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-foreground">3. Uso consentito</h2>
          <p className="mt-2">
            Il servizio è per uso personale e didattico tra studenti. È vietato spam,
            pubblicità, contenuti illegali o offensivi. Possiamo rimuovere contenuti segnalati
            o in violazione delle regole.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-foreground">4. Account</h2>
          <p className="mt-2">
            Mantieni riservate le credenziali del tuo account. Puoi eliminare i tuoi appunti
            dal profilo in qualsiasi momento.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-foreground">5. Limitazione di responsabilità</h2>
          <p className="mt-2">
            I contenuti sono forniti dagli utenti &quot;così come sono&quot;. Non garantiamo
            accuratezza accademica né disponibilità continua del servizio in questa fase MVP.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-foreground">6. Segnalazioni</h2>
          <p className="mt-2">
            Puoi segnalare contenuti inappropriati dalla pagina dell&apos;appunto. Esamineremo
            le segnalazioni e potremo rimuovere materiali o sospendere account in casi gravi.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-foreground">7. Contatti</h2>
          <p className="mt-2">
            Per richieste relative a questi termini o al trattamento dei dati, consulta anche
            la pagina{" "}
            <Link href="/privacy" className="font-medium text-sage hover:underline">
              Privacy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
