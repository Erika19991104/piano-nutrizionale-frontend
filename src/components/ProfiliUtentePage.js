import React, { useEffect, useState } from 'react';

/**
 * Componente ClientiPage per la gestione dei profili utente (clienti).
 * Permette di visualizzare una lista di clienti, vederne i dettagli,
 * e aggiungere/modificare i loro profili.
 */
function ClientiPage() {
  // Base URL per le API (sostituire con il tuo URL reale del backend)
  const API_BASE_URL = 'http://localhost:8000'; // Esempio: 'https://tuoapi.com'

  // ---------- STATI PER LA GESTIONE DEI CLIENTI ----------
  const [clienti, setClienti] = useState([]);
  const [loadingClienti, setLoadingClienti] = useState(true);
  const [errorClienti, setErrorClienti] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null); // Cliente attualmente selezionato per i dettagli
  const [editingCliente, setEditingCliente] = useState(null); // Cliente attualmente in fase di modifica/creazione (dati del form)
  const [showClientForm, setShowClientForm] = useState(false); // Mostra/nasconde il form di creazione/modifica

  // Effetto per caricare i clienti iniziali
  useEffect(() => {
    const fetchClienti = async () => {
      setLoadingClienti(true);
      setErrorClienti(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/profili/profiles/`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setClienti(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setErrorClienti('Error loading clients. Please try again later.');
      } finally {
        setLoadingClienti(false);
      }
    };
    fetchClienti();
  }, [API_BASE_URL]); // Ricarica quando l'URL base cambia

  // Funzione per selezionare un cliente e visualizzarne i dettagli
  const handleSelectCliente = async (clienteId) => {
    setSelectedCliente(null); // Reset selected client
    setEditingCliente(null); // Reset client in edit mode
    setShowClientForm(false); // Hide the form if it was open
    setLoadingClienti(true); // Set loading state for details
    setErrorClienti(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profili/profiles/${clienteId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedCliente(data);
    } catch (err) {
      console.error("Error loading client details:", err);
      setErrorClienti('Error loading client details.');
    } finally {
      setLoadingClienti(false);
    }
  };

  // Funzione per iniziare la creazione di un nuovo cliente
  const handleNewCliente = () => {
    setSelectedCliente(null); // No client selected
    setEditingCliente({ // Initialize an empty client for the form
      client_name: '',
      eta: '',
      peso: '',
      altezza: '',
      sesso: '',
      attivita: '',
      deficit_giornaliero: ''
    });
    setShowClientForm(true); // Show the form
  };

  // Funzione per iniziare la modifica di un cliente esistente
  const handleEditCliente = (cliente) => {
    setSelectedCliente(null); // Deselect the client to show the form
    setEditingCliente(cliente); // Populate the form with client data
    
    setShowClientForm(true); // Show the form
  };

  // Funzione per salvare (creare o aggiornare) un cliente tramite l'API PUT/POST
  const handleSaveCliente = async (clienteData) => {
    setLoadingClienti(true);
    setErrorClienti(null);
  
    const isNewClient = !clienteData.user_id;
  
    try {
      const url = isNewClient
        ? `${API_BASE_URL}/api/profili/profiles/newuser` // POST per nuovi utenti
        : `${API_BASE_URL}/api/profili/profiles/${clienteData.user_id}`; // PUT per utenti esistenti
  
      const method = isNewClient ? 'POST' : 'PUT';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const savedCliente = await response.json(); // L'API dovrebbe restituire il cliente salvato
  
      if (isNewClient) {
        setClienti(prev => [...prev, savedCliente]); // Aggiungi il nuovo cliente alla lista
      } else {
        setClienti(prev => prev.map(c => c.user_id === savedCliente.user_id ? savedCliente : c)); // Aggiorna il cliente esistente
      }
  
      setSelectedCliente(savedCliente); // Seleziona il cliente appena salvato/modificato
      setEditingCliente(null); // Resetta il form di modifica
      setShowClientForm(false); // Nasconde il form
    } catch (err) {
      console.error("Error saving client:", err);
      setErrorClienti('Errore durante il salvataggio del cliente.');
    } finally {
      setLoadingClienti(false);
    }
  };

  // Funzione per annullare la modifica/creazione del cliente
  const handleCancelEdit = () => {
    setEditingCliente(null);
    setShowClientForm(false);
  };

  // Componente interno per il form di creazione/modifica cliente
  const ClientForm = ({ cliente, onSave, onCancel }) => {
    const [formData, setFormData] = useState(cliente || {
      user_id: '', // user_id non dovrebbe essere modificabile nel form per un utente esistente, o generato per un nuovo utente
      client_name: '',
      eta: '',
      peso: '',
      altezza: '',
      sesso: '',
      attivita: '',
      deficit_giornaliero: ''
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };
  
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {cliente && cliente.user_id ? 'Modifica Cliente' : 'Nuovo Cliente'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" id="client_name" name="client_name" value={formData.client_name} onChange={handleChange}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
  
          <div>
            <label htmlFor="eta" className="block text-sm font-medium text-gray-700">Età</label>
            <input type="number" id="eta" name="eta" value={formData.eta} onChange={handleChange}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
  
          <div>
            <label htmlFor="sesso" className="block text-sm font-medium text-gray-700">Genere</label>
            <select id="sesso" name="sesso" value={formData.sesso} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
              <option value="">Seleziona</option>
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
            </select>
          </div>
  
          <div>
            <label htmlFor="peso" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
            <input type="number" id="peso" name="peso" value={formData.peso} onChange={handleChange}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
  
          <div>
            <label htmlFor="altezza" className="block text-sm font-medium text-gray-700">Altezza (cm)</label>
            <input type="number" id="altezza" name="altezza" value={formData.altezza} onChange={handleChange}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
  
          <div>
            <label htmlFor="attivita" className="block text-sm font-medium text-gray-700">Livello Attività</label>
            <select id="attivita" name="attivita" value={formData.attivita} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
              <option value="">Seleziona</option>
              <option value="sedentario">Sedentario</option>
              <option value="poco_attivo">Poco attivo</option>
              <option value="attivo">Attivo</option>
              <option value="molto_attivo">Molto attivo</option>
            </select>
          </div>
  
          <div>
            <label htmlFor="deficit_giornaliero" className="block text-sm font-medium text-gray-700">Deficit giornaliero (kcal)</label>
            <input type="number" id="deficit_giornaliero" name="deficit_giornaliero" value={formData.deficit_giornaliero} onChange={handleChange}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
  
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">
              Annulla
            </button>
            <button type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
              Salva Cliente
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 antialiased p-4">
      <header className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h1 className="text-3xl font-extrabold text-blue-700">Gestione Clienti</h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Colonna sinistra: Lista Clienti */}
        <div className="lg:w-1/3 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">I Tuoi Clienti</h2>

          {loadingClienti ? (
            <p className="text-center text-gray-500">Caricamento clienti...</p>
          ) : errorClienti ? (
            <p className="text-center text-red-500">{errorClienti}</p>
          ) : (
            <ul className="space-y-3">
              {clienti.length > 0 ? (
                clienti.map((cliente) => (
                  <li
                    key={cliente.user_id}
                    onClick={() => handleSelectCliente(cliente.user_id)}
                    className={`p-4 rounded-md cursor-pointer transition-all duration-200 flex justify-between items-center
                                ${selectedCliente && selectedCliente.user_id === cliente.user_id ? 'bg-blue-100 border-l-4 border-blue-600 shadow-sm' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    { <span className="font-medium text-gray-800">{cliente.client_name} </span> }
                    { <span className="text-sm text-gray-500">{cliente.user_id}</span>}
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">Nessun cliente trovato. Aggiungine uno nuovo!</p>
              )}
            </ul>
          )}
          <button
            onClick={handleNewCliente}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
          >
            Aggiungi Nuovo Cliente
          </button>
        </div>

        {/* Colonna destra: Dettagli Cliente / Form Cliente */}
        <div className="lg:w-2/3 p-6 bg-white rounded-lg shadow-md">
          {showClientForm ? (
            <ClientForm cliente={editingCliente} onSave={handleSaveCliente} onCancel={handleCancelEdit} />
          ) : (
            selectedCliente ? (
              <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">Dettagli Cliente: {selectedCliente.client_name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
                  <p><strong>UserId:</strong> {selectedCliente.user_id}</p>
                  <p><strong>Età:</strong> {selectedCliente.eta || 'N/D'}</p>
                  <p><strong>Genere:</strong> {selectedCliente.sesso || 'N/D'}</p>
                  <p><strong>Peso:</strong> {selectedCliente.peso ? `${selectedCliente.peso} kg` : 'N/D'}</p>
                  <p><strong>Altezza:</strong> {selectedCliente.altezza ? `${selectedCliente.altezza} cm` : 'N/D'}</p>
                  <p><strong>Livello attività:</strong> {selectedCliente.LAF || 'N/D'}</p>
                  <p><strong>Deficit settato:</strong> {selectedCliente.deficit_giornaliero || 'N/D'}</p>
                </div>
                {/* Sezione info metaboliche */}
                {(typeof selectedCliente.Metabolismo_basale !== 'undefined' ||
                  typeof selectedCliente.BMI !== 'undefined' ||
                  typeof selectedCliente.Peso_ideale !== 'undefined' ||
                  typeof selectedCliente.Metabolismo_totale_giornaliero !== 'undefined' ||
                  typeof selectedCliente.Metabolismo_totale_settimanale !== 'undefined' ||
                  typeof selectedCliente.Calorie_giornaliere_divise !== 'undefined' ||
                  typeof selectedCliente.Calorie_settimanali_in_deficit !== 'undefined' ||
                  typeof selectedCliente.Deficit_calorico_settimanale !== 'undefined' ||
                  typeof selectedCliente.Fabbisogno_proteine_g_min !== 'undefined' ||
                  typeof selectedCliente.Fabbisogno_proteine_g_max !== 'undefined' ||
                  typeof selectedCliente.Fabbisogno_lipidi_g_min !== 'undefined' ||
                  typeof selectedCliente.Fabbisogno_lipidi_g_max !== 'undefined' ||
                  typeof selectedCliente.Fabbisogno_carboidrati_g_min !== 'undefined' ||
                  typeof selectedCliente.Fabbisogno_carboidrati_g_max !== 'undefined') && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-lg font-semibold text-blue-600 mb-4">Informazioni Metaboliche e Nutrizionali</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                      <p><strong>BMI:</strong> {selectedCliente.BMI ?? 'N/D'}</p>
                      <p><strong>Peso ideale:</strong> {selectedCliente.Peso_ideale ?? 'N/D'} kg</p>
                      <p><strong>Metabolismo basale:</strong> {selectedCliente.Metabolismo_basale ?? 'N/D'} kcal</p>
                      <p><strong>Fattore attività (LAF):</strong> {selectedCliente.LAF ?? 'N/D'}</p>
                      <p><strong>Metabolismo totale giornaliero:</strong> {selectedCliente.Metabolismo_totale_giornaliero ?? 'N/D'} kcal</p>
                      <p><strong>Metabolismo totale settimanale:</strong> {selectedCliente.Metabolismo_totale_settimanale ?? 'N/D'} kcal</p>
                      <p><strong>Calorie giornaliere divise:</strong> {selectedCliente.Calorie_giornaliere_divise ?? 'N/D'} kcal</p>
                      <p><strong>Calorie settimanali in deficit:</strong> {selectedCliente.Calorie_settimanali_in_deficit ?? 'N/D'} kcal</p>
                      <p><strong>Deficit calorico settimanale:</strong> {selectedCliente.Deficit_calorico_settimanale ?? 'N/D'} kcal</p>
                      <p><strong>Fabbisogno proteine:</strong> {selectedCliente.Fabbisogno_proteine_g_min ?? 'N/D'}g - {selectedCliente.Fabbisogno_proteine_g_max ?? 'N/D'}g</p>
                      <p><strong>Fabbisogno lipidi:</strong> {selectedCliente.Fabbisogno_lipidi_g_min ?? 'N/D'}g - {selectedCliente.Fabbisogno_lipidi_g_max ?? 'N/D'}g</p>
                      <p><strong>Fabbisogno carboidrati:</strong> {selectedCliente.Fabbisogno_carboidrati_g_min ?? 'N/D'}g - {selectedCliente.Fabbisogno_carboidrati_g_max ?? 'N/D'}g</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleEditCliente(selectedCliente)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 shadow-sm mt-4"
                >
                  Modifica Cliente
                </button>
              </div>
            ) : (
              <p className="text-xl font-medium text-gray-500 text-center">
                Seleziona un cliente dalla lista, o aggiungine uno nuovo per iniziare.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientiPage;
