import React, { useState } from 'react';
import PianoSettimanaleForm from './components/PianoSettimanaleForm';
import RiepilogoFabbisogno from './components/RiepilogoFabbisogno';
import PianoSettimanaleOutput from './components/PianoSettimanaleOutput';

export default function App() {
  const [datiPiano, setDatiPiano] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/piano-settimanale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDatiPiano(data);
    } catch (err) {
      setError("Errore nella chiamata API: " + err.message);
      setDatiPiano(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: '800px', margin: 'auto', padding: '20px'}}>
      <h2>Calcolo Piano Settimanale</h2>
      <PianoSettimanaleForm onSubmit={handleFormSubmit} />
      {loading && <p>Caricamento...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {datiPiano && (
        <>
          <RiepilogoFabbisogno dati={datiPiano} />
          <PianoSettimanaleOutput dati={datiPiano} />
        </>
      )}
    </div>
  );
}
