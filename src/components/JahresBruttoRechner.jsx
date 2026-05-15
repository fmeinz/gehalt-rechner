import { useState } from 'react';
import { berechneJahresNetto } from '../utils/steuerrechner';
import { SteuerOptionen, ErgebnisTabelle } from './EingabeFelder';

const DEFAULTS = {
  steuerklasse: 1,
  kinder: 0,
  kirchensteuer: false,
  bundesland: 'default',
  kinderlos: false,
};

export default function JahresBruttoRechner() {
  const [jahresbrutto, setJahresbrutto] = useState('42000');
  const [optionen, setOptionen] = useState(DEFAULTS);

  function handleOption(key, val) {
    setOptionen(prev => ({ ...prev, [key]: val }));
  }

  const brutto = parseFloat(jahresbrutto) || 0;
  const ergebnis = brutto > 0
    ? berechneJahresNetto({ jahresbrutto: brutto, ...optionen })
    : null;

  return (
    <div className="rechner-karte">
      <h2>Jahresbrutto → Netto</h2>

      <div className="feld-gruppe highlight-feld">
        <label>Jahresbrutto (€)</label>
        <input
          type="number"
          min="0"
          step="500"
          value={jahresbrutto}
          onChange={e => setJahresbrutto(e.target.value)}
          placeholder="z.B. 42000"
        />
      </div>

      <SteuerOptionen werte={optionen} onChange={handleOption} />

      {ergebnis && (
        <>
          <ErgebnisTabelle
            abzuege={ergebnis.abzuege}
            brutto={brutto}
            netto={ergebnis.jahresNetto}
            istMonatlich={false}
          />
          <p className="hinweis">
            Entspricht einem Monatsbrutto von{' '}
            <strong>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(brutto / 12)}</strong>
            {' '}und einem Monatsnetto von{' '}
            <strong>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(ergebnis.monatsNetto)}</strong>.
          </p>
        </>
      )}
    </div>
  );
}
