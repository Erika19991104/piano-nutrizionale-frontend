import React, { useState } from 'react';

export default function PianoSettimanaleOutput({ dati }) {
  // Aggiungi un controllo robusto:
  // Il componente renderà solo se 'dati' esiste E 'dati.piano_settimanale' esiste.
  if (!dati || !dati.piano_settimanale) {
    // Puoi scegliere di mostrare un messaggio di caricamento, un placeholder,
    // o semplicemente non renderizzare nulla finché i dati non sono pronti.
    return null;
  }

  const piano = dati.piano_settimanale;

  // Funzione per formattare i numeri (come usato precedentemente)
  const formatNumber = (num, decimalPlaces = 1) => {
    if (typeof num === 'number') {
      if (Number.isInteger(num)) {
        return num.toString();
      }
      return num.toFixed(decimalPlaces);
    }
    return num;
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.mainTitle}>Il Tuo Piano Nutrizionale Dettagliato</h3>
      <p style={styles.mainDescription}>
        Esplora il tuo piano giornaliero, con i dettagli del fabbisogno, le ricette suggerite
        e la ripartizione dei macronutrienti per ciascun pasto.
      </p>

      {Object.entries(piano).map(([giorno, dettagli]) => (
        <GiornoDettaglio key={giorno} giorno={giorno} dettagli={dettagli} formatNumber={formatNumber} />
      ))}
    </div>
  );
}

// --- Componente separato per il dettaglio di un singolo giorno ---
function GiornoDettaglio({ giorno, dettagli, formatNumber }) {
  // Stato per gestire l'espansione/collasso degli ingredienti
  const [showIngredients, setShowIngredients] = useState({});

  const toggleIngredients = (pastoNome) => {
    setShowIngredients(prev => ({
      ...prev,
      [pastoNome]: !prev[pastoNome]
    }));
  };

  return (
    <div style={styles.giornoCard}>
      <h4 style={styles.giornoTitle}>
        {giorno.charAt(0).toUpperCase() + giorno.slice(1)}
        {/* Potresti aggiungere un'icona per espandere/collassare l'intero giorno se diventa troppo lungo */}
      </h4>
      <div style={styles.giornoSummary}>
        <p><strong>Kcal Target:</strong> {formatNumber(dettagli.kcal_target)} kcal</p>
        <p><strong>Proteine Pranzo:</strong> {formatNumber(dettagli.proteina_pranzo)} g</p>
        <p><strong>Proteine Cena:</strong> {formatNumber(dettagli.proteina_cena)} g</p>
        {dettagli.totale_kcal_target && (
          <p><strong>Totale Kcal Target:</strong> {formatNumber(dettagli.totale_kcal_target)} kcal</p>
        )}
        {dettagli.totale_kcal_ripartito && (
          <p><strong>Totale Kcal Ripartito:</strong> {formatNumber(dettagli.totale_kcal_ripartito)} kcal</p>
        )}
      </div>

      <h5 style={styles.pastiTitle}>Pasti del Giorno</h5>

      {dettagli.pasti.errore ? (
        <p style={styles.errorMessage}>Errore nella generazione dei pasti: {dettagli.pasti.errore}</p>
      ) : (
        Object.entries(dettagli.pasti).map(([pastoNome, pasto]) => (
          <div key={pastoNome} style={styles.pastoCard}>
            <div style={styles.pastoHeader}>
              <strong style={styles.pastoName}>{pastoNome.charAt(0).toUpperCase() + pastoNome.slice(1)}:</strong>{' '}
              <span style={styles.recipeName}>{pasto.ricetta || 'N/A'}</span>
            </div>

            {/* Dettagli della ricetta e bottone per espandere gli ingredienti */}
            {pasto.ricetta && (
                <div style={styles.recipeDetails}>
                    <p><strong>Kcal Ricetta:</strong> {formatNumber(pasto.kcal_ricetta)} kcal</p>
                    <p><strong>Proteine Ricetta:</strong> {formatNumber(pasto.proteine_ricetta)} g</p>
                    <p><strong>Carboidrati Ricetta:</strong> {formatNumber(pasto.carboidrati_ricetta)} g</p>
                    <p><strong>Grassi Ricetta:</strong> {formatNumber(pasto.grassi_ricetta)} g</p>
                </div>
            )}
            

            {Array.isArray(pasto.ingredienti) && pasto.ingredienti.length > 0 && (
              <button
                onClick={() => toggleIngredients(pastoNome)}
                style={styles.toggleButton}
              >
                {showIngredients[pastoNome] ? 'Nascondi Ingredienti' : 'Mostra Ingredienti'}
              </button>
            )}

            {showIngredients[pastoNome] && Array.isArray(pasto.ingredienti) && pasto.ingredienti.length > 0 && (
              <ul style={styles.ingredientsList}>
                {pasto.ingredienti.map((ingrediente, i) => (
                  <li key={i} style={styles.ingredientItem}>
                    <span style={styles.ingredientName}>{ingrediente.nome}</span> - {formatNumber(ingrediente.quantita_g)} g{' '}
                    (Kcal: {formatNumber(ingrediente.macro.kcal)}, P: {formatNumber(ingrediente.macro.proteine)} g, L: {formatNumber(ingrediente.macro.lipidi)} g, C: {formatNumber(ingrediente.macro.carboidrati)} g)
                  </li>
                ))}
              </ul>
            )}
            
            {/* Frutta e verdura specifiche del pasto */}
            {pasto.verdura && (
              <p style={styles.supplementText}><strong>Verdura:</strong> {pasto.verdura.nome} ({formatNumber(pasto.verdura.quantita)} g)</p>
            )}
            {pasto.frutta && (
              <p style={styles.supplementText}><strong>Frutta:</strong> {pasto.frutta.nome} ({formatNumber(pasto.frutta.quantita)} g)</p>
            )}

          </div>
        ))
      )}
    </div>
  );
}


