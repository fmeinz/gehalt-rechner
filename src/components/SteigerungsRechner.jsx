import { useState } from 'react';
import { berechneSteigerung, formatEuro } from '../utils/steuerrechner';

const VERGLEICHSWERTE = [-10, -5, -3, -1, 1, 2, 3, 5, 8, 10];

export default function SteigerungsRechner() {
  const [brutto, setBrutto] = useState('3500');
  const [prozent, setProzent] = useState('3');
  const [istJaehrlich, setIstJaehrlich] = useState(false);

  const bruttoWert = parseFloat(brutto) || 0;
  const prozentWert = parseFloat(prozent) || 0;
  const istReduzierung = prozentWert < 0;

  const benutzerdefiniert = bruttoWert > 0 && prozentWert !== 0
    ? berechneSteigerung({ aktuellesBrutto: bruttoWert, steigerungProzent: prozentWert, istJaehrlich })
    : null;

  const einheit = istJaehrlich ? '/Jahr' : '/Monat';

  function differenzKlasse(diff) {
    if (diff > 0) return 'differenz positiv';
    if (diff < 0) return 'differenz negativ';
    return 'differenz';
  }

  function differenzAnzeige(diff) {
    return diff >= 0 ? `+${formatEuro(diff)}` : formatEuro(diff);
  }

  return (
    <div className="rechner-karte">
      <h2>Gehaltssteigerung / -reduzierung</h2>

      <div className="zweispaltig">
        <div className="feld-gruppe highlight-feld">
          <label>Aktuelles Brutto{einheit} (€)</label>
          <input
            type="number" min="0" step="50"
            value={brutto}
            onChange={e => setBrutto(e.target.value)}
            placeholder="z.B. 3500"
          />
        </div>
        <div className="feld-gruppe highlight-feld">
          <label>{istReduzierung ? 'Reduzierung (%)' : 'Steigerung (%)'}</label>
          <input
            type="number" step="0.1"
            value={prozent}
            onChange={e => setProzent(e.target.value)}
            placeholder="z.B. 3 oder −5"
            className={istReduzierung ? 'input-negativ' : ''}
          />
        </div>
      </div>

      <div className="checkbox-gruppe">
        <label>
          <input
            type="checkbox"
            checked={istJaehrlich}
            onChange={e => setIstJaehrlich(e.target.checked)}
          />
          Jahreswerte (statt Monatswerte)
        </label>
      </div>

      {benutzerdefiniert && (
        <div className={`ergebnis ergebnis-steigerung ${istReduzierung ? 'ergebnis-reduzierung' : ''}`}>
          <div className="ergebnis-highlight">
            <span>Neues Brutto{einheit}</span>
            <span className={istReduzierung ? 'netto-betrag negativ-akzent' : 'netto-betrag'}>
              {formatEuro(benutzerdefiniert.neuesBrutto)}
            </span>
          </div>
          <div className="steigerung-detail">
            <span>{istReduzierung ? 'Weniger' : 'Mehr'} pro {istJaehrlich ? 'Jahr' : 'Monat'}:</span>
            <span className={differenzKlasse(benutzerdefiniert.differenzBrutto)}>
              {differenzAnzeige(benutzerdefiniert.differenzBrutto)}
            </span>
          </div>
          {!istJaehrlich && (
            <div className="steigerung-detail">
              <span>{istReduzierung ? 'Weniger' : 'Mehr'} pro Jahr:</span>
              <span className={differenzKlasse(benutzerdefiniert.differenzBrutto * 12)}>
                {differenzAnzeige(benutzerdefiniert.differenzBrutto * 12)}
              </span>
            </div>
          )}
        </div>
      )}

      {bruttoWert > 0 && (
        <div className="vergleichstabelle">
          <h3>Vergleich</h3>
          <table>
            <thead>
              <tr>
                <th>Änderung</th>
                <th>Neues Brutto{einheit}</th>
                <th>Differenz{einheit}</th>
                {!istJaehrlich && <th>Differenz/Jahr</th>}
              </tr>
            </thead>
            <tbody>
              {VERGLEICHSWERTE.map(p => {
                const r = berechneSteigerung({ aktuellesBrutto: bruttoWert, steigerungProzent: p, istJaehrlich });
                const istAktiv = p === prozentWert;
                return (
                  <tr key={p} className={istAktiv ? 'aktive-zeile' : ''}>
                    <td className={p < 0 ? 'differenz negativ' : p > 0 ? 'differenz positiv' : ''}>
                      {p > 0 ? '+' : ''}{p} %
                    </td>
                    <td>{formatEuro(r.neuesBrutto)}</td>
                    <td className={differenzKlasse(r.differenzBrutto)}>
                      {differenzAnzeige(r.differenzBrutto)}
                    </td>
                    {!istJaehrlich && (
                      <td className={differenzKlasse(r.differenzBrutto * 12)}>
                        {differenzAnzeige(r.differenzBrutto * 12)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
