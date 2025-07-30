import React, { useState } from 'react';
import PianoSettimanaleForm from './components/PianoSettimanaleForm';
import RiepilogoFabbisogno from './components/RiepilogoFabbisogno';
import PianoSettimanaleOutput from './components/PianoSettimanaleOutput';

export default function App() {
  // Stato per i dati del piano nutrizionale
  const [datiPiano, setDatiPiano] = useState(null);
  // Stato per indicare se una richiesta è in corso
  const [loading, setLoading] = useState(false);
  // Stato per gestire eventuali errori della chiamata API
  const [error, setError] = useState(null);

  /**
   * Gestisce l'invio del form, effettuando la chiamata API al backend.
   * @param {Object} formData - I dati inseriti dall'utente nel form.
   */
  const handleFormSubmit = async (formData) => {
    setLoading(true); // Imposta lo stato di caricamento a true
    setError(null);   // Resetta eventuali errori precedenti

    try {
      const response = await fetch('http://127.0.0.1:8000/piano-settimanale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Controlla se la risposta HTTP non è OK (es. status 4xx o 5xx)
      if (!response.ok) {
        let errorMessage = `Errore HTTP: ${response.status} - ${response.statusText}`;
        try {
          // Tenta di leggere un messaggio di errore più specifico dal corpo della risposta JSON
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail; // Usa il dettaglio fornito dal backend
          } else if (errorData.message) {
            errorMessage = errorData.message; // Alternativa comune per messaggi di errore
          }
        } catch (jsonError) {
          // Se non è possibile parsare il JSON, usa il messaggio HTTP generico
          console.error("Errore nel parsing del JSON di errore:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json(); // Parsa la risposta JSON
      setDatiPiano(data); // Aggiorna lo stato con i dati del piano
    } catch (err) {
      // Cattura errori di rete o errori generati dalla risposta non-OK
      setError("Si è verificato un problema durante la generazione del piano: " + err.message);
      setDatiPiano(null); // Resetta i dati del piano in caso di errore
    } finally {
      setLoading(false); // Imposta lo stato di caricamento a false, indipendentemente dal successo/fallimento
    }
  };

  return (
    <div style={styles.appContainer}>
      <h2 style={styles.mainTitle}>Calcolo Piano Nutrizionale Settimanale</h2>
      
      {/* Passa la prop isLoading al form per disabilitarlo durante il caricamento */}
      <PianoSettimanaleForm onSubmit={handleFormSubmit} isLoading={loading} />

      {/* Sezione per il feedback di caricamento */}
      {loading && (
        <div style={styles.loadingMessage}>
          <p>Caricamento dei dati in corso... attendere prego.</p>
          {/* Spinner CSS per feedback visivo */}
          <div style={styles.spinner}></div>
          {/* Stili per l'animazione dello spinner */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Sezione per il feedback di errore */}
      {error && (
        <div style={styles.errorMessage}>
          <p style={{ fontWeight: 'bold' }}>Ops! Qualcosa è andato storto:</p>
          <p>{error}</p>
          <p>Per favore, riprova più tardi o controlla la tua connessione.</p>
        </div>
      )}

      {/* Mostra i componenti di output solo se ci sono dati e non ci sono errori o caricamenti in corso */}
      {datiPiano && !loading && !error && (
        <>
          <RiepilogoFabbisogno dati={datiPiano} />
          <PianoSettimanaleOutput dati={datiPiano} />
        </>
      )}

      {/* Messaggio iniziale per guidare l'utente se nessun dato è presente */}
      {!datiPiano && !loading && !error && (
        <div style={styles.initialMessage}>
          <p>Compila il modulo qui sopra per calcolare il tuo piano nutrizionale settimanale personalizzato.</p>
          <p>Ti verranno forniti il fabbisogno calorico e un esempio di piano per la settimana.</p>
        </div>
      )}
    </div>
  );
}

// Stili CSS (ideale da spostare in un file CSS separato o usare una libreria UI)
const styles = {
  appContainer: {
    maxWidth: '900px', // Aumentato leggermente per più spazio
    margin: 'auto',
    padding: '25px',
    fontFamily: 'Inter, Arial, sans-serif', // Utilizzo di Inter come font predefinito
    backgroundColor: '#f5f7fa', // Sfondo leggermente colorato per il contenitore principale
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  },
  mainTitle: {
    textAlign: 'center',
    color: '#2c3e50',
    fontSize: '2.2em',
    marginBottom: '30px',
    borderBottom: '3px solid #3498db',
    paddingBottom: '15px',
  },
  loadingMessage: {
    textAlign: 'center',
    marginTop: '25px',
    padding: '20px',
    background: '#e0f7fa',
    border: '1px solid #b2ebf2',
    borderRadius: '8px',
    color: '#00796b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, .1)',
    borderLeftColor: '#007bff',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    animation: 'spin 1s linear infinite',
    margin: '15px auto',
  },
  errorMessage: {
    textAlign: 'center',
    marginTop: '25px',
    padding: '20px',
    background: '#ffebee',
    border: '1px solid #ef9a9a',
    borderRadius: '8px',
    color: '#c62828',
  },
  initialMessage: {
    textAlign: 'center',
    marginTop: '40px',
    padding: '25px',
    background: '#e8f5e9', // Sfondo verde chiaro per un messaggio positivo
    border: '1px dashed #a5d6a7',
    borderRadius: '10px',
    color: '#388e3c', // Testo verde scuro
    fontSize: '1.1em',
    lineHeight: '1.6',
  }
};
