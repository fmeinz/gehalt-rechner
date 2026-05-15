import { useState } from 'react';
import MonatsBruttoRechner from './components/MonatsBruttoRechner';
import JahresBruttoRechner from './components/JahresBruttoRechner';
import SteigerungsRechner from './components/SteigerungsRechner';
import './App.css';

const TABS = [
  { id: 'monat', label: 'Monatsbrutto' },
  { id: 'jahr', label: 'Jahresbrutto' },
  { id: 'steigerung', label: 'Gehaltssteigerung' },
];

export default function App() {
  const [aktiv, setAktiv] = useState('monat');

  return (
    <div className="app">
      <header>
        <h1>Gehaltsrechner</h1>
        <p className="subtitle">Deutschland 2025 – Näherungsrechnung</p>
      </header>

      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={aktiv === tab.id ? 'tab aktiv' : 'tab'}
            onClick={() => setAktiv(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {aktiv === 'monat' && <MonatsBruttoRechner />}
        {aktiv === 'jahr' && <JahresBruttoRechner />}
        {aktiv === 'steigerung' && <SteigerungsRechner />}
      </main>

      <footer>
        <p>
          Alle Angaben ohne Gewähr. Die Berechnung basiert auf dem BMF-Programmablaufplan 2025
          und liefert Näherungswerte. Für verbindliche Auskünfte wende dich an einen Steuerberater.
        </p>
      </footer>
    </div>
  );
}
