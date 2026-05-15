// Deutsche Lohnsteuer-Berechnung 2026 (Näherungsrechnung nach BMF-Programmablaufplan)
// Werte: Bundesministerium der Finanzen, Lohnsteuer-Programmablaufplan 2026
// Quellen: BMF PAP 2026 (12.11.2025), GKV-Spitzenverband, Deutsche Rentenversicherung

const GRUNDFREIBETRAG = 12_348;
const BBG_KV = 69_750;   // Beitragsbemessungsgrenze Kranken-/Pflegeversicherung
const BBG_RV = 101_400;  // Beitragsbemessungsgrenze Renten-/Arbeitslosenversicherung

// Arbeitnehmer-Anteile Sozialversicherung 2026
const SV = {
  kv: 0.0730,   // Krankenversicherung (allgemeiner Beitragssatz / 2)
  kvZusatz: 0.0145, // durchschnittlicher Zusatzbeitrag 2026 / 2 (2,9 % / 2)
  pv: 0.0180,   // Pflegeversicherung (Regelfall, 3,6 % / 2)
  pvKinderlos: 0.0240, // Pflegeversicherung ohne Kinder >23 J. (+0,6 % Zuschlag)
  rv: 0.0930,   // Rentenversicherung (18,6 % / 2)
  av: 0.0130,   // Arbeitslosenversicherung (2,6 % / 2)
};

// Einkommensteuer nach zvE (zu versteuerndes Einkommen) – Grundtabelle 2026
// Zonengrenzen: 0–12.348 / 12.349–17.799 / 17.800–69.878 / 69.879–277.825 / ≥277.826
function berechneESt(zvE) {
  if (zvE <= 12_348) return 0;

  if (zvE <= 17_799) {
    const y = (zvE - 12_348) / 10_000;
    return Math.floor((914.50 * y + 1_400) * y);
  }

  if (zvE <= 69_878) {
    const z = (zvE - 17_799) / 10_000;
    return Math.floor((173.10 * z + 2_397) * z + 1_034.90);
  }

  if (zvE <= 277_825) {
    return Math.floor(0.42 * zvE - 11_136);
  }

  return Math.floor(0.45 * zvE - 19_471);
}

// Kirchensteuer-Satz je Bundesland
export const KIRCHENSTEUER_SAETZE = {
  BY: 0.08, // Bayern
  BW: 0.08, // Baden-Württemberg
  default: 0.09,
};

// Steuerklassen-Bezeichnungen
export const STEUERKLASSEN = [
  { wert: 1, label: 'I – Ledig / Getrennt lebend' },
  { wert: 2, label: 'II – Alleinerziehend' },
  { wert: 3, label: 'III – Verheiratet (höheres Einkommen)' },
  { wert: 4, label: 'IV – Verheiratet (gleiches Einkommen)' },
  { wert: 5, label: 'V – Verheiratet (niedrigeres Einkommen)' },
  { wert: 6, label: 'VI – Nebenjob' },
];

/**
 * Berechnet das Jahres-Netto aus dem Jahres-Brutto.
 *
 * @param {object} params
 * @param {number} params.jahresbrutto
 * @param {number} params.steuerklasse  1–6
 * @param {number} params.kinder        Anzahl Kinderfreibeträge (0, 0.5, 1, 1.5, 2 …)
 * @param {boolean} params.kirchensteuer
 * @param {string}  params.bundesland   'BY' | 'BW' | 'default'
 * @param {boolean} params.kinderlos    Pflegeversicherungs-Zuschlag für Kinderlose >23 J.
 * @returns {object} Aufschlüsselung aller Abzüge und das Netto
 */
