import React from "react";
import GiornoRow from "./GiornoRow";

export default function PianoTable({ piano }) {
  if (!piano) {
    return (
      <div style={styles.noDataMessage}>
        <p>Nessun piano settimanale disponibile. Genera un piano per vederlo qui!</p>
      </div>
    );
  }

  return (
    <div style={styles.tableContainer}>
      <h3 style={styles.tableTitle}>Il Tuo Piano Nutrizionale Settimanale</h3>
      <p style={styles.tableDescription}>
        Qui trovi il dettaglio del tuo piano, giorno per giorno, con fabbisogno calorico,
        quantità di proteine e suggerimenti per le ricette di pranzo e cena.
      </p>
      <table style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.th}>Giorno</th>
            <th style={styles.th}>Kcal Target</th>
            <th style={styles.th}>Proteina Pranzo</th>
            <th style={styles.th}>Proteina Cena</th>
            <th style={styles.th}>Ricette Pranzo & Cena</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(piano).map(([giorno, info]) => (
            // Passiamo un indice per poter applicare stili alternati alle righe
            <GiornoRow key={giorno} giorno={giorno} info={info} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Stili CSS (puoi spostarli in un file CSS separato o usare una libreria UI) ---
const styles = {
  tableContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '25px',
    marginTop: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflowX: 'auto', // Per la responsività su schermi piccoli
  },
  tableTitle: {
    color: '#2c3e50',
    fontSize: '1.8em',
    marginBottom: '15px',
    textAlign: 'center',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
  },
  tableDescription: {
    fontSize: '0.95em',
    color: '#555',
    textAlign: 'center',
    marginBottom: '25px',
    lineHeight: '1.5',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '0 auto',
    borderRadius: '8px',
    overflow: 'hidden', // Per i bordi arrotondati della tabella
  },
  tableHeader: {
    backgroundColor: '#3498db',
    color: 'white',
  },
  th: {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
  },
  noDataMessage: {
    textAlign: 'center',
    marginTop: '40px',
    padding: '20px',
    background: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    color: '#721c24',
  },
};