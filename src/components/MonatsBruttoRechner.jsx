import { useState } from 'react';
import { berechneMonatsNetto } from '../utils/steuerrechner';
import { SteuerOptionen, ErgebnisTabelle } from './EingabeFelder';

const DEFAULTS = {
  steuerklasse: 1,
  kinder: 0,
  kirchensteuer: false,
  bundesland: 'default',
  kinderlos: false,
};

export default function MonatsBruttoRechner() {
  const [monatsbrutto, setMonatsbrutto] = useState('3500');
  const [optionen, setOptionen] = useState(DEFAULTS);

  function handleOption(key, val) {
    setOptionen(prev => ({ ...prev, [key]: val }));
  }

  const brutto = parseFloat(monatsbrutto) || 0;
  const ergebnis = brutto > 0
    ? berechneMonatsNetto({ monatsbrutto: brutto, ...optionen })
    : null;

  return (
    <div className="rechner-karte">
      <h2>Monatsbrutto → Netto</h2>

      <div className="feld-gruppe highlight-feld">
        <label>Monatsbrutto (€)</label>
        <input
          type="number"
          min="0"
          step="50"
          value={monatsbrutto}
          onChange={e => setMonatsbrutto(e.target.value)}
          placeholder="z.B. 3500"
        />
      </div>

      <SteuerOptionen werte={optionen} onChange={handleOption} />

      {ergebnis && (
        <>
          <ErgebnisTabelle
            abzuege={ergebnis.abzuege}
            brutto={brutto}
            netto={ergebnis.monatsNetto}
            istMonatlich
          />
          <p className="hinweis">
            Entspricht einem Jahresbrutto von{' '}
            <strong>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(ergebnis.jahresbrutto)}</strong>
            {' '}und einem Jahresnetto von{' '}
            <strong>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(ergebnis.jahresNetto)}</strong>.
          </p>
        </>
      )}
    </div>
  );
}
