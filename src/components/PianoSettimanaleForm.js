import React, { useState } from "react";

export default function PianoSettimanaleForm({ onSubmit, isLoading }) { // Aggiunto isLoading
  const [formData, setFormData] = useState({
    eta: "",
    peso: "",
    altezza: "",
    sesso: "",
    attivita: "",
    deficit_giornaliero: "",
  });

  // Stato per la gestione degli errori di validazione locali
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Rimuovi l'errore per il campo corrente non appena l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};
    // Esempio di validazione: l'età deve essere un numero positivo
    if (!formData.eta || isNaN(formData.eta) || parseInt(formData.eta) <= 0) {
      newErrors.eta = "Inserisci un'età valida (numero positivo).";
    }
    if (!formData.peso || isNaN(formData.peso) || parseFloat(formData.peso) <= 0) {
      newErrors.peso = "Inserisci un peso valido (kg).";
    }
    if (!formData.altezza || isNaN(formData.altezza) || parseInt(formData.altezza) <= 0) {
      newErrors.altezza = "Inserisci un'altezza valida (cm).";
    }
    if (!formData.sesso) {
      newErrors.sesso = "Seleziona il tuo sesso.";
    }
    // L'attività è un valore numerico da 1 a 5 nel tuo backend, assicurati che sia così anche nel frontend.
    if (!formData.attivita || isNaN(formData.attivita) || parseInt(formData.attivita) < 1 || parseInt(formData.attivita) > 5) {
      newErrors.attivita = "Inserisci un livello di attività da 1 a 5.";
    }
    if (!formData.deficit_giornaliero || isNaN(formData.deficit_giornaliero) || parseInt(formData.deficit_giornaliero) < 0) {
      newErrors.deficit_giornaliero = "Inserisci un deficit calorico valido (numero positivo o zero).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Il form è valido se non ci sono errori
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) { // Esegui la validazione prima di inviare
      onSubmit(formData);
    } else {
      console.log("Form non valido, correggi gli errori."); // Aggiungi un feedback per l'utente
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3 style={styles.formTitle}>Inserisci i Tuoi Dati</h3>
      <p style={styles.formDescription}>
        Compila i campi qui sotto per calcolare il tuo fabbisogno e generare un piano nutrizionale.
      </p>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Età */}
        <div style={styles.formGroup}>
          <label htmlFor="eta" style={styles.label}>Età:</label>
          <input
            type="number" // Usa type="number" per input numerici
            id="eta"
            name="eta"
            placeholder="La tua età in anni"
            value={formData.eta}
            onChange={handleChange}
            required
            min="1" // Età minima
            style={errors.eta ? styles.inputError : styles.input}
          />
          {errors.eta && <p style={styles.errorMessage}>{errors.eta}</p>}
        </div>

        {/* Peso */}
        <div style={styles.formGroup}>
          <label htmlFor="peso" style={styles.label}>Peso (kg):</label>
          <input
            type="number"
            id="peso"
            name="peso"
            placeholder="Il tuo peso in kg (es. 70.5)"
            value={formData.peso}
            onChange={handleChange}
            required
            min="1"
            step="0.1" // Permetti decimali per il peso
            style={errors.peso ? styles.inputError : styles.input}
          />
          {errors.peso && <p style={styles.errorMessage}>{errors.peso}</p>}
        </div>

        {/* Altezza */}
        <div style={styles.formGroup}>
          <label htmlFor="altezza" style={styles.label}>Altezza (cm):</label>
          <input
            type="number"
            id="altezza"
            name="altezza"
            placeholder="La tua altezza in cm (es. 175)"
            value={formData.altezza}
            onChange={handleChange}
            required
            min="1"
            style={errors.altezza ? styles.inputError : styles.input}
          />
          {errors.altezza && <p style={styles.errorMessage}>{errors.altezza}</p>}
        </div>

        {/* Sesso */}
        <div style={styles.formGroup}>
          <label htmlFor="sesso" style={styles.label}>Sesso:</label>
          <select
            id="sesso"
            name="sesso"
            value={formData.sesso}
            onChange={handleChange}
            required
            style={errors.sesso ? styles.inputError : styles.select}
          >
            <option value="">Seleziona</option>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
          </select>
          {errors.sesso && <p style={styles.errorMessage}>{errors.sesso}</p>}
        </div>

        {/* Attività */}
        <div style={styles.formGroup}>
          <label htmlFor="attivita" style={styles.label}>Livello di Attività Fisica (LAF):</label>
          <select
            id="attivita"
            name="attivita"
            value={formData.attivita}
            onChange={handleChange}
            required
            style={errors.attivita ? styles.inputError : styles.select}
          >
            <option value="">Seleziona il tuo livello</option>
            <option value="1">1 (Sedentario: poco o nessun esercizio)</option>
            <option value="2">2 (Leggermente attivo: esercizio leggero 1-3 gg/sett.)</option>
            <option value="3">3 (Moderatamente attivo: esercizio moderato 3-5 gg/sett.)</option>
            <option value="4">4 (Molto attivo: esercizio intenso 6-7 gg/sett.)</option>
            <option value="5">5 (Estremamente attivo: esercizio molto intenso, lavoro fisico)</option>
          </select>
          {errors.attivita && <p style={styles.errorMessage}>{errors.attivita}</p>}
        </div>

        {/* Deficit Giornaliero */}
        <div style={styles.formGroup}>
          <label htmlFor="deficit_giornaliero" style={styles.label}>Deficit Calorico Giornaliero (kcal):</label>
          <input
            type="number"
            id="deficit_giornaliero"
            name="deficit_giornaliero"
            placeholder="Es. 500 (per perdere peso) o 0 (per mantenimento)"
            value={formData.deficit_giornaliero}
            onChange={handleChange}
            required
            min="0" // Deficit non può essere negativo
            style={errors.deficit_giornaliero ? styles.inputError : styles.input}
          />
          {errors.deficit_giornaliero && <p style={styles.errorMessage}>{errors.deficit_giornaliero}</p>}
        </div>

        <button type="submit" style={styles.submitButton} disabled={isLoading}>
          {isLoading ? "Calcolo in corso..." : "Calcola Piano"}
        </button>
      </form>
    </div>
  );
}

// --- Stili CSS (da spostare in un file .css o gestiti con libreria UI) ---
const styles = {
  formContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '25px',
    marginTop: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  formTitle: {
    color: '#2c3e50',
    fontSize: '1.8em',
    marginBottom: '15px',
    textAlign: 'center',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
  },
  formDescription: {
    fontSize: '0.95em',
    color: '#555',
    textAlign: 'center',
    marginBottom: '25px',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px', // Spazio tra i gruppi di form
  },
  formGroup: {
    marginBottom: '10px',
  },
  label: {
    display: 'block', // Per far sì che l'etichetta vada su una nuova riga
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1em',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1em',
    boxSizing: 'border-box', // Include padding e bordo nella larghezza totale
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1em',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  inputError: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e74c3c', // Bordo rosso per errore
    borderRadius: '6px',
    fontSize: '1em',
    boxSizing: 'border-box',
    backgroundColor: '#fffafa', // Sfondo leggermente rossastro
  },
  errorMessage: {
    color: '#e74c3c',
    fontSize: '0.85em',
    marginTop: '5px',
    marginBottom: '0',
  },
  submitButton: {
    backgroundColor: '#28a745', // Un bel verde per il submit
    color: 'white',
    padding: '15px 25px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
  },
  submitButtonDisabled: { // Questo andrebbe gestito con CSS reale (:disabled)
    backgroundColor: '#a8d8b8',
    cursor: 'not-allowed',
  }
};