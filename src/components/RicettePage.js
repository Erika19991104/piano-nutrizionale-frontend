import React, { useEffect, useState } from 'react';

// The main application component for the recipe book.
// It manages all state, data fetching, and UI logic.
function App() {
  // State variables for managing data and UI states
  const [ricette, setRicette] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRicetta, setSelectedRicetta] = useState(null);
  const [macroData, setMacroData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // New state variables for managing ingredients and their mapping
  const [alimentiList, setAlimentiList] = useState([]); // List of ingredient objects
  const [alimentiIdToNameMap, setAlimentiIdToNameMap] = useState({}); // Map: id -> name
  const [loadingAlimenti, setLoadingAlimenti] = useState(true);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPasto, setFilterPasto] = useState('');
  const [filterProteina, setFilterProteina] = useState('');
  const [pastiOptions, setPastiOptions] = useState([]);
  const [proteineOptions, setProteineOptions] = useState([]);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(true);
  
  // Form and modal state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id_ricetta: null,
    nome: '',
    pasto: '',
    proteina: '',
    porzioni: 0,
    descrizione: '',
    puoi_sostituire: '',
    ingredienti: [{ id_alimento: '', quantita_g: 0 }],
  });
  const [formError, setFormError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ricettaToDelete, setRicettaToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Base URL for the API
  const API_BASE_URL = 'http://localhost:8000';

  // EFFECT: Fetch the initial list of recipes with filters.
  useEffect(() => {
    const fetchRicette = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE_URL}/api/ricette/filter`;
        const params = new URLSearchParams();
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
    fetchRicette();
  }, [filterPasto, filterProteina]);

  // EFFECT: Fetch the list of ingredients and create the necessary maps.
  useEffect(() => {
    const fetchAlimenti = async () => {
      setLoadingAlimenti(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/alimenti/`);
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        const data = await response.json();
        setAlimentiList(data);

        // Create ID -> name map
        const idToNameMap = data.reduce((acc, alimento) => {
          acc[alimento.id_alimento] = alimento.nome_alimento;
          return acc;
        }, {});
        setAlimentiIdToNameMap(idToNameMap);

      } catch (err) {
        console.error("Errore nel recupero degli alimenti:", err);
        setError("Impossibile caricare la lista degli alimenti.");
      } finally {
        setLoadingAlimenti(false);
      }
    };
    fetchAlimenti();
  }, []);

  // EFFECT: Fetch filter options (meals and proteins) from the backend.
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilterOptions(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/ricette/opzioni/filtri`);
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        const data = await response.json();
        setPastiOptions(data.pasto || []);
        setProteineOptions(data.proteina || []);
      } catch (e) {
        console.error("Errore nel recupero delle opzioni dei filtri:", e);
      } finally {
        setLoadingFilterOptions(false);
      }
    };
    fetchFilterOptions();
  }, []);

  // Handler for selecting a recipe from the list.
  const handleSelectRicetta = async (ricettaId) => {
    setLoadingDetails(true);
    setSelectedRicetta(null);
    setMacroData(null);
    setShowForm(false);
    setFormError(null);
    setError(null);

    try {
      const detailsResponse = await fetch(`${API_BASE_URL}/api/ricette/${ricettaId}`);
      if (!detailsResponse.ok) {
        throw new Error(`Errore HTTP: ${detailsResponse.status}`);
      }
      const details = await detailsResponse.json();

      const enrichedIngredients = details.ingredienti.map(ing => ({
        ...ing,
        nome_alimento: alimentiIdToNameMap[ing.id_alimento] || 'Nome non disponibile'
      }));

      setSelectedRicetta({ ...details, ingredienti: enrichedIngredients });

      const macroResponse = await fetch(`${API_BASE_URL}/api/ricette/${ricettaId}/macro`);
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

  // Resets the form state and shows the new recipe form.
  const handleCreateClick = () => {
    setFormData({
      id_ricetta: null,
      nome: '',
      pasto: '',
      proteina: '',
      porzioni: 0,
      descrizione: '',
      puoi_sostituire: '',
      ingredienti: [{ id_alimento: '', quantita_g: 0 }],
    });
    setSelectedRicetta(null);
    setMacroData(null);
    setShowForm(true);
    setFormError(null);
    setShowSuccessMessage(false);
  };

  // Populates the form with the selected recipe's data for editing.
  const handleEditClick = () => {
    if (selectedRicetta) {
      setFormData({
        id_ricetta: selectedRicetta.ricetta_id,
        nome: selectedRicetta.nome,
        pasto: selectedRicetta.pasto || '',
        proteina: selectedRicetta.proteina || '',
        porzioni: selectedRicetta.porzioni || 0,
        descrizione: selectedRicetta.procedimento || '',
        puoi_sostituire: selectedRicetta.puoi_sostituire || '',
        ingredienti: selectedRicetta.ingredienti ? selectedRicetta.ingredienti.map(ing => ({
          id_alimento: ing.id_alimento || '',
          quantita_g: ing.quantita_g || 0,
        })) : [{ id_alimento: '', quantita_g: 0 }],
      });
      setShowForm(true);
      setFormError(null);
      setShowSuccessMessage(false);
    }
  };

  // Handles changes for simple form fields (nome, pasto, proteina, etc.).
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handles changes for ingredient fields (id_alimento, quantita_g).
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredienti];
    newIngredients[index][field] = value;
    setFormData(prev => ({ ...prev, ingredienti: newIngredients }));
  };

  // Adds a new empty ingredient row to the form.
  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredienti: [...prev.ingredienti, { id_alimento: '', quantita_g: 0 }]
    }));
  };

  // Removes an ingredient row from the form.
  const handleRemoveIngredient = (index) => {
    const newIngredients = formData.ingredienti.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredienti: newIngredients }));
  };

  // Handles form submission (create or update recipe).
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate required fields
    if (!formData.nome || !formData.pasto || !formData.proteina || formData.porzioni < 0 || formData.ingredienti.length === 0 || formData.ingredienti.some(ing => !ing.id_alimento || ing.quantita_g <= 0)) {
      setFormError("Nome, pasto, proteina, numero di porzioni (non negativo) e almeno un ingrediente valido (con nome e quantità maggiore di 0) sono campi obbligatori.");
      return;
    }

    setLoadingDetails(true);
    const method = formData.id_ricetta ? 'PUT' : 'POST';
    const url = formData.id_ricetta ? `${API_BASE_URL}/api/ricette/${formData.id_ricetta}` : `${API_BASE_URL}/api/ricette/`;

    // The payload is built directly from formData.
    const payload = {
      nome: formData.nome,
      pasto: formData.pasto,
      proteina: formData.proteina,
      porzioni: Number(formData.porzioni),
      procedimento: formData.descrizione,
      puoi_sostituire: formData.puoi_sostituire,
      ingredienti: formData.ingredienti 
    };
    console.log("Payload inviato:", payload);

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

      // Re-fetch the list of recipes to show the updated data
      const newRicetteResponse = await fetch(`${API_BASE_URL}/api/ricette/`);
      const newRicetteData = await newRicetteResponse.json();
      setRicette(newRicetteData);

      setShowForm(false);
      if (formData.id_ricetta) {
        // If editing, re-select the recipe to show updated details
        handleSelectRicetta(formData.id_ricetta);
      } else {
        // If creating, clear the details view
        setSelectedRicetta(null);
        setMacroData(null);
      }
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (err) {
      console.error("Errore nel salvataggio:", err);
      setFormError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Cancels the form, hides it, and resets state.
  const handleCancelForm = () => {
    setShowForm(false);
    setFormError(null);
    setFormData({
      id_ricetta: null,
      nome: '',
      pasto: '',
      proteina: '',
      porzioni: 0,
      descrizione: '',
      puoi_sostituire: '',
      ingredienti: [{ id_alimento: '', quantita_g: 0 }],
    });
    setSelectedRicetta(null);
    setMacroData(null);
  };

  // Opens the delete confirmation modal.
  const handleConfirmDelete = (ricettaId) => {
    setRicettaToDelete(ricettaId);
    setShowDeleteModal(true);
  };

  // Handles the actual deletion of a recipe.
  const handleDeleteRicetta = async () => {
    if (!ricettaToDelete) return;

    setLoadingDetails(true);
    setShowDeleteModal(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ricette/${ricettaToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Errore HTTP: ${response.status}`);
      }

      const newRicetteResponse = await fetch(`${API_BASE_URL}/api/ricette/`);
      const newRicetteData = await newRicetteResponse.json();
      setRicette(newRicetteData);

      setSelectedRicetta(null);
      setMacroData(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (err) {
      console.error("Errore nella cancellazione:", err);
      setError(err.message);
    } finally {
      setLoadingDetails(false);
      setRicettaToDelete(null);
    }
  };

  // Filters the recipes based on the search term.
  const filteredRicette = ricette.filter(ricetta =>
    ricetta.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // UI for initial loading states
  if (loading || loadingAlimenti || loadingFilterOptions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700 animate-pulse">Caricamento...</p>
      </div>
    );
  }

  // UI for error state
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

  // Main application UI
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans antialiased text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-10xl mx-auto flex flex-col md:flex-row">
        {/* Left Panel: Recipe List and Filters */}
        <div className="w-full md:w-1/3 border-r border-gray-200 p-6 sm:p-8 flex flex-col">
          <h1 className="text-3xl font-extrabold text-center mb-6 flex-shrink-0">
            Il tuo ricettario
          </h1>
          <div className="mb-6 space-y-3 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Cerca una ricetta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 placeholder-gray-500 text-gray-700"
              />
              <button
                onClick={handleCreateClick}
                className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                title="Aggiungi una nuova ricetta"
                disabled={showForm}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            {/* Filters */}
            <div className="flex flex-col space-y-3">
              {/* Meal Filter */}
              <select
                value={filterPasto}
                onChange={(e) => setFilterPasto(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                disabled={loadingFilterOptions}
              >
                <option value="">Tutti i pasti</option>
                {loadingFilterOptions ? (
                  <option disabled>Caricamento...</option>
                ) : (
                  pastiOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))
                )}
              </select>
              {/* Protein Filter */}
              <select
                value={filterProteina}
                onChange={(e) => setFilterProteina(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                disabled={loadingFilterOptions}
              >
                <option value="">Tutte le proteine</option>
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
                setFilterPasto('');
                setFilterProteina('');
              }}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-full shadow-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 mt-4"
            >
              Azzera filtri
            </button>
          </div>
          {/* Recipe List */}
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
        
        {/* Right Panel: Details, Form, and Modal */}
        <div className="w-full md:w-4/5 p-6 sm:p-8 flex flex-col relative">
          {showSuccessMessage && (
            <div className="absolute top-4 right-4 z-20 px-4 py-3 rounded-lg shadow-md bg-green-500 text-white font-semibold transform transition-transform duration-300 animate-fade-in-down">
              Operazione completata con successo!
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-10 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Conferma eliminazione</h3>
                <p className="text-gray-600 mb-6">Sei sicuro di voler eliminare questa ricetta?</p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setShowDeleteModal(false)} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    Annulla
                  </button>
                  <button onClick={handleDeleteRicetta} className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recipe Details View */}
          {!showForm && !selectedRicetta && (
            <div className="flex items-center justify-center flex-grow text-center text-gray-500 text-xl">
              <p>Seleziona una ricetta dalla lista o creane una nuova.</p>
            </div>
          )}

          {loadingDetails && (
            <div className="flex items-center justify-center flex-grow text-center text-gray-500 text-xl">
              <p className="animate-pulse">Caricamento dettagli...</p>
            </div>
          )}

          {!showForm && selectedRicetta && !loadingDetails && (
            <div className="flex flex-col flex-grow">
              <div className="flex-shrink-0 mb-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 capitalize">{selectedRicetta.nome}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditClick}
                    className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    title="Modifica ricetta"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(selectedRicetta.ricetta_id)}
                    className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    title="Elimina ricetta"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-grow pr-4">
                <div className="bg-gray-50 p-6 rounded-2xl shadow-inner mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Dettagli</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Pasto:</strong> <span className="capitalize">{selectedRicetta.pasto || 'N/A'}</span></p>
                    <p><strong>Proteina principale:</strong> <span className="capitalize">{selectedRicetta.proteina || 'N/A'}</span></p>
                    <p><strong>Porzioni:</strong> {selectedRicetta.porzioni || 'N/A'}</p>
                    <p><strong>Puoi Sostituire:</strong> {selectedRicetta.puoi_sostituire || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl shadow-inner mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Ingredienti</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedRicetta.ingredienti.map((ing, index) => (
                      <li key={index} className="text-gray-700">
                        {ing.quantita_g}g di {ing.nome_alimento}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl shadow-inner mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Procedimento</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedRicetta.procedimento || 'Nessun procedimento specificato.'}</p>
                </div>

                {macroData && (
                  <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Macronutrienti totali</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-blue-100 p-4 rounded-xl">
                        <p className="text-lg font-bold text-blue-800">{Math.round(macroData.kcal)}</p>
                        <p className="text-sm text-blue-600">Calorie</p>
                      </div>
                      <div className="bg-green-100 p-4 rounded-xl">
                        <p className="text-lg font-bold text-green-800">{Math.round(macroData.proteine)}g</p>
                        <p className="text-sm text-green-600">Proteine</p>
                      </div>
                      <div className="bg-yellow-100 p-4 rounded-xl">
                        <p className="text-lg font-bold text-yellow-800">{Math.round(macroData.carboidrati)}g</p>
                        <p className="text-sm text-yellow-600">Carboidrati</p>
                      </div>
                      <div className="bg-red-100 p-4 rounded-xl">
                        <p className="text-lg font-bold text-red-800">{Math.round(macroData.lipidi)}g</p>
                        <p className="text-sm text-red-600">Grassi</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recipe Form View */}
          {showForm && (
            <div className="flex flex-col flex-grow overflow-y-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {formData.id_ricetta ? 'Modifica Ricetta' : 'Nuova Ricetta'}
              </h2>
              {formError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg" role="alert">
                  <p>{formError}</p>
                </div>
              )}
              <form onSubmit={handleSaveForm} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nome">Nome Ricetta*</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="pasto">Pasto*</label>
                    <select
                      id="pasto"
                      name="pasto"
                      value={formData.pasto}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white"
                    >
                      <option value="">Seleziona un pasto</option>
                      {pastiOptions.map(pasto => (
                        <option key={pasto} value={pasto}>{pasto}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="proteina">Proteina Principale*</label>
                    <select
                      id="proteina"
                      name="proteina"
                      value={formData.proteina}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white"
                    >
                      <option value="">Seleziona una proteina</option>
                      {proteineOptions.map(proteina => (
                        <option key={proteina} value={proteina}>{proteina}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="porzioni">Numero di Porzioni*</label>
                    <input
                      type="number"
                      id="porzioni"
                      name="porzioni"
                      value={formData.porzioni}
                      onChange={handleFormChange}
                      min="0"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sostituire">Ingredienti sostituibili</label>
                    <input
                      type="text"
                      id="sostituire"
                      name="puoi_sostituire"
                      value={formData.puoi_sostituire}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Ingredienti*</h3>
                  {formData.ingredienti.map((ingrediente, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-end gap-4 mb-4">
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`ingrediente-${index}`}>Alimento</label>
                        <select
                          id={`ingrediente-${index}`}
                          name="id_alimento"
                          value={ingrediente.id_alimento}
                          onChange={(e) => handleIngredientChange(index, 'id_alimento', e.target.value)}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white"
                        >
                          <option value="">Seleziona un alimento</option>
                          {alimentiList.map(alimento => (
                            <option key={alimento.id_alimento} value={alimento.id_alimento}>{alimento.nome_alimento}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`quantita-${index}`}>Quantità (g)</label>
                        <input
                          type="number"
                          id={`quantita-${index}`}
                          name="quantita_g"
                          value={ingrediente.quantita_g}
                          onChange={(e) => handleIngredientChange(index, 'quantita_g', parseInt(e.target.value))}
                          required
                          min="1"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                        />
                      </div>
                      {formData.ingredienti.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                          title="Rimuovi ingrediente"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Aggiungi ingrediente</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="descrizione">Procedimento</label>
                  <textarea
                    id="descrizione"
                    name="descrizione"
                    value={formData.descrizione}
                    onChange={handleFormChange}
                    rows="6"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full shadow-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Salva Ricetta
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