// --- Stili CSS (da spostare idealmente in un file .css o gestiti con libreria UI) ---
const styles = {
  container: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '25px',
    marginTop: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  mainTitle: {
    color: '#2c3e50',
    fontSize: '2em',
    marginBottom: '15px',
    textAlign: 'center',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
  },
  mainDescription: {
    fontSize: '0.95em',
    color: '#555',
    textAlign: 'center',
    marginBottom: '30px',
    lineHeight: '1.5',
  },
  giornoCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #dcdcdc',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  giornoTitle: {
    color: '#3498db',
    fontSize: '1.6em',
    marginBottom: '15px',
    paddingBottom: '5px',
    borderBottom: '1px solid #ececec',
  },
  giornoSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#eaf7ff',
    borderRadius: '5px',
  },
  pastiTitle: {
    color: '#555',
    fontSize: '1.3em',
    marginTop: '25px',
    marginBottom: '15px',
    borderBottom: '1px dotted #ccc',
    paddingBottom: '5px',
  },
  pastoCard: {
    backgroundColor: '#fefefe',
    border: '1px solid #eee',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  },
  pastoHeader: {
    marginBottom: '10px',
    fontSize: '1.1em',
  },
  pastoName: {
    color: '#2c3e50',
    fontSize: '1.2em',
  },
  recipeName: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  recipeDetails: {
    backgroundColor: '#f0f8ff',
    borderLeft: '3px solid #6cb2eb',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    fontSize: '0.95em',
  },
  toggleButton: {
    backgroundColor: '#5bc0de',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    marginBottom: '10px',
    fontSize: '0.9em',
    transition: 'background-color 0.3s ease',
  },
  toggleButtonHover: { // Questo andrebbe gestito con CSS reale (:hover)
    backgroundColor: '#46b8da',
  },
  ingredientsList: {
    listStyleType: 'disc',
    paddingLeft: '20px',
    marginTop: '10px',
    fontSize: '0.9em',
    lineHeight: '1.6',
  },
  ingredientItem: {
    marginBottom: '5px',
    backgroundColor: '#f8f8f8',
    padding: '8px',
    borderRadius: '4px',
    borderLeft: '2px solid #aadddd',
  },
  ingredientName: {
    fontWeight: 'bold',
    color: '#333',
  },
  supplementText: {
    fontSize: '0.9em',
    fontStyle: 'italic',
    color: '#666',
    marginTop: '5px',
  },
  errorMessage: {
    color: 'red',
    backgroundColor: '#ffebee',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ef9a9a',
    marginTop: '10px',
  },
};
