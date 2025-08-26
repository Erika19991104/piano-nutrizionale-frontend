import React, { useEffect, useState } from 'react';

function App() {
  const [ricette, setRicette] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRicetta, setSelectedRicetta] = useState(null);
  const [macroData, setMacroData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [alimentiDisponibili, setAlimentiDisponibili] = useState([]);
  const [alimentiMap, setAlimentiMap] = useState({}); // Nuova mappa per id_alimento -> nome_alimento
  const [loadingAlimenti, setLoadingAlimenti] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPasto, setFilterPasto] = useState('');
  const [filterProteina, setFilterProteina] = useState('');
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
  const [pastiOptions, setPastiOptions] = useState([]);
  const [proteineOptions, setProteineOptions] = useState([]);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(true);

  // useEffect per il recupero della lista iniziale delle ricette con filtri.
  useEffect(() => {
    const fetchRicette = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/api/ricette/filter';
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

  // useEffect per il recupero della lista degli alimenti e creazione della mappa.
  useEffect(() => {
    const fetchAlimenti = async () => {
      setLoadingAlimenti(true);
      try {
        const response = await fetch('/api/alimenti/');
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        const data = await response.json();
        const nomiAlimenti = data.map(alimento => alimento.nome_alimento);
        setAlimentiDisponibili(nomiAlimenti);

        // Creazione della mappa ID -> nome
        const map = data.reduce((acc, alimento) => {
          acc[alimento.id_alimento] = alimento.nome_alimento;
          return acc;
        }, {});
        setAlimentiMap(map);
      } catch (err) {
        console.error("Errore nel recupero degli alimenti:", err);
        setError("Impossibile caricare la lista degli alimenti.");
      } finally {
        setLoadingAlimenti(false);
      }
    };
    fetchAlimenti();
  }, []);

  // useEffect per recuperare le opzioni dei filtri (pasti e proteine) dal backend.
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilterOptions(true);
      try {
        const response = await fetch('/api/ricette/opzioni/filtri');
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

  const handleSelectRicetta = async (ricettaId) => {
    setLoadingDetails(true);
    setSelectedRicetta(null);
    setMacroData(null);
    setShowForm(false);
    setFormError(null);

    try {
      const detailsResponse = await fetch(`/api/ricette/${ricettaId}`);
      if (!detailsResponse.ok) {
        throw new Error(`Errore HTTP: ${detailsResponse.status}`);
      }
      const details = await detailsResponse.json();

      // Arricchisce gli ingredienti con il nome dell'alimento
      const enrichedIngredients = details.ingredienti.map(ing => ({
        ...ing,
        nome_alimento: alimentiMap[ing.id_alimento] || 'Nome non disponibile'
      }));

      setSelectedRicetta({ ...details, ingredienti: enrichedIngredients });

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
  };

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
          // Sostituisci il nome con l'ID per l'aggiornamento
          id_alimento: ing.id_alimento || '',
          quantita_g: ing.quantita_g || 0,
        })) : [{ id_alimento: '', quantita_g: 0 }],
      });
      setShowForm(true);
      setFormError(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredienti];
    newIngredients[index][field] = value;
    setFormData(prev => ({ ...prev, ingredienti: newIngredients }));
  };

  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredienti: [...prev.ingredienti, { id_alimento: '', quantita_g: 0 }]
    }));
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = formData.ingredienti.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredienti: newIngredients }));
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nome || !formData.pasto || !formData.proteina || formData.porzioni < 0 || formData.ingredienti.length === 0 || formData.ingredienti.some(ing => !ing.id_alimento || ing.quantita_g <= 0)) {
      setFormError("Nome, pasto, proteina, numero di porzioni (non negativo) e almeno un ingrediente valido (con nome e quantità maggiore di 0) sono campi obbligatori.");
      return;
    }

    setLoadingDetails(true);
    const method = formData.id_ricetta ? 'PUT' : 'POST';
    const url = formData.id_ricetta ? `/api/ricette/${formData.id_ricetta}` : '/api/ricette/';

    const payload = {
      nome: formData.nome,
      pasto: formData.pasto,
      proteina: formData.proteina,
      porzioni: Number(formData.porzioni),
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

      const newRicetteResponse = await fetch('/api/ricette/');
      const newRicetteData = await newRicetteResponse.json();
      setRicette(newRicetteData);

      if (formData.id_ricetta) {
        handleSelectRicetta(formData.id_ricetta);
      } else {
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

  const handleConfirmDelete = (ricettaId) => {
    setRicettaToDelete(ricettaId);
    setShowDeleteModal(true);
  };

  const handleDeleteRicetta = async () => {
    if (!ricettaToDelete) return;

    setLoadingDetails(true);
    setShowDeleteModal(false);
    try {
      const response = await fetch(`/api/ricette/${ricettaToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Errore HTTP: ${response.status}`);
      }

      const newRicetteResponse = await fetch('/api/ricette/');
      const newRicetteData = await newRicetteResponse.json();
      setRicette(newRicetteData);

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

  const filteredRicette = ricette.filter(ricetta =>
    ricetta.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingAlimenti || loadingFilterOptions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700 animate-pulse">Caricamento...</p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans antialiased text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-10xl mx-auto flex flex-col md:flex-row">
        {/* Pannello di sinistra: Lista ricette e filtri */}
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
            {/* Filtri */}
            <div className="flex flex-col space-y-3">
              {/* Filtro Pasto */}
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
              {/* Filtro Proteina */}
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
        {/* Pannello di destra: Dettagli, form e modale */}
        <div className="w-full md:w-4/5 p-6 sm:p-8 flex flex-col relative">
          {showDeleteModal && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-10 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Conferma eliminazione</h3>
                <p className="text-gray-600 mb-6">Sei sicuro di voler eliminare questa ricetta? Non potrai più recuperarla.</p>
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
            <form onSubmit={handleSaveForm} className="w-full  bg-blue-50 p-8 rounded-2xl shadow-xl ">
              <h2 className="w-full text-3xl font-extrabold text-blue-600 mb-6 text-center">
                {formData.id_ricetta ? 'Modifica ricetta' : 'Aggiungi una nuova ricetta'}
              </h2>
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
                  <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione (procedimento)</label>
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
                  <label htmlFor="puoi_sostituire" className="block text-sm font-medium text-gray-700">Note (sostituzioni, consigli, ecc.)</label>
                  <textarea
                    id="puoi_sostituire"
                    name="puoi_sostituire"
                    value={formData.puoi_sostituire}
                    onChange={handleFormChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>
                <h3 className="text-xl font-semibold mt-4">Ingredienti</h3>
                {formData.ingredienti.map((ingrediente, index) => (
                  <div key={index} className="flex space-x-2 items-center">
                    <select
                      value={ingrediente.id_alimento}
                      onChange={(e) => handleIngredientChange(index, 'id_alimento', e.target.value)}
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
                      placeholder="Quantità in grammi (g)"
                      value={ingrediente.quantita_g}
                      onChange={(e) => handleIngredientChange(index, 'quantita_g', Number(e.target.value))}
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
                  Aggiungi ingrediente
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
            selectedRicetta ? (
              loadingDetails ? (
                <p className="text-xl font-semibold text-gray-700 animate-pulse">Caricamento dettagli...</p>
              ) : selectedRicetta && !error ? (
                <div className="w-full ">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-blue-600 capitalize">
                      {selectedRicetta.nome}
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
                        <li className="flex justify-between items-center pb-2">
                          <span className="font-medium text-gray-600">Proteina:</span>
                          <span className="font-bold text-blue-700">{selectedRicetta.proteina || "N/A"}</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-6 rounded-2xl shadow-inner">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Valori Nutrizionali (per porzione)</h3>
                      {macroData ? (
                        <ul className="text-lg space-y-2">
                          <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="font-medium text-gray-600">Kcal:</span>
                            <span className="font-bold text-green-700">{macroData.kcal.toFixed(2)} kcal</span>
                          </li>
                          <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="font-medium text-gray-600">Proteine:</span>
                            <span className="font-bold text-green-700">{macroData.proteine.toFixed(2)} g</span>
                          </li>
                          <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="font-medium text-gray-600">Carboidrati:</span>
                            <span className="font-bold text-green-700">{macroData.carboidrati.toFixed(2)} g</span>
                          </li>
                          <li className="flex justify-between items-center pb-2">
                            <span className="font-medium text-gray-600">Lipidi:</span>
                            <span className="font-bold text-green-700">{macroData.lipidi.toFixed(2)} g</span>
                          </li>
                        </ul>
                      ) : (
                        <p className="text-gray-500">Dati non disponibili.</p>
                      )}
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-2xl shadow-inner">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Ingredienti</h3>
                      <ul className="list-disc list-inside space-y-1 text-lg">
                        {selectedRicetta.ingredienti?.map((ing, index) => (
                          <li key={index} className="text-gray-700">
                            <span className="font-semibold">{ing.nome_alimento}</span>: {ing.quantita_g} g
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-2xl shadow-inner">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Procedimento</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedRicetta.procedimento || "Nessun procedimento disponibile."}</p>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-2xl shadow-inner">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Note</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedRicetta.puoi_sostituire || "Nessuna sostituzione suggerita."}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xl font-semibold text-gray-700">Errore nel caricamento dei dettagli della ricetta.</p>
              )
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow p-4">
                <p className="text-2xl text-gray-500 font-medium text-center">Seleziona una ricetta dall'elenco per visualizzarne i dettagli o aggiungine una nuova.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;