/** Università in evidenza sulla homepage */
export const POPULAR_UNIVERSITIES = [
  "Sapienza — Roma",
  "Università Statale — Milano",
  "Politecnico — Milano",
  "Università di Bologna",
  "Università di Padova",
  "Federico II — Napoli",
  "Università di Torino",
  "Università di Firenze",
  "Università di Pisa",
  "Bocconi — Milano",
  "Università di Trento",
  "Università Cattolica — Milano",
  "Università di Bari",
  "Università di Palermo",
  "Università di Catania",
  "Politecnico — Torino",
] as const;

/** Elenco esteso per suggerimenti in upload e ricerca */
export const ITALIAN_UNIVERSITIES = [
  "Bocconi — Milano",
  "Federico II — Napoli",
  "IULM — Milano",
  "Libera Università di Bolzano",
  "LUISS — Roma",
  "Politecnico — Bari",
  "Politecnico — Milano",
  "Politecnico — Torino",
  "Sant'Anna — Pisa",
  "Sapienza — Roma",
  "Scuola Normale Superiore — Pisa",
  "Università Ca' Foscari — Venezia",
  "Università Cattolica — Milano",
  "Università del Piemonte Orientale",
  "Università del Salento — Lecce",
  "Università della Calabria",
  "Università della Tuscia — Viterbo",
  "Università di Ancona (Politecnica delle Marche)",
  "Università di Bari",
  "Università di Bergamo",
  "Università di Bologna",
  "Università di Brescia",
  "Università di Cagliari",
  "Università di Camerino",
  "Università di Cassino e del Lazio Meridionale",
  "Università di Catania",
  "Università di Chieti-Pescara (G. d'Annunzio)",
  "Università di Enna Kore",
  "Università di Ferrara",
  "Università di Foggia",
  "Università di Genova",
  "Università di L'Aquila",
  "Università di Macerata",
  "Università di Messina",
  "Università di Milano-Bicocca",
  "Università di Modena e Reggio Emilia",
  "Università di Napoli Parthenope",
  "Università di Napoli L'Orientale",
  "Università di Padova",
  "Università di Palermo",
  "Università di Parma",
  "Università di Pavia",
  "Università di Perugia",
  "Università di Pisa",
  "Università di Roma Tor Vergata",
  "Università di Roma Tre",
  "Università di Salerno",
  "Università di Sassari",
  "Università di Siena",
  "Università di Teramo",
  "Università di Torino",
  "Università di Trento",
  "Università di Trieste",
  "Università di Udine",
  "Università di Urbino",
  "Università di Verona",
  "Università di Firenze",
  "Università Statale — Milano",
  "Università del Sannio — Benevento",
  "Università degli Studi di Milano",
] as const;

export const ALL_UNIVERSITIES = [
  ...new Set([...POPULAR_UNIVERSITIES, ...ITALIAN_UNIVERSITIES]),
].sort((a, b) => a.localeCompare(b, "it"));

export const ACADEMIC_YEARS = [
  "2025/2026",
  "2024/2025",
  "2023/2024",
  "2022/2023",
  "2021/2022",
] as const;

export const SEMESTERS = ["1", "2", "Annualità unica"] as const;

export const REPORT_REASONS = [
  "Contenuto inappropriato",
  "Violazione copyright",
  "Spam o pubblicità",
  "Informazioni false",
  "Altro",
] as const;

export const SITE_NAME = "Stufy";
export const LOGO_VERSION = "4";
/** Logo header (AVIF in /public, da images/logo1.avif). */
export const LOGO_SRC = `/logo1.avif?v=${LOGO_VERSION}`;
/** Favicon / icona scheda browser (AVIF in /public, da images/logo.avif). */
export const FAVICON_SRC = `/logo.avif?v=${LOGO_VERSION}`;

/** Tag suggeriti quando il DB non ne ha ancora abbastanza. */
export const SUGGESTED_TAGS = [
  "esame",
  "riassunto",
  "esercizi",
  "teoria",
  "laboratorio",
  "semestre-1",
  "semestre-2",
  "orale",
  "scritto",
  "formulario",
] as const;
