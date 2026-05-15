import { useState } from 'react';
import { berechneSteigerung, formatEuro } from '../utils/steuerrechner';

export default function SteigerungsRechner() {
  const [brutto, setBrutto] = useState('3500');
  const [prozent, setProzent] = useState('3');
  const [istJaehrlich, setIstJaehrlich] = useState(false);

  const bruttoWert = parseFloat(brutto) || 0;
  const prozentWert = parseFloat(prozent) || 0;

  const mehrereSchritte = [1, 2, 3, 5, 8, 10].map(p =>
    berechneSteigerung({ aktuellesBrutto: bruttoWert, steigerungProzent: p, istJaehrlich })
  );

  const benutzerdefiniert = bruttoWert > 0 && prozentWert !== 0
    ? berechneSteigerung({ aktuellesBrutto: bruttoWert, steigerungProzent: prozentWert, istJaehrlich })
    : null;

  const einheit = istJaehrlich ? '/Jahr' : '/Monat';

  return (
    <div className="rechner-karte">
      <h2>Gehaltssteigerung berechnen</h2>

      <div className="zweispaltig">
        <div className="feld-gruppe highlight-feld">
          <label>Aktuelles Brutto{einheit} (€)</label>
          <input
            type="number"
            min="0"
            step="50"
            value={brutto}
            onChange={e => setBrutto(e.target.value)}
            placeholder="z.B. 3500"
          />
        </div>

        <div className="feld-gruppe highlight-feld">
          <label>Steigerung (%)</label>
          <input
            type="number"
            step="0.1"
            value={prozent}
            onChange={e => setProzent(e.target.value)}
            placeholder="z.B. 3"
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
        <div className="ergebnis ergebnis-steigerung">
          <div className="ergebnis-highlight">
            <span>Neues Brutto{einheit}</span>
            <span className="netto-betrag">{formatEuro(benutzerdefiniert.neuesBrutto)}</span>
          </div>
          <div className="steigerung-detail">
            <span>Mehr pro {istJaehrlich ? 'Jahr' : 'Monat'}:</span>
            <span className="differenz positiv">+{formatEuro(benutzerdefiniert.differenzBrutto)}</span>
          </div>
          {!istJaehrlich && (
            <div className="steigerung-detail">
              <span>Mehr pro Jahr:</span>
              <span className="differenz positiv">+{formatEuro(benutzerdefiniert.differenzBrutto * 12)}</span>
            </div>
          )}
        </div>
      )}

      {bruttoWert > 0 && (
        <div className="vergleichstabelle">
          <h3>Vergleich gängiger Steigerungen</h3>
          <table>
            <thead>
              <tr>
                <th>Steigerung</th>
                <th>Neues Brutto{einheit}</th>
                <th>Mehr{einheit}</th>
                {!istJaehrlich && <th>Mehr/Jahr</th>}
              </tr>
            </thead>
            <tbody>
              {mehrereSchritte.map(r => (
                <tr key={r.steigerungProzent} className={r.steigerungProzent === prozentWert ? 'aktive-zeile' : ''}>
                  <td>{r.steigerungProzent} %</td>
                  <td>{formatEuro(r.neuesBrutto)}</td>
                  <td className="differenz positiv">+{formatEuro(r.differenzBrutto)}</td>
                  {!istJaehrlich && <td className="differenz positiv">+{formatEuro(r.differenzBrutto * 12)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
