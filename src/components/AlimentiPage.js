import React, { useEffect, useState } from 'react';

/**
 * Questo componente React gestisce il recupero e la visualizzazione di un elenco di alimenti
 * con la possibilità di vedere i dettagli (macro) di ogni singolo alimento.
 */
function App() {
  // Stato per la lista degli alimenti.
  const [alimenti, setAlimenti] = useState([]);
  
  // Stato per la gestione del caricamento della lista iniziale.
  const [loading, setLoading] = useState(true);

  // Stato per la gestione degli errori globali.
  const [error, setError] = useState(null);

  // Stato per l'alimento attualmente selezionato.
  const [selectedAlimento, setSelectedAlimento] = useState(null);

  // Stato per i dettagli (macro) dell'alimento selezionato.
  const [macroData, setMacroData] = useState(null);

  // Stato per il caricamento dei dettagli.
  const [loadingMacro, setLoadingMacro] = useState(false);

  // Stato per l'input di ricerca.
  const [searchTerm, setSearchTerm] = useState('');

  // ---------- STATI PER LA GESTIONE DEL FORM ----------
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    alimento_id: null,
    nome_alimento: '',
    categoria: '',
    kcal: 0,
    carboidrati: 0,
    proteine: 0,
    lipidi: 0,
    fibra: 0
  });
  // Nuovo stato per l'errore del form
  const [formError, setFormError] = useState(null);

  // Elenco di categorie per il menu a tendina
  const categorie = [
    "Altro",
    "Bevande alcoliche",
    "Carni fresche",
    "Carni trasformate e conservate",
    "Cereali e derivati",
    "Dolci",
    "Fast-food a base di carne",
    "Formaggi e latticini",
    "Formaggi freschi",
    "Frattaglie",
    "Frutta",
    "Frutta secca a guscio e semi oleaginosi",
    "Latte e yogurt",
    "Legumi",
    "Oli e grassi",
    "Prodotti della pesca",
    "Spezie e erbe aromatiche",
    "Spezie e Spezie e erbe aromatiche",
    "Uova",
    "Verdure e ortaggi"
  ];
  // ------------------------------------------------------------


  // useEffect per il recupero della lista iniziale degli alimenti.
  useEffect(() => {
    const fetchAlimenti = async () => {
      try {
        // Chiamata all'API per la lista di tutti gli alimenti.
        const response = await fetch('/api/alimenti');

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data = await response.json();
        setAlimenti(data);

      } catch (err) {
        console.error("Errore nel recupero degli alimenti:", err);
        setError(err.message);

      } finally {
        setLoading(false);
      }
    };
    fetchAlimenti();
  }, []);

  // Funzione per gestire la selezione di un alimento.
  const handleSelectAlimento = async (alimento) => {
    setSelectedAlimento(alimento);
    setMacroData(null); // Resetta i dati macro per mostrare il caricamento.
    setShowForm(false); // Nasconde il form quando si seleziona un nuovo alimento.
    setLoadingMacro(true);

    try {
      // Chiamata all'API per i dettagli di un singolo alimento.
      const response = await fetch(`/api/alimenti/${alimento}`);
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const data = await response.json();
      setMacroData(data); // Aggiorna lo stato con i dati macro.

    } catch (err) {
      console.error("Errore nel recupero dei dettagli:", err);
      setMacroData({ error: "Dati non disponibili." });

    } finally {
      setLoadingMacro(false);
    }
  };

  // ---------- FUNZIONI PER LA GESTIONE DEL FORM ----------

  // Funzione per mostrare il form con i dati per la modifica
  const handleEditClick = () => {
    if (macroData) {
      setFormData({
        alimento_id: macroData.alimento_id,
        nome_alimento: macroData.nome_alimento,
        categoria: macroData.categoria || '',
        kcal: macroData.kcal || 0,
        carboidrati: macroData.carboidrati || 0,
        proteine: macroData.proteine || 0,
        lipidi: macroData.lipidi || 0,
        fibra: macroData.fibra || 0
      });
      setShowForm(true);
      setFormError(null); // Resetta l'errore del form
    }
  };

  // Funzione per mostrare il form per la creazione di un nuovo alimento
  const handleCreateClick = () => {
    setFormData({
      alimento_id: null,
      nome_alimento: '',
      categoria: 'Altro', // Valore predefinito per la categoria
      kcal: 0,
      carboidrati: 0,
      proteine: 0,
      lipidi: 0,
      fibra: 0
    });
    setSelectedAlimento(null);
    setMacroData(null);
    setShowForm(true);
    setFormError(null); // Resetta l'errore del form
  };

  // Funzione per gestire il salvataggio dei dati del form
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setFormError(null); // Resetta l'errore prima di un nuovo invio

    // Validazione dei dati
    if (!formData.nome_alimento.trim() || !formData.categoria.trim()) {
      setFormError("Nome e categoria sono campi obbligatori.");
      return;
    }
    if (formData.kcal < 0 || formData.carboidrati < 0 || formData.proteine < 0 || formData.lipidi < 0 || formData.fibra < 0) {
      setFormError("I valori numerici non possono essere negativi.");
      return;
    }
    
    setLoadingMacro(true);
    const method = formData.alimento_id ? 'PATCH' : 'POST';
    const url = formData.alimento_id ? `/api/alimenti/${formData.alimento_id}` : '/api/alimenti/';

    // Costruisce il payload esattamente come richiesto dall'API
    const payload = {
      nome_alimento: formData.nome_alimento,
      categoria: formData.categoria,
      kcal: formData.kcal,
      proteine: formData.proteine,
      lipidi: formData.lipidi,
      carboidrati: formData.carboidrati,
      fibra: formData.fibra
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Tenta di leggere l'errore specifico dal backend
        const errorData = await response.json();
        throw new Error(errorData.detail || `Errore HTTP: ${response.status}`);
      }
      
      // Ricarica la lista degli alimenti dopo la modifica/creazione
      const newAlimentiResponse = await fetch('/api/alimenti');
      const newAlimentiData = await newAlimentiResponse.json();
      setAlimenti(newAlimentiData);

      // Se era un nuovo alimento, selezionalo per mostrare i dettagli
      if (!formData.alimento_id) {
        handleSelectAlimento(formData.nome_alimento);
      }

      setShowForm(false);
      
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
      setFormError(err.message); // Imposta l'errore per la visualizzazione
    } finally {
      setLoadingMacro(false);
    }
  };

  // Funzione per annullare la modifica
  const handleCancelForm = () => {
    setShowForm(false);
    setFormError(null);
  };
  // ------------------------------------------------------------


  // Filtra gli alimenti in base al termine di ricerca.
  const filteredAlimenti = alimenti.filter(alimento =>
    alimento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Messaggio di caricamento iniziale.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700 animate-pulse">Caricamento alimenti...</p>
      </div>
    );
  }

  // Messaggio di errore globale.
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md max-w-md text-center">
          <strong className="font-bold">Errore!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // Layout principale dell'applicazione.
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans antialiased text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl mx-auto flex flex-col md:flex-row">

        {/* Pannello di sinistra: Lista alimenti */}
        <div className="w-full md:w-1/3 border-r border-gray-200 p-6 sm:p-8">
          <h1 className="text-3xl font-extrabold text-center mb-6">
            Catalogo Nutrizionale
          </h1>
          
          {/* Barra di ricerca e pulsante Aggiungi */}
          <div className="mb-6 flex space-x-2">
            <input
              type="text"
              placeholder="Cerca un alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 placeholder-gray-500 text-gray-700"
            />
            <button
              onClick={handleCreateClick}
              className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              title="Aggiungi nuovo alimento"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* Lista di alimenti scorrevole */}
          <ul className="space-y-2 overflow-y-auto max-h-[70vh]">
            {filteredAlimenti.length > 0 ? (
              filteredAlimenti.map((alimento, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectAlimento(alimento)}
                  className={`
                    p-4 rounded-xl cursor-pointer transition-colors duration-200
                    ${selectedAlimento === alimento ? 'bg-blue-100 text-blue-700 font-semibold shadow-md' : 'bg-gray-50 hover:bg-gray-100'}
                  `}
                >
                  <span className="capitalize">{alimento}</span>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500 text-lg py-4">Nessun alimento trovato.</p>
            )}
          </ul>
        </div>

        {/* Pannello di destra: Dettagli alimento / Form di modifica */}
        <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col items-center justify-center">
          {showForm ? (
            // Form per aggiungere/modificare un alimento
            <form onSubmit={handleSaveForm} className="w-full max-w-xl bg-blue-50 p-8 rounded-2xl shadow-xl">
              <h2 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">
                {formData.alimento_id ? 'Modifica Alimento' : 'Aggiungi Nuovo Alimento'}
              </h2>
              {/* Mostra l'errore del form se presente */}
              {formError && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  {formError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome_alimento" className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    id="nome_alimento"
                    value={formData.nome_alimento}
                    onChange={(e) => setFormData({ ...formData, nome_alimento: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {/* Opzione vuota predefinita */}
                    <option value="" disabled>Seleziona una categoria...</option>
                    {/* Genera le opzioni dal tuo array */}
                    {categorie.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="kcal" className="block text-sm font-medium text-gray-700">Calorie (kcal)</label>
                  <input
                    type="number"
                    id="kcal"
                    value={formData.kcal}
                    onChange={(e) => setFormData({ ...formData, kcal: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="carboidrati" className="block text-sm font-medium text-gray-700">Carboidrati (g)</label>
                  <input
                    type="number"
                    id="carboidrati"
                    value={formData.carboidrati}
                    onChange={(e) => setFormData({ ...formData, carboidrati: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="proteine" className="block text-sm font-medium text-gray-700">Proteine (g)</label>
                  <input
                    type="number"
                    id="proteine"
                    value={formData.proteine}
                    onChange={(e) => setFormData({ ...formData, proteine: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lipidi" className="block text-sm font-medium text-gray-700">Grassi (g)</label>
                  <input
                    type="number"
                    id="lipidi"
                    value={formData.lipidi}
                    onChange={(e) => setFormData({ ...formData, lipidi: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="fibra" className="block text-sm font-medium text-gray-700">Fibra (g)</label>
                  <input
                    type="number"
                    id="fibra"
                    value={formData.fibra}
                    onChange={(e) => setFormData({ ...formData, fibra: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Salva
                </button>
              </div>
            </form>
          ) : (
            // Dettagli dell'alimento
            selectedAlimento ? (
              loadingMacro ? (
                <p className="text-xl font-semibold text-gray-700 animate-pulse">Caricamento dettagli...</p>
              ) : macroData && !macroData.error ? (
                <div className="w-full max-w-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-blue-600 capitalize">
                      {macroData.nome_alimento.replace(/, Crudo/i, '').split(',').map(part => part.trim()).join(', ')}
                    </h2>
                    <button
                      onClick={handleEditClick}
                      className="p-2 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                      title="Modifica alimento"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l-1.414 1.414M15.232 5.232l-1.414 1.414M15.232 5.232L9.172 11.292a4 4 0 00-1.29 2.01l-1.127 5.635A2 2 0 005.817 20.37l5.635-1.127a4 4 0 002.01-1.29l6.06-6.06a2 2 0 000-2.828L18.06 5.232a2 2 0 00-2.828 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-6 rounded-2xl shadow-inner">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Macronutrienti</h3>
                      <ul className="text-lg space-y-2">
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Calorie per 100g:</span>
                          <span className="font-bold text-blue-700">{macroData.kcal} kcal</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Categoria:</span>
                          <span className="font-bold text-blue-700">{macroData.categoria}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Carboidrati:</span>
                          <span className="font-bold text-blue-700">{macroData.carboidrati} g</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Proteine:</span>
                          <span className="font-bold text-blue-700">{macroData.proteine} g</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="font-medium text-gray-600">Grassi:</span>
                          <span className="font-bold text-blue-700">{macroData.lipidi} g</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="font-medium text-gray-600">Fibra:</span>
                          <span className="font-bold text-blue-700">{macroData.fibra} g</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xl font-medium text-gray-500 text-center">
                  {macroData?.error || "Dati non disponibili per questo alimento."}
                </p>
              )
            ) : (
              <p className="text-xl font-medium text-gray-500 text-center">
                Seleziona un alimento dalla lista o aggiungine uno nuovo.
              </p>
            )
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
