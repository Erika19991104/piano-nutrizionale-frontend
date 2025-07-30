import React from 'react';

export default function RiepilogoFabbisogno({ dati }) {
  // Aggiungi un controllo più robusto:
  // Il componente renderà solo se 'dati' esiste E 'dati.riepilogo_fabbisogno' esiste.
  if (!dati || !dati.riepilogo_fabbisogno) {
    // Puoi scegliere di mostrare un messaggio di caricamento, un placeholder,
    // o semplicemente non renderizzare nulla finché i dati non sono pronti.
    // In questo caso, torniamo null per non mostrare nulla.
    return null;
  }

  const r = dati.riepilogo_fabbisogno;

  // Funzione per formattare i numeri (arrotonda a 2 decimali, se non sono numeri interi)
  const formatNumber = (num) => {
    if (typeof num === 'number') {
      // Evita di aggiungere decimali se è un numero intero
      if (Number.isInteger(num)) {
        return num.toString();
      }
      return num.toFixed(2); // Arrotonda a 2 cifre decimali
    }
    return num; // Restituisce il valore originale se non è un numero
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Riepilogo del Tuo Fabbisogno</h3>
      <p style={styles.description}>
        Questi valori indicano il tuo fabbisogno calorico e di macronutrienti giornaliero,
        calcolati in base alle informazioni fornite.
      </p>

      <div style={styles.grid}>
        <div style={styles.item}>
          <strong>BMI:</strong> <span style={styles.value}>{formatNumber(r.BMI)}</span>
        </div>
        <div style={styles.item}>
          <strong>Peso ideale:</strong> <span style={styles.value}>{formatNumber(r.Peso_ideale)} kg</span>
        </div>
        <div style={styles.item}>
          <strong>Metabolismo Basale:</strong> <span style={styles.value}>{formatNumber(r.Metabolismo_basale)} kcal</span>
        </div>
        <div style={styles.item}>
          <strong>LAF (Livello Attività Fisica):</strong> <span style={styles.value}>{formatNumber(r.LAF)}</span>
        </div>
        <div style={styles.item}>
          <strong>Metabolismo Totale Giornaliero:</strong> <span style={styles.value}>{formatNumber(r.Metabolismo_totale_giornaliero)} kcal</span>
        </div>
        <div style={styles.item}>
          <strong>Deficit Calorico Impostato:</strong> <span style={styles.value}>{formatNumber(r.Deficit_calorico_impostato)} kcal</span>
        </div>
      </div>

      <h4 style={styles.subtitle}>Fabbisogno di Macronutrienti Giornaliero</h4>
      <div style={styles.grid}>
        <div style={styles.item}>
          <strong>Proteine:</strong> <span style={styles.value}>{formatNumber(r.Fabbisogno_proteine_g.min)} - {formatNumber(r.Fabbisogno_proteine_g.max)} g</span>
        </div>
        <div style={styles.item}>
          <strong>Carboidrati:</strong> <span style={styles.value}>{formatNumber(r.Fabbisogno_carboidrati_g.min)} - {formatNumber(r.Fabbisogno_carboidrati_g.max)} g</span>
        </div>
        <div style={styles.item}>
          <strong>Grassi:</strong> <span style={styles.value}>{formatNumber(r.Fabbisogno_grassi_g.min)} - {formatNumber(r.Fabbisogno_grassi_g.max)} g</span>
        </div>
      </div>
    </div>
  );
}

// Stili CSS (puoi spostarli in un file CSS separato o usare una libreria UI)
const styles = {
  container: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '25px',
    marginTop: '30px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
  title: {
    color: '#2c3e50',
    fontSize: '1.8em',
    marginBottom: '15px',
    textAlign: 'center',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
  },
  subtitle: {
    color: '#34495e',
    fontSize: '1.4em',
    marginTop: '30px',
    marginBottom: '15px',
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px',
  },
  description: {
    fontSize: '0.95em',
    color: '#555',
    textAlign: 'center',
    marginBottom: '25px',
    lineHeight: '1.5',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Colonne adattive
    gap: '15px',
  },
  item: {
    backgroundColor: '#ffffff',
    border: '1px solid #dcdcdc',
    borderRadius: '6px',
    padding: '15px',
    fontSize: '1.05em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontWeight: 'normal', // Il valore numerico non deve essere più grassetto dell'etichetta
    color: '#007bff', // Colore per evidenziare il valore
    fontSize: '1.1em',
  }
};
