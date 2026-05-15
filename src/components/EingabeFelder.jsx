import { STEUERKLASSEN, formatEuro } from '../utils/steuerrechner';

export function SteuerOptionen({ werte, onChange }) {
  return (
    <div className="steuer-optionen">
      <div className="feld-gruppe">
        <label>Steuerklasse</label>
        <select value={werte.steuerklasse} onChange={e => onChange('steuerklasse', Number(e.target.value))}>
          {STEUERKLASSEN.map(sk => (
            <option key={sk.wert} value={sk.wert}>{sk.label}</option>
          ))}
        </select>
      </div>

      <div className="feld-gruppe">
        <label>Kinderfreibeträge</label>
        <select value={werte.kinder} onChange={e => onChange('kinder', Number(e.target.value))}>
          {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map(k => (
            <option key={k} value={k}>{k === 0 ? 'Keine' : k}</option>
          ))}
        </select>
      </div>

      <div className="feld-gruppe">
        <label>KV-Zusatzbeitrag gesamt (%)</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.01"
          value={werte.kvZusatzProzent}
          onChange={e => onChange('kvZusatzProzent', parseFloat(e.target.value) || 0)}
        />
        <span className="feld-hinweis">AN-Anteil: {((werte.kvZusatzProzent ?? 3.29) / 2).toFixed(3)} % · Ø-Satz 2026: 2,9 %</span>
      </div>

      <div className="feld-gruppe">
        <label>Bundesland (Kirchensteuer-Satz)</label>
        <select value={werte.bundesland} onChange={e => onChange('bundesland', e.target.value)}>
          <option value="default">Alle außer Bayern & BW (9 %)</option>
          <option value="BY">Bayern (8 %)</option>
          <option value="BW">Baden-Württemberg (8 %)</option>
        </select>
      </div>

      <div className="checkbox-gruppe">
        <label>
          <input
            type="checkbox"
            checked={werte.kirchensteuer}
            onChange={e => onChange('kirchensteuer', e.target.checked)}
          />
          Kirchensteuer abführen
        </label>
        <label>
          <input
            type="checkbox"
            checked={werte.kinderlos}
            onChange={e => onChange('kinderlos', e.target.checked)}
          />
          Kinderlos (&gt;23 J.) – Pflegeversicherungs-Zuschlag
        </label>
      </div>
    </div>
  );
}

export function ErgebnisTabelle({ abzuege, brutto, netto, istMonatlich }) {
  const einheit = istMonatlich ? '/Monat' : '/Jahr';

  return (
    <div className="ergebnis">
      <div className="ergebnis-highlight">
        <span>Netto{einheit}</span>
        <span className="netto-betrag">{formatEuro(netto)}</span>
      </div>

      <details className="aufschluesselung">
        <summary>Aufschlüsselung der Abzüge</summary>
        <table>
          <tbody>
            <tr className="abschnitt-kopf"><td colSpan={2}>Sozialversicherung</td></tr>
            <tr><td>Krankenversicherung</td><td>{formatEuro(abzuege.kv)}</td></tr>
            <tr><td>Pflegeversicherung</td><td>{formatEuro(abzuege.pv)}</td></tr>
            <tr><td>Rentenversicherung</td><td>{formatEuro(abzuege.rv)}</td></tr>
            <tr><td>Arbeitslosenversicherung</td><td>{formatEuro(abzuege.av)}</td></tr>
            <tr className="zwischensumme"><td>Summe SV</td><td>{formatEuro(abzuege.svGesamt)}</td></tr>

            <tr className="abschnitt-kopf"><td colSpan={2}>Steuern</td></tr>
            <tr><td>Lohnsteuer</td><td>{formatEuro(abzuege.lohnsteuer)}</td></tr>
            <tr><td>Solidaritätszuschlag</td><td>{formatEuro(abzuege.soli)}</td></tr>
            {abzuege.kiSt > 0 && <tr><td>Kirchensteuer</td><td>{formatEuro(abzuege.kiSt)}</td></tr>}
            <tr className="zwischensumme"><td>Summe Steuern</td><td>{formatEuro(abzuege.steuerGesamt)}</td></tr>

            <tr className="gesamtsumme"><td>Gesamtabzüge</td><td>{formatEuro(abzuege.gesamt)}</td></tr>
            <tr><td>Brutto{einheit}</td><td>{formatEuro(brutto)}</td></tr>
          </tbody>
        </table>
      </details>
    </div>
  );
}
