import React from "react";

export default function GiornoRow({ giorno, info, index }) { // Aggiunto 'index'
  // Funzione per formattare i numeri (arrotonda a 2 decimali, se non sono numeri interi)
  const formatNumber = (num, decimalPlaces = 1) => {
    if (typeof num === 'number') {
      if (Number.isInteger(num)) {
        return num.toString();
      }
      return num.toFixed(decimalPlaces);
    }
    return num; // Restituisce il valore originale se non è un numero
  };

  // Stili per la riga: alterna colore di sfondo per migliorare leggibilità
  const rowStyle = index % 2 === 0 ? styles.evenRow : styles.oddRow;

  return (
    <tr style={rowStyle}>
      <td style={styles.tdBold}>{giorno.charAt(0).toUpperCase() + giorno.slice(1)}</td>
      <td style={styles.td}>{formatNumber(info.kcal_target)} kcal</td>
      <td style={styles.td}>{formatNumber(info.proteina_pranzo)} g</td>
      <td style={styles.td}>{formatNumber(info.proteina_cena)} g</td>
      <td style={styles.td}>
        <div style={styles.recipeContainer}>
          <span style={styles.mealLabel}>Pranzo:</span>
          <span style={styles.recipeName}>
            {info.pasti?.pranzo?.ricetta || "Nessuna ricetta"}
          </span>
          {info.pasti?.pranzo?.kcal_ricetta && (
            <span style={styles.recipeKcal}> ({formatNumber(info.pasti.pranzo.kcal_ricetta, 0)} kcal)</span>
          )}
        </div>
        <div style={styles.recipeContainer}>
          <span style={styles.mealLabel}>Cena:</span>
          <span style={styles.recipeName}>
            {info.pasti?.cena?.ricetta || "Nessuna ricetta"}
          </span>
          {info.pasti?.cena?.kcal_ricetta && (
            <span style={styles.recipeKcal}> ({formatNumber(info.pasti.cena.kcal_ricetta, 0)} kcal)</span>
          )}
        </div>
      </td>
    </tr>
  );
}

// --- Stili CSS (puoi spostarli in un file CSS separato o usare una libreria UI) ---
const styles = {
  // Stili per le righe alternate
  evenRow: {
    backgroundColor: '#f8f8f8', // Grigio molto chiaro per righe pari
  },
  oddRow: {
    backgroundColor: '#ffffff', // Bianco per righe dispari
  },
  // Stili per le celle (td)
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #eee', // Bordo sottile per separare le righe
    color: '#333',
    textAlign: 'left',
    verticalAlign: 'top', // Allinea il contenuto in alto per celle con più righe
  },
  tdBold: { // Stile specifico per il nome del giorno
    padding: '12px 15px',
    borderBottom: '1px solid #eee',
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'left',
    verticalAlign: 'top',
  },
  // Stili per le sezioni delle ricette
  recipeContainer: {
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  mealLabel: {
    fontWeight: 'bold',
    color: '#555',
    marginRight: '5px',
  },
  recipeName: {
    fontStyle: 'italic',
    color: '#007bff', // Colore per evidenziare il nome della ricetta
  },
  recipeKcal: {
    fontSize: '0.9em',
    color: '#666',
  }
};