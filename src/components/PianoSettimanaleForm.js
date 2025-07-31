import React, { useState } from "react";

export default function PianoSettimanaleForm({ onSubmit, isLoading }) {
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
    // Validazione: l'età deve essere un numero positivo
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
    if (!formData.attivita) { // Aggiunta validazione per attività
        newErrors.attivita = "Seleziona il tuo livello di attività.";
    }
    if (formData.deficit_giornaliero === "" || isNaN(formData.deficit_giornaliero) || parseInt(formData.deficit_giornaliero) < 0) {
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
      // Puoi aggiungere un feedback visivo qui, ad esempio scrollando al primo errore
      console.log("Form non valido, correggi gli errori.");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8 shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b-2 border-blue-500 pb-3">
        Inserisci i Tuoi Dati
      </h3>
      <p className="text-base text-gray-600 text-center mb-6 leading-relaxed">
        Compila i campi qui sotto per calcolare il tuo fabbisogno e generare un piano nutrizionale.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Età */}
        <div className="mb-2">
          <label htmlFor="eta" className="block text-sm font-semibold text-gray-700 mb-2">Età:</label>
          <input
            type="number"
            id="eta"
            name="eta"
            placeholder="La tua età in anni"
            value={formData.eta}
            onChange={handleChange}
            required
            min="1"
            className={`w-full p-3 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${errors.eta ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.eta && <p className="text-red-600 text-sm mt-1">{errors.eta}</p>}
        </div>

        {/* Peso */}
        <div className="mb-2">
          <label htmlFor="peso" className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg):</label>
          <input
            type="number"
            id="peso"
            name="peso"
            placeholder="Il tuo peso in kg (es. 70.5)"
            value={formData.peso}
            onChange={handleChange}
            required
            min="1"
            step="0.1"
            className={`w-full p-3 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${errors.peso ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.peso && <p className="text-red-600 text-sm mt-1">{errors.peso}</p>}
        </div>

        {/* Altezza */}
        <div className="mb-2">
          <label htmlFor="altezza" className="block text-sm font-semibold text-gray-700 mb-2">Altezza (cm):</label>
          <input
            type="number"
            id="altezza"
            name="altezza"
            placeholder="La tua altezza in cm (es. 175)"
            value={formData.altezza}
            onChange={handleChange}
            required
            min="1"
            className={`w-full p-3 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${errors.altezza ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.altezza && <p className="text-red-600 text-sm mt-1">{errors.altezza}</p>}
        </div>

        {/* Sesso */}
        <div className="mb-2">
          <label htmlFor="sesso" className="block text-sm font-semibold text-gray-700 mb-2">Sesso:</label>
          <select
            id="sesso"
            name="sesso"
            value={formData.sesso}
            onChange={handleChange}
            required
            className={`w-full p-3 border rounded-md text-base bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${errors.sesso ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="">Seleziona</option>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
          </select>
          {errors.sesso && <p className="text-red-600 text-sm mt-1">{errors.sesso}</p>}
        </div>

        {/* Attività */}
        <div className="mb-2">
          <label htmlFor="attivita" className="block text-sm font-semibold text-gray-700 mb-2">Livello di Attività Fisica (LAF):</label>
          <select
            id="attivita"
            name="attivita"
            value={formData.attivita}
            onChange={handleChange}
            required
            className={`w-full p-3 border rounded-md text-base bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${errors.attivita ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="">Seleziona il tuo livello</option>
            <option value="sedentario">Sedentario: poco o nessun esercizio</option>
            <option value="poco_attivo">Poco Attivo: esercizio leggero 1-3 gg/sett.</option>
            <option value="attivo">Attivo: esercizio moderato 3-5 gg/sett.</option>
            <option value="molto_attivo">Molto Attivo: esercizio intenso 6-7 gg/sett.</option>
          </select>
          {errors.attivita && <p className="text-red-600 text-sm mt-1">{errors.attivita}</p>}
        </div>

        {/* Deficit Giornaliero */}
        <div className="mb-2">
          <label htmlFor="deficit_giornaliero" className="block text-sm font-semibold text-gray-700 mb-2">Deficit Calorico Giornaliero (kcal):</label>
          <input
            type="number"
            id="deficit_giornaliero"
            name="deficit_giornaliero"
            placeholder="Es. 500 (per perdere peso) o 0 (per mantenimento)"
            value={formData.deficit_giornaliero}
            onChange={handleChange}
            required
            min="0"
            className={`w-full p-3 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${errors.deficit_giornaliero ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.deficit_giornaliero && <p className="text-red-600 text-sm mt-1">{errors.deficit_giornaliero}</p>}
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-bold cursor-pointer transition-colors duration-300 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              Calcolo in corso... <div className="border-4 border-gray-200 border-l-white rounded-full w-5 h-5 animate-spin ml-2"></div>
            </span>
          ) : (
            "Calcola Piano"
          )}
        </button>
      </form>
    </div>
  );
}
