import React, { useState, useEffect } from 'react';

function ClientForm({ cliente = {}, onSave, onCancel }) {
  // Stato locale per i campi del form
  const [clientName, setClientName] = useState(cliente.client_name || '');
  const [eta, setEta] = useState(cliente.eta || '');
  const [sesso, setSesso] = useState(cliente.sesso || '');
  const [peso, setPeso] = useState(cliente.peso || '');
  const [altezza, setAltezza] = useState(cliente.altezza || '');

  // Se cambia il cliente in editing aggiorno i campi
  useEffect(() => {
    setClientName(cliente.client_name || '');
    setEta(cliente.eta || '');
    setSesso(cliente.sesso || '');
    setPeso(cliente.peso || '');
    setAltezza(cliente.altezza || '');
  }, [cliente]);

  // Funzione submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Creo l’oggetto cliente da passare su onSave
    const updatedCliente = {
      ...cliente,
      client_name: clientName,
      eta,
      sesso,
      peso,
      altezza,
    };

    onSave(updatedCliente);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Nome Cliente</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Età</label>
        <input
          type="number"
          value={eta}
          onChange={(e) => setEta(e.target.value)}
          min="0"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Sesso</label>
        <select
          value={sesso}
          onChange={(e) => setSesso(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Seleziona</option>
          <option value="M">Maschio</option>
          <option value="F">Femmina</option>
          <option value="Altro">Altro</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Peso (kg)</label>
        <input
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          min="0"
          step="0.1"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Altezza (cm)</label>
        <input
          type="number"
          value={altezza}
          onChange={(e) => setAltezza(e.target.value)}
          min="0"
          step="0.1"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Annulla
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Salva
        </button>
      </div>
    </form>
  );
}

export default ClientForm;