export function berechneJahresNetto({
  jahresbrutto,
  steuerklasse = 1,
  kinder = 0,
  kirchensteuer = false,
  bundesland = 'default',
  kinderlos = false,
}) {
  // ── Sozialversicherung ──────────────────────────────────────────────────────
  const grundlageKV = Math.min(jahresbrutto, BBG_KV);
  const grundlageRV = Math.min(jahresbrutto, BBG_RV);

  const kvBeitrag = Math.round(grundlageKV * (SV.kv + SV.kvZusatz));
  const pvBeitrag = Math.round(grundlageKV * (kinderlos ? SV.pvKinderlos : SV.pv));
  const rvBeitrag = Math.round(grundlageRV * SV.rv);
  const avBeitrag = Math.round(grundlageRV * SV.av);
  const svGesamt = kvBeitrag + pvBeitrag + rvBeitrag + avBeitrag;

  // ── Lohnsteuer: zvE je Steuerklasse ────────────────────────────────────────
  const werbungskosten = 1_230;
  const sonderausgaben = 36;

  let zvE;
  switch (steuerklasse) {
    case 1:
    case 4:
      zvE = Math.max(0, jahresbrutto - werbungskosten - sonderausgaben - GRUNDFREIBETRAG);
      break;
    case 2:
      zvE = Math.max(0, jahresbrutto - werbungskosten - sonderausgaben - GRUNDFREIBETRAG - 4_260);
      break;
    case 3:
      // Ehegattensplitting: doppelter Grundfreibetrag
      zvE = Math.max(0, jahresbrutto - werbungskosten - sonderausgaben - GRUNDFREIBETRAG * 2);
      break;
    case 5:
      // Kein Grundfreibetrag, kein Werbungskostenabzug
      zvE = Math.max(0, jahresbrutto - sonderausgaben);
      break;
    case 6:
      zvE = jahresbrutto;
      break;
    default:
      zvE = Math.max(0, jahresbrutto - werbungskosten - sonderausgaben - GRUNDFREIBETRAG);
  }

  let lohnsteuer = berechneESt(zvE);

  // Bei SK 3 wird die Steuer auf den halben zvE berechnet und verdoppelt (Splittingvorteil)
  if (steuerklasse === 3) {
    lohnsteuer = berechneESt(Math.floor(zvE / 2)) * 2;
  }

  // ── Solidaritätszuschlag ────────────────────────────────────────────────────
  // Freigrenze 2026: 20.350 € ESt (Einzelveranlagung)
  // Kinderfreibetrag 2026: 4.878 € je Elternteil mindert die Freigrenze
  const soliFreigrenze = 20_350 - kinder * 4_878;
  let soli = 0;
  if (lohnsteuer > soliFreigrenze) {
    soli = Math.round(Math.min(lohnsteuer * 0.055, (lohnsteuer - soliFreigrenze) * 0.119));
  }

  // ── Kirchensteuer ───────────────────────────────────────────────────────────
  const kiStSatz = KIRCHENSTEUER_SAETZE[bundesland] ?? KIRCHENSTEUER_SAETZE.default;
  const kiSt = kirchensteuer ? Math.round(lohnsteuer * kiStSatz) : 0;

  const steuerGesamt = lohnsteuer + soli + kiSt;
  const gesamtAbzuege = svGesamt + steuerGesamt;
  const jahresNetto = Math.round(jahresbrutto - gesamtAbzuege);

  return {
    jahresbrutto,
    jahresNetto,
    monatsNetto: Math.round(jahresNetto / 12),
    abzuege: {
      kv: kvBeitrag,
      pv: pvBeitrag,
      rv: rvBeitrag,
      av: avBeitrag,
      svGesamt,
      lohnsteuer,
      soli,
      kiSt,
      steuerGesamt,
      gesamt: gesamtAbzuege,
    },
  };
}

export function berechneMonatsNetto(params) {
  const result = berechneJahresNetto({
    ...params,
    jahresbrutto: params.monatsbrutto * 12,
  });
  return {
    ...result,
    monatsbrutto: params.monatsbrutto,
    abzuege: {
      ...result.abzuege,
      kv: Math.round(result.abzuege.kv / 12),
      pv: Math.round(result.abzuege.pv / 12),
      rv: Math.round(result.abzuege.rv / 12),
      av: Math.round(result.abzuege.av / 12),
      svGesamt: Math.round(result.abzuege.svGesamt / 12),
      lohnsteuer: Math.round(result.abzuege.lohnsteuer / 12),
      soli: Math.round(result.abzuege.soli / 12),
      kiSt: Math.round(result.abzuege.kiSt / 12),
      steuerGesamt: Math.round(result.abzuege.steuerGesamt / 12),
      gesamt: Math.round(result.abzuege.gesamt / 12),
    },
  };
}

export function berechneSteigerung({ aktuellesBrutto, steigerungProzent, istJaehrlich = false }) {
  const faktor = 1 + steigerungProzent / 100;
  const neuesBrutto = aktuellesBrutto * faktor;
  const differenzBrutto = neuesBrutto - aktuellesBrutto;
  const einheit = istJaehrlich ? 'Jahr' : 'Monat';
  return {
    aktuellesBrutto,
    neuesBrutto: Math.round(neuesBrutto * 100) / 100,
    differenzBrutto: Math.round(differenzBrutto * 100) / 100,
    steigerungProzent,
    einheit,
  };
}

export function formatEuro(betrag) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
}
