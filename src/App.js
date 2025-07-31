import React, { useState } from 'react';
import PianoSettimanaleForm from './components/PianoSettimanaleForm.js';
import RiepilogoFabbisogno from './components/RiepilogoFabbisogno.js';
import PianoSettimanaleOutput from './components/PianoSettimanaleOutput.js';
import AddFoodForm from './components/AddFoodForm.js';
import AddRecipeForm from './components/AddRecipeForm.js';
import EditFoodForm from './components/EditFoodForm.js';
import EditRecipeForm from './components/EditRecipeForm.js';

export default function App() {
  // Stato per i dati del piano nutrizionale
  const [datiPiano, setDatiPiano] = useState(null);
  // Stato per indicare se una richiesta è in corso (per il piano settimanale)
  const [loading, setLoading] = useState(false);
  // Stato per gestire eventuali errori della chiamata API (per il piano settimanale)
  const [error, setError] = useState(null);

  // Nuovo stato per gestire il tab attivo
  const [activeTab, setActiveTab] = useState('piano'); // 'piano', 'aggiungi', 'modifica'

  /**
   * Gestisce l'invio del form del piano settimanale, effettuando la chiamata API al backend.
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

      if (!response.ok) {
        let errorMessage = `Errore HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          console.error("Errore nel parsing del JSON di errore:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setDatiPiano(data);
    } catch (err) {
      setError("Si è verificato un problema durante la generazione del piano: " + err.message);
      setDatiPiano(null);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per determinare le classi Tailwind per i tab
  const getTabClasses = (tabName) => {
    const baseClasses = "py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors duration-300";
    const activeClasses = "bg-blue-600 text-white shadow-lg";
    const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";
    return `${baseClasses} ${activeTab === tabName ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans bg-gray-50 rounded-xl shadow-2xl my-10">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 pb-4 border-b-4 border-blue-600">
        Gestione Nutrizionale App
      </h1>

      {/* Controlli dei Tab */}
      <div className="flex justify-center mb-8 space-x-4">
        <button
          className={getTabClasses('piano')}
          onClick={() => setActiveTab('piano')}
        >
          Piano Nutrizionale
        </button>
        <button
          className={getTabClasses('aggiungi')}
          onClick={() => setActiveTab('aggiungi')}
        >
          Aggiungi Dati
        </button>
        <button
          className={getTabClasses('modifica')}
          onClick={() => setActiveTab('modifica')}
        >
          Modifica Dati
        </button>
      </div>

      {/* Contenuto dei Tab */}
      <div className="p-8 bg-white rounded-lg shadow-lg">
        {activeTab === 'piano' && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 pb-4 border-b-2 border-blue-400">
              Calcolo Piano Nutrizionale Settimanale
            </h2>
            <PianoSettimanaleForm onSubmit={handleFormSubmit} isLoading={loading} />

            {loading && (
              <div className="text-center mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex flex-col items-center justify-center">
                <p>Caricamento dei dati in corso... attendere prego.</p>
                <div className="border-4 border-gray-200 border-l-blue-500 rounded-full w-8 h-8 animate-spin mt-4"></div>
              </div>
            )}

            {error && (
              <div className="text-center mt-6 p-5 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-bold">Ops! Qualcosa è andato storto:</p>
                <p>{error}</p>
                <p>Per favore, riprova più tardi o controlla la tua connessione.</p>
              </div>
            )}

            {datiPiano && !loading && !error && (
              <>
                <RiepilogoFabbisogno dati={datiPiano} />
                <PianoSettimanaleOutput dati={datiPiano} />
              </>
            )}

            {!datiPiano && !loading && !error && (
              <div className="text-center mt-10 p-6 bg-green-50 border border-dashed border-green-300 rounded-xl text-green-700 text-lg leading-relaxed">
                <p>Compila il modulo qui sopra per calcolare il tuo piano nutrizionale settimanale personalizzato.</p>
                <p>Ti verranno forniti il fabbisogno calorico e un esempio di piano per la settimana.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'aggiungi' && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 pb-4 border-b-2 border-blue-400">
              Aggiungi Nuovi Dati
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AddFoodForm />
              <AddRecipeForm />
            </div>
          </>
        )}

        {activeTab === 'modifica' && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 pb-4 border-b-2 border-blue-400">
              Modifica Dati Esistenti
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EditFoodForm />
              <EditRecipeForm />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
