import { useState } from 'react';
import { berechneMonatsNetto, formatEuro } from '../utils/steuerrechner';
import { SteuerOptionen, ErgebnisTabelle } from './EingabeFelder';

// 36h/Woche Vollzeit → Monatsstunden
const STUNDEN_PRO_MONAT = (36 * 52) / 12; // 156 h

const DEFAULTS = {
  steuerklasse: 1,
  kinder: 0,
  kirchensteuer: false,
  bundesland: 'default',
  kinderlos: false,
};

export default function GehaltsRechner() {
  const [monatsbrutto, setMonatsbrutto] = useState('3500');
  const [jahresbrutto, setJahresbrutto] = useState(String(3500 * 12));
  const [optionen, setOptionen] = useState(DEFAULTS);

  const [zeigeBausteine, setZeigeBausteine] = useState(false);
  const [fixgehalt, setFixgehalt] = useState('');
  const [werktage, setWerktage] = useState('20');

  function syncVonMonat(val) {
    setMonatsbrutto(val);
    const n = parseFloat(val);
    setJahresbrutto(isNaN(n) ? '' : String(Math.round(n * 12)));
  }

  function syncVonJahr(val) {
    setJahresbrutto(val);
    const n = parseFloat(val);
    setMonatsbrutto(isNaN(n) ? '' : String(Math.round((n / 12) * 100) / 100));
  }

  function aktualisiereBausteine(fg, wt) {
    if (fg > 0) {
      const stundenlohn = fg / STUNDEN_PRO_MONAT;
      const gesamt = fg + wt * 0.8 * stundenlohn;
      const gerundet = Math.round(gesamt * 100) / 100;
      setMonatsbrutto(String(gerundet));
      setJahresbrutto(String(Math.round(gerundet * 12)));
    }
  }

  function handleFixgehalt(val) {
    setFixgehalt(val);
    const fg = parseFloat(val) || 0;
    const wt = parseInt(werktage) || 0;
    aktualisiereBausteine(fg, wt);
  }

  function handleWerktage(val) {
    setWerktage(val);
    const fg = parseFloat(fixgehalt) || 0;
    const wt = parseInt(val) || 0;
    aktualisiereBausteine(fg, wt);
  }

  function handleBausteineToggle(aktiv) {
    setZeigeBausteine(aktiv);
    if (!aktiv) setFixgehalt('');
  }

  const monatWert = parseFloat(monatsbrutto) || 0;
  const ergebnis = monatWert > 0
    ? berechneMonatsNetto({ monatsbrutto: monatWert, ...optionen })
    : null;

  const fg = parseFloat(fixgehalt) || 0;
  const wt = parseInt(werktage) || 0;
  const stundenlohn = fg > 0 ? fg / STUNDEN_PRO_MONAT : 0;
  const ueberstundenH = wt * 0.8;
  const ueberstundenEuro = stundenlohn * ueberstundenH;

  return (
    <div className="rechner-karte">
      <h2>Brutto → Netto</h2>

      <div className="zweispaltig">
        <div className="feld-gruppe highlight-feld">
          <label>Monatsbrutto (€)</label>
          <input
            type="number" min="0" step="50"
            value={monatsbrutto}
            onChange={e => syncVonMonat(e.target.value)}
            placeholder="z.B. 3500"
            disabled={zeigeBausteine && fg > 0}
          />
        </div>
        <div className="feld-gruppe highlight-feld">
          <label>Jahresbrutto (€)</label>
          <input
            type="number" min="0" step="500"
            value={jahresbrutto}
            onChange={e => syncVonJahr(e.target.value)}
            placeholder="z.B. 42000"
            disabled={zeigeBausteine && fg > 0}
          />
        </div>
      </div>

      <div className="bausteine-toggle">
        <label>
          <input
            type="checkbox"
            checked={zeigeBausteine}
            onChange={e => handleBausteineToggle(e.target.checked)}
          />
          Gehaltsbausteine – Fixgehalt + Überstunden
        </label>
      </div>

      {zeigeBausteine && (
        <div className="bausteine-bereich">
          <div className="zweispaltig">
            <div className="feld-gruppe">
              <label>Fixgehalt/Monat (36 h/Woche, €)</label>
              <input
                type="number" min="0" step="50"
                value={fixgehalt}
                onChange={e => handleFixgehalt(e.target.value)}
                placeholder="z.B. 3200"
              />
            </div>
            <div className="feld-gruppe">
              <label>Werktage im Monat</label>
              <input
                type="number" min="1" max="23" step="1"
                value={werktage}
                onChange={e => handleWerktage(e.target.value)}
              />
            </div>
          </div>

          {fg > 0 && (
            <div className="bausteine-info">
              <div className="baustein-zeile">
                <span>Stundenlohn (36-h-Basis)</span>
                <span>{formatEuro(stundenlohn)}/h</span>
              </div>
              <div className="baustein-zeile">
                <span>Überstunden ({wt} Tage × 0,8 h)</span>
                <span>{ueberstundenH.toFixed(1)} h</span>
              </div>
              <div className="baustein-zeile">
                <span>Überstundenvergütung</span>
                <span className="differenz positiv">+{formatEuro(ueberstundenEuro)}</span>
              </div>
              <div className="baustein-zeile baustein-gesamt">
                <span>Gesamtbrutto/Monat</span>
                <span>{formatEuro(monatWert)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <SteuerOptionen werte={optionen} onChange={(k, v) => setOptionen(p => ({ ...p, [k]: v }))} />

      {ergebnis && (
        <>
          <ErgebnisTabelle
            abzuege={ergebnis.abzuege}
            brutto={monatWert}
            netto={ergebnis.monatsNetto}
            istMonatlich
          />
          <p className="hinweis">
            Jahresnetto: <strong>{formatEuro(ergebnis.jahresNetto)}</strong>
          </p>
        </>
      )}
    </div>
  );
}
