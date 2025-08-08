import React, { useEffect, useState } from 'react';

/**
 * Questo componente React gestisce l'applicazione per la gestione delle ricette,
 * includendo la visualizzazione, il filtraggio, la creazione e la modifica.
 */
function App() {
  // Stato per la lista delle ricette.
  const [ricette, setRicette] = useState([]);
  
  // Stato per la gestione del caricamento della lista iniziale.
  const [loading, setLoading] = useState(true);

  // Stato per la gestione degli errori globali.
  const [error, setError] = useState(null);

  // Stato per la ricetta attualmente selezionata.
  const [selectedRicetta, setSelectedRicetta] = useState(null);

  // Stato per i dettagli (macro) della ricetta selezionata.
  const [macroData, setMacroData] = useState(null);

  // Stato per il caricamento dei dettagli.
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Stato per la lista degli alimenti disponibili dal database.
  const [alimentiDisponibili, setAlimentiDisponibili] = useState([]);
  // Stato per il caricamento degli alimenti disponibili
  const [loadingAlimenti, setLoadingAlimenti] = useState(true);


  // ---------- STATI PER IL FILTRAGGIO ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProteine, setFilterProteine] = useState(0);
  // NUOVI STATI: per i filtri dinamici di pasto e proteina
  const [filterPasto, setFilterPasto] = useState('');
  const [filterProteina, setFilterProteina] = useState('');

  // ---------- STATI PER LA GESTIONE DEL FORM ----------
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id_ricetta: null,
    nome: '',
    pasto: '',
    proteina: '',
    porzioni: 0,
    descrizione: '',
    puoi_sostituire: '',
    ingredienti: [{ alimento: '', quantita: 0 }], // Assicurati che sia 'alimento' e 'quantita'
  });
  // Nuovo stato per l'errore del form
  const [formError, setFormError] = useState(null);

  // ---------- STATI PER LA GESTIONE DELL'ELIMINAZIONE ----------
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ricettaToDelete, setRicettaToDelete] = useState(null);

  // NUOVI STATI: per le opzioni dei filtri dinamici
  const [pastiOptions, setPastiOptions] = useState([]);
  const [proteineOptions, setProteineOptions] = useState([]);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(true);

  // Elenco di categorie per il menu a tendina (re-usate dal componente Alimenti)
  const categorie = [
    "Altro", "Bevande alcoliche", "Carni fresche", "Carni trasformate e conservate",
    "Cereali e derivati", "Dolci", "Fast-food a base di carne", "Formaggi e latticini",
    "Formaggi freschi", "Frattaglie", "Frutta", "Frutta secca a guscio e semi oleaginosi",
    "Latte e yogurt", "Legumi", "Oli e grassi", "Prodotti della pesca",
    "Spezie e erbe aromatiche", "Uova", "Verdure e ortaggi"
  ];
  // ------------------------------------------------------------

  // useEffect per il recupero della lista iniziale delle ricette e per i filtri.
  useEffect(() => {
    const fetchRicette = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/api/ricette/';
        const params = new URLSearchParams();
        if (filterCategory) {
          params.append('categoria', filterCategory);
        }
        if (filterProteine > 0) {
          params.append('min_proteine', filterProteine);
        }
        // AGGIUNTO: Aggiungi i nuovi filtri per pasto e proteina
        if (filterPasto) {
          params.append('pasto', filterPasto);
        }
        if (filterProteina) {
          params.append('proteina', filterProteina);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data = await response.json();
        setRicette(data);

      } catch (err) {
        console.error("Errore nel recupero delle ricette:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    // AGGIUNTO: Aggiungi i nuovi stati di filtro alle dipendenze
    fetchRicette();
  }, [filterCategory, filterProteine, filterPasto, filterProteina]); // Dipendenze per rifare il fetch quando i filtri cambiano

  // useEffect per il recupero della lista degli alimenti disponibili.
  useEffect(() => {
    const fetchAlimenti = async () => {
      setLoadingAlimenti(true);
      try {
        const response = await fetch('/api/alimenti/');
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        const data = await response.json();
        // L'API restituisce un array di stringhe, quindi lo usiamo direttamente
        setAlimentiDisponibili(data); 
      } catch (err) {
        console.error("Errore nel recupero degli alimenti:", err);
        setError("Impossibile caricare la lista degli alimenti.");
      } finally {
        setLoadingAlimenti(false);
      }
    };
    fetchAlimenti();
  }, []); // Esegui solo al mount del componente

  // NUOVO useEffect: per recuperare le opzioni dei filtri (pasti e proteine) dal backend.
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilterOptions(true);
      try {
        const response = await fetch('/api/ricette/opzioni/filtri');
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        const data = await response.json();
        setPastiOptions(data.pasti || []);
        setProteineOptions(data.proteine || []);
      } catch (e) {
        console.error("Errore nel recupero delle opzioni dei filtri:", e);
        // Potresti voler mostrare un messaggio all'utente qui
      } finally {
        setLoadingFilterOptions(false);
      }
    };
    fetchFilterOptions();
  }, []); // Esegui solo una volta al montaggio del componente

  // Funzione per gestire la selezione di una ricetta e caricare i dettagli e i macro.
  const handleSelectRicetta = async (ricettaId) => {
    setLoadingDetails(true);
    setSelectedRicetta(null);
    setMacroData(null);
    setShowForm(false);
    setFormError(null); // Resetta l'errore del form
    
    try {
      // Chiamata all'API per i dettagli di una singola ricetta
      const detailsResponse = await fetch(`/api/ricette/${ricettaId}`);
      if (!detailsResponse.ok) {
        throw new Error(`Errore HTTP: ${detailsResponse.status}`);
      }
      const details = await detailsResponse.json();
      setSelectedRicetta(details);

      // Chiamata all'API per i macro della ricetta
      const macroResponse = await fetch(`/api/ricette/${ricettaId}/macro`);
      if (!macroResponse.ok) {
        throw new Error(`Errore HTTP: ${macroResponse.status}`);
      }
      const macros = await macroResponse.json();
      setMacroData(macros);
      
    } catch (err) {
      console.error("Errore nel recupero dei dettagli:", err);
      setError("Dati ricetta non disponibili.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Funzione per mostrare il form per la creazione di una nuova ricetta
  const handleCreateClick = () => {
    setFormData({
      id_ricetta: null,
      nome: '',
      pasto: '',
      proteina: '',
      porzioni: 0,
      descrizione: '',
      puoi_sostituire: '',  
      ingredienti: [{ alimento: '', quantita: 0 }], // Assicurati che sia 'alimento' e 'quantita'
    });
    setSelectedRicetta(null);
    setMacroData(null); // Resetta i macro quando si apre il form
    setShowForm(true);
    setFormError(null);
  };
  
  // Funzione per mostrare il form con i dati per la modifica
  const handleEditClick = () => {
    if (selectedRicetta) {
      setFormData({
        id_ricetta: selectedRicetta.ricetta_id,
        nome: selectedRicetta.ricetta_nome,
        pasto: selectedRicetta.pasto || '',
        proteina: selectedRicetta.proteina || '',
        porzioni: selectedRicetta.porzioni || 0,
        descrizione: selectedRicetta.procedimento || '',
        puoi_sostituire: selectedRicetta.puoi_sostituire || '',
        // Assicurati che gli ingredienti siano mappati nel formato corretto per il form
        ingredienti: selectedRicetta.ingredienti ? selectedRicetta.ingredienti.map(ing => ({
          alimento: ing.alimento || '', // Modificato: 'alimento'
          quantita: ing.quantita || 0, // Modificato: 'quantita'
        })) : [{ alimento: '', quantita: 0 }], // Fallback se non ci sono ingredienti, usa 'alimento' e 'quantita'
      });
      setShowForm(true);
      setFormError(null);
    }
  };

  // Funzione per gestire i cambiamenti nel form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Funzione per gestire i cambiamenti negli ingredienti del form
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredienti];
    newIngredients[index][field] = value;
    setFormData(prev => ({ ...prev, ingredienti: newIngredients }));
  };

  // Funzione per aggiungere un nuovo campo ingrediente al form
  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredienti: [...prev.ingredienti, { alimento: '', quantita: 0 }] // Assicurati che sia 'alimento' e 'quantita'
    }));
  };

  // Funzione per rimuovere un campo ingrediente
  const handleRemoveIngredient = (index) => {
    const newIngredients = formData.ingredienti.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredienti: newIngredients }));
  };

  // Funzione per gestire il salvataggio dei dati del form (creazione/modifica)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // Semplice validazione
    // Assicurati che la validazione usi 'alimento' e 'quantita'
    if (!formData.nome || !formData.pasto || !formData.proteina || formData.porzioni < 0 || formData.ingredienti.length === 0 || formData.ingredienti.some(ing => !ing.alimento || ing.quantita <= 0)) {
      setFormError("Nome, pasto, proteina, Porzioni (non negative) e almeno un ingrediente valido (con nome e quantità > 0) sono obbligatori.");
      return;
    }
    
    setLoadingDetails(true);
    const method = formData.id_ricetta ? 'PUT' : 'POST';
    const url = formData.id_ricetta ? `/api/ricette/${formData.id_ricetta}` : '/api/ricette/';
    
    const payload = {
      nome: formData.nome,
      pasto: formData.pasto,
      proteina: formData.proteina,
      porzioni: Number(formData.porzioni), // Aggiunto porzioni al payload
      procedimento: formData.descrizione,
      puoi_sostituire: formData.puoi_sostituire,
      ingredienti: formData.ingredienti
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Errore HTTP: ${response.status}`);
      }
      
      // Ricarica la lista delle ricette dopo la modifica/creazione
      const newRicetteResponse = await fetch('/api/ricette/');
      const newRicetteData = await newRicetteResponse.json();
      setRicette(newRicetteData);
      
      // Se era una modifica, aggiorna la ricetta selezionata
      if (formData.id_ricetta) {
        handleSelectRicetta(formData.id_ricetta);
      } else {
        // Se era una creazione, potremmo voler selezionare la nuova ricetta
        // ma l'API non restituisce l'ID. Resetta la selezione.
        setSelectedRicetta(null);
        setMacroData(null);
      }
      
      setShowForm(false);
      
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
      setFormError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Funzione per annullare la modifica
  const handleCancelForm = () => {
    setShowForm(false);
    setFormError(null);
    // Reset completo di formData, selectedRicetta e macroData per un stato pulito
    setFormData({
      id_ricetta: null,
      nome: '',
      pasto: '',
      proteina: '',
      porzioni: 0,
      descrizione: '',
      puoi_sostituire: '',  
      ingredienti: [{ alimento: '', quantita: 0 }], // Assicurati che sia 'alimento' e 'quantita'
    });
    setSelectedRicetta(null);
    setMacroData(null);
  };
  
  // Funzione per confermare la cancellazione
  const handleConfirmDelete = (ricettaId) => {
    setRicettaToDelete(ricettaId);
    setShowDeleteModal(true);
  };

  // Funzione per l'eliminazione della ricetta
  const handleDeleteRicetta = async () => {
    if (!ricettaToDelete) return;
    
    setLoadingDetails(true);
    setShowDeleteModal(false); // Chiudi la modale
    try {
      const response = await fetch(`/api/ricette/${ricettaToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Errore HTTP: ${response.status}`);
      }

      // Ricarica la lista delle ricette per riflettere l'eliminazione
      const newRicetteResponse = await fetch('/api/ricette/');
      const newRicetteData = await newRicetteResponse.json();
      setRicette(newRicetteData);

      // Resetta la ricetta selezionata e i dettagli dopo l'eliminazione
      setSelectedRicetta(null);
      setMacroData(null);

    } catch (err) {
      console.error("Errore nella cancellazione:", err);
      setError(err.message);
    } finally {
      setLoadingDetails(false);
      setRicettaToDelete(null);
    }
  };

  // Filtra le ricette in base al termine di ricerca
  const filteredRicette = ricette.filter(ricetta =>
    ricetta.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Messaggio di caricamento iniziale.
  // AGGIUNTO: Aggiunto loadingFilterOptions al controllo di caricamento
  if (loading || loadingAlimenti || loadingFilterOptions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700 animate-pulse">Caricamento...</p>
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
    // Modificato: h-screen e flex flex-col per un layout a tutta altezza
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans antialiased text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-10xl mx-auto flex flex-col md:flex-row">
        {/* Pannello di sinistra: Lista ricette e filtri */}
        {/* Modificato: flex flex-col per gestire lo scorrimento interno */}
        <div className="w-full md:w-1/3 border-r border-gray-200 p-6 sm:p-8 flex flex-col">
          <h1 className="text-3xl font-extrabold text-center mb-6 flex-shrink-0">
            Gestore Ricette
          </h1>
          
          {/* Barra di ricerca, filtri e pulsante Aggiungi */}
          <div className="mb-6 space-y-3 flex-shrink-0">
            
            <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Cerca ricetta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 placeholder-gray-500 text-gray-700"
                />
                <button
                  onClick={handleCreateClick}
                  className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  title="Aggiungi nuova ricetta"
                  disabled={showForm}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                
            </div>
            
            {/* Filtri */}
            <div className="flex flex-col space-y-3">
              {/* Filtro Pasto */}
              <select
                  value={filterPasto}
                  onChange={(e) => setFilterPasto(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  disabled={loadingFilterOptions}
              >
                  <option value="">Tutti i Pasti</option>
                  {loadingFilterOptions ? (
                      <option disabled>Caricamento...</option>
                  ) : (
                      pastiOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                      ))
                  )}
              </select>

              {/* Filtro Proteina */}
              <select
                  value={filterProteina}
                  onChange={(e) => setFilterProteina(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  disabled={loadingFilterOptions}
              >
                  <option value="">Tutte le Proteine</option>
                  {loadingFilterOptions ? (
                      <option disabled>Caricamento...</option>
                  ) : (
                      proteineOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                      ))
                  )}
              </select>
               
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterProteine(0);
                setFilterPasto(''); // AGGIUNTO: Reset del nuovo filtro Pasto
                setFilterProteina(''); // AGGIUNTO: Reset del nuovo filtro Proteina
              }}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-full shadow-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 mt-4"
            >
              Reset Filtri
            </button>
          </div>

          {/* Lista di ricette scorrevole */}
          {/* Modificato: flex-grow per riempire lo spazio rimanente */}
          <ul className="space-y-2 overflow-y-auto flex-grow">
            {filteredRicette.length > 0 ? (
              filteredRicette.map((ricetta) => (
                <li
                  key={ricetta.ricetta_id}
                  onClick={() => handleSelectRicetta(ricetta.ricetta_id)}
                  className={`
                    p-4 rounded-xl cursor-pointer transition-colors duration-200
                    ${selectedRicetta?.ricetta_id === ricetta.ricetta_id ? 'bg-blue-100 text-blue-700 font-semibold shadow-md' : 'bg-gray-50 hover:bg-gray-100'}
                  `}
                >
                  <span className="capitalize">{ricetta.nome}</span>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500 text-lg py-4">Nessuna ricetta trovata.</p>
            )}
          </ul>
        </div>

    
        <div className="w-full md:w-4/5 p-6 sm:p-8 flex flex-col relative">
          {showDeleteModal && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-10 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Conferma Eliminazione</h3>
                <p className="text-gray-600 mb-6">Sei sicuro di voler eliminare questa ricetta? L'azione è irreversibile.</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleDeleteRicetta}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          )}

          {showForm ? (
            // Form per aggiungere/modificare una ricetta
            // Modificato: overflow-y-auto per scorrimento del form
            <form onSubmit={handleSaveForm} className="w-full  bg-blue-50 p-8 rounded-2xl shadow-xl ">
              <h2 className="w-full text-3xl font-extrabold text-blue-600 mb-6 text-center">
                {formData.id_ricetta ? 'Modifica Ricetta' : 'Aggiungi Nuova Ricetta'}
              </h2>
              {/* Mostra l'errore del form se presente */}
              {formError && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  {formError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="pasto" className="block text-sm font-medium text-gray-700">Pasto</label>
                  <input
                    type="text"
                    id="pasto"
                    name="pasto"
                    value={formData.pasto}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="proteina" className="block text-sm font-medium text-gray-700">Proteina</label>
                  <input
                    type="text"
                    id="proteina"
                    name="proteina"
                    value={formData.proteina}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="porzioni" className="block text-sm font-medium text-gray-700">Porzioni</label>
                  <input
                    type="number"
                    id="porzioni"
                    name="porzioni"
                    value={formData.porzioni}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                  <textarea
                    id="descrizione"
                    name="descrizione"
                    value={formData.descrizione}
                    onChange={handleFormChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="puoi_sostituire" className="block text-sm font-medium text-gray-700">Puoi Sostituire</label>
                  <textarea
                    id="puoi_sostituire"
                    name="puoi_sostituire"
                    value={formData.puoi_sostituire}
                    onChange={handleFormChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>
                {/* Gestione dinamica degli ingredienti */}
                <h3 className="text-xl font-semibold mt-4">Ingredienti</h3>
                {formData.ingredienti.map((ingrediente, index) => (
                  <div key={index} className="flex space-x-2 items-center">
                    <select
                      value={ingrediente.alimento}
                      onChange={(e) => handleIngredientChange(index, 'alimento', e.target.value)}
                      className="flex-grow rounded-md min-w-0 border-gray-300 shadow-sm"
                      required
                    >
                      <option value="">Seleziona un alimento...</option>
                      {alimentiDisponibili.map((alimento, i) => (
                        <option key={i} value={alimento}>{alimento}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Quantità (g)"
                      value={ingrediente.quantita}
                      onChange={(e) => handleIngredientChange(index, 'quantita', Number(e.target.value))}
                      className="w-24 rounded-md border-gray-300 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Aggiungi Ingrediente
                </button>
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
            // Dettagli della ricetta
            selectedRicetta ? (
              loadingDetails ? (
                <p className="text-xl font-semibold text-gray-700 animate-pulse">Caricamento dettagli...</p>
              ) : selectedRicetta && !error ? (
                // Modificato: overflow-y-auto per scorrimento dei dettagli
                <div className="w-full ">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-blue-600 capitalize">
                      {selectedRicetta.ricetta_nome}
                    </h2>
                    <div className="flex space-x-2">
                        <button
                          onClick={handleEditClick}
                          className="p-2 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                          title="Modifica ricetta"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l-1.414 1.414M15.232 5.232l-1.414 1.414M15.232 5.232L9.172 11.292a4 4 0 00-1.29 2.01l-1.127 5.635A2 2 0 005.817 20.37l5.635-1.127a4 4 0 002.01-1.29l6.06-6.06a2 2 0 000-2.828L18.06 5.232a2 2 0 00-2.828 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(selectedRicetta.ricetta_id)}
                          className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                          title="Elimina ricetta"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-6 rounded-2xl shadow-inner">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Dettagli</h3>
                      <ul className="text-lg space-y-2">
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Numero porzioni:</span>
                          <span className="font-bold text-blue-700">{selectedRicetta.porzioni || "N/A"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Pasto:</span>
                          <span className="font-bold text-blue-700">{selectedRicetta.pasto || "N/A"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Proteina:</span>
                          <span className="font-bold text-blue-700">{selectedRicetta.proteina || "N/A"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Porzioni:</span>
                          <span className="font-bold text-blue-700">{selectedRicetta.porzioni || 0} g</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Descrizione:</span>
                          <span className="font-bold text-blue-700">{selectedRicetta.procedimento || "N/A"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium text-gray-600">Puoi Sostituire:</span>
                          <span className="font-bold text-blue-700">{selectedRicetta.puoi_sostituire || "N/A"}</span>
                        </li>
                      </ul>

                      <h3 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Ingredienti</h3>
                      {selectedRicetta.ingredienti && selectedRicetta.ingredienti.length > 0 ? (
                        <ul className="text-lg space-y-2">
                          {selectedRicetta.ingredienti.map((ing, index) => (
                            <li key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                              <span className="font-medium text-gray-600">{ing.alimento}:</span>
                              <span className="font-bold text-blue-700">{ing.quantita} g</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-gray-500">Nessun ingrediente specificato.</p>
                      )}
                      
                      <h3 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Macronutrienti totali</h3>
                      {macroData ? (
                        <ul className="text-lg space-y-2">
                          <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="font-medium text-gray-600">Calorie totali:</span>
                            <span className="font-bold text-blue-700">{macroData.kcal || 0} kcal</span>
                          </li>
                          <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="font-medium text-gray-600">Carboidrati totali:</span>
                            <span className="font-bold text-blue-700">{macroData.carboidrati || 0} g</span>
                          </li>
                          <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="font-medium text-gray-600">Proteine totali:</span>
                            <span className="font-bold text-blue-700">{macroData.proteine || 0} g</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">Grassi totali:</span>
                            <span className="font-bold text-blue-700">{macroData.lipidi || 0} g</span>
                          </li>
                        </ul>
                      ) : (
                        <p className="text-center text-gray-500">Dati macro non disponibili.</p>
                      )}
                      
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xl font-medium text-gray-500 text-center">
                  {error || "Dettagli ricetta non disponibili."}
                </p>
              )
            ) : (
              <p className="text-xl font-medium text-gray-500 text-center">
                Seleziona una ricetta dalla lista, o aggiungine una nuova per iniziare.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
