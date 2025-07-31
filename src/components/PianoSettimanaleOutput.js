import React, { useState } from 'react';

export default function PianoSettimanaleOutput({ dati }) {
  // Debugging: Controlla la struttura dell'oggetto 'dati' ricevuto
  console.log("Dati ricevuti in PianoSettimanaleOutput:", dati);

  // Il componente renderà solo se 'dati' esiste E 'dati.piano_settimanale' esiste.
  if (!dati || !dati.piano_settimanale) {
    return null;
  }

  const piano = dati.piano_settimanale;

  // Funzione per formattare i numeri e gestire valori non numerici/nulli
  const formatNumber = (num, decimalPlaces = 1) => {
    if (typeof num === 'number' && !isNaN(num)) {
      if (Number.isInteger(num)) {
        return num.toString();
      }
      return num.toFixed(decimalPlaces);
    }
    return '0'; // Restituisce '0' se il valore non è un numero valido
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-8 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center pb-3 border-b-2 border-blue-500">Il Tuo Piano Nutrizionale Dettagliato</h3>
      <p className="text-base text-gray-600 text-center mb-6 leading-relaxed">
        Esplora il tuo piano giornaliero, con i dettagli del fabbisogno, le ricette suggerite
        e la ripartizione dei macronutrienti per ciascun pasto.
      </p>

      {/* La sezione "Riepilogo Totale Settimanale" è stata rimossa da qui
          perché i totali sono forniti per singolo giorno dal backend.
          Se desideri un totale settimanale, il backend dovrà fornirlo a livello superiore. */}

      {Object.entries(piano).map(([giorno, dettagli]) => (
        <GiornoDettaglio key={giorno} giorno={giorno} dettagli={dettagli} formatNumber={formatNumber} />
      ))}
    </div>
  );
}

// --- Componente separato per il dettaglio di un singolo giorno ---
function GiornoDettaglio({ giorno, dettagli, formatNumber }) {
  // Stato per gestire l'espansione/collasso degli ingredienti
  console.log(`Totale kcal ripartito per ${giorno}:`, dettagli.totale_kcal_ripartito);
  console.log("Chiavi disponibili in dettagli:", Object.keys(dettagli));
  const [showIngredients, setShowIngredients] = useState({});

  const toggleIngredients = (pastoNome) => {
    setShowIngredients(prev => ({
      ...prev,
      [pastoNome]: !prev[pastoNome]
    }));
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 mb-6 shadow-sm">
      <h4 className="text-xl font-semibold text-blue-700 mb-3 pb-2 border-b border-gray-200">
        {giorno.charAt(0).toUpperCase() + giorno.slice(1)}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 p-3 bg-blue-50 rounded-md">
        <p><strong>Kcal Target Giorno:</strong> {formatNumber(dettagli.kcal_target)} kcal</p>
        <p><strong>Proteine Pranzo:</strong> {formatNumber(dettagli.proteina_pranzo)} g</p>
        <p><strong>Proteine Cena:</strong> {formatNumber(dettagli.proteina_cena)} g</p>
        
        {/* Spostati qui, accedendo da 'dettagli' che rappresenta il singolo giorno */}
        {(dettagli.totale_kcal_target !== undefined && dettagli.totale_kcal_target !== null) && (
          <p><strong>Totale Kcal Target Giorno:</strong> {formatNumber(dettagli.totale_kcal_target)} kcal</p>
        )}
        {(dettagli.pasti?.totale_kcal_ripartito !== undefined && dettagli.pasti?.totale_kcal_ripartito !== null) && (
          <p><strong>Totale Kcal Ripartito Giorno:</strong> {formatNumber(dettagli.pasti.totale_kcal_ripartito)} kcal</p>
        )}
        {(dettagli.pasti?.totale_kcal_target !== undefined && dettagli.pasti?.totale_kcal_target !== null) && (
          <p><strong>Totale Kcal Target Giorno:</strong> {formatNumber(dettagli.pasti.totale_kcal_target)} kcal</p>
        )}
      </div>

      <h5 className="text-lg font-semibold text-gray-700 mt-6 mb-4 pb-2 border-b border-gray-200">Pasti del Giorno</h5>

      {dettagli.pasti.errore ? (
        <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">Errore nella generazione dei pasti: {dettagli.pasti.errore}</p>
      ) : (
        Object.entries(dettagli.pasti).filter(([pastoNome, pasto]) => typeof pasto === 'object' && pasto?.ricetta)
        .map(([pastoNome, pasto]) => 
          (
          
          <div key={pastoNome} className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4 shadow-sm">
            <div className="mb-2 text-lg font-medium text-gray-800">
              <strong className="text-blue-600">{pastoNome.charAt(0).toUpperCase() + pastoNome.slice(1)}:</strong>{' '}
              <span className="text-gray-900 font-bold">{pasto.ricetta || 'N/A'}</span>
            </div>

            {/* Dettagli della ricetta e bottone per espandere gli ingredienti */}
            {pasto.ricetta && pasto.macro && ( // Controlla che 'macro' esista
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r-md text-sm">
                    <p><strong>Kcal Ricetta:</strong> {formatNumber(pasto.macro.kcal)} kcal</p>
                    <p><strong>Proteine Ricetta:</strong> {formatNumber(pasto.macro.proteine)} g</p>
                    <p><strong>Carboidrati Ricetta:</strong> {formatNumber(pasto.macro.carboidrati)} g</p>
                    <p><strong>Grassi Ricetta:</strong> {formatNumber(pasto.macro.lipidi)} g</p>
                </div>
            )}
            
            {Array.isArray(pasto.ingredienti) && pasto.ingredienti.length > 0 && (
              <button
                onClick={() => toggleIngredients(pastoNome)}
                className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-blue-600 transition duration-300 ease-in-out mt-2 mb-3"
              >
                {showIngredients[pastoNome] ? 'Nascondi Ingredienti' : 'Mostra Ingredienti'}
              </button>
            )}

            {showIngredients[pastoNome] && Array.isArray(pasto.ingredienti) && pasto.ingredienti.length > 0 && (
              <ul className="list-disc pl-5 mt-3 text-sm leading-relaxed">
                {pasto.ingredienti.map((ingrediente, i) => (
                  <li key={i} className="mb-1 bg-gray-100 p-2 rounded-md border-l-2 border-gray-300">
                    <span className="font-semibold text-gray-800">{ingrediente.nome}</span> - {formatNumber(ingrediente.quantita_g)} g{' '}
                    {ingrediente.macro && ( // Controlla che 'macro' esista anche per l'ingrediente
                        <span className="text-gray-600">
                            (Kcal: {formatNumber(ingrediente.macro.kcal)}, P: {formatNumber(ingrediente.macro.proteine)} g, L: {formatNumber(ingrediente.macro.lipidi)} g, C: {formatNumber(ingrediente.macro.carboidrati)} g)
                        </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            
            {/* Frutta e verdura specifiche del pasto */}
            {pasto.verdura && (
              <p className="text-sm italic text-gray-600 mt-3"><strong>Verdura:</strong> {pasto.verdura.nome} ({formatNumber(pasto.verdura.quantita)} g)</p>
            )}
            {pasto.frutta && (
              <p className="text-sm italic text-gray-600 mt-1"><strong>Frutta:</strong> {pasto.frutta.nome} ({formatNumber(pasto.frutta.quantita)} g)</p>
            )}

          </div>
        ))
      )}
    </div>
  );
}
