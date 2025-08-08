import React, { useState, useEffect } from 'react';
import { LuChevronDown, LuChevronUp, LuLoaderCircle, LuSave } from 'react-icons/lu';

// URL di base per le API. Sostituisci con l'URL corretto del tuo server FastAPI.
const API_BASE_URL = 'http://localhost:8000';
// ID utente di esempio. Sostituisci con l'ID utente reale della tua applicazione.
const USER_ID = '5c5c0250-34fb-489d-8f1f-f0d96daa05d8';

const PianiNutrizionaliPage = () => {
    // Stato per memorizzare il piano settimanale originale e quello modificabile
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [editablePlan, setEditablePlan] = useState(null);
    // Stato per tenere traccia delle ricette espanse
    const [expandedRecipeIds, setExpandedRecipeIds] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Stato per gestire il salvataggio
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', 'idle'
    // Stato per gestire il valore degli input di testo per ogni ingrediente
    const [inputValues, setInputValues] = useState({});
    // Nuovo stato per gestire il caricamento per ogni singolo pasto durante il ricalcolo
    const [isMealLoading, setIsMealLoading] = useState({});

    // Funzione per chiamare l'API per il piano settimanale
    const fetchWeeklyPlan = async () => {
        setIsLoading(true);
        setError(null);
        setSaveStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/piani-nutrizionali/piani/piano-settimanale/${USER_ID}`);
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            const data = await response.json();
            
            const rawPlan = data.piano_settimanale.piano_settimanale;
            
            if (!rawPlan || Object.keys(rawPlan).length === 0) {
                setWeeklyPlan([]);
                setEditablePlan([]);
                return;
            }

            const formattedPlan = Object.entries(rawPlan).map(([giorno, dettagli_giorno]) => {
                const pastiArray = [];
                if (dettagli_giorno) {
                    Object.entries(dettagli_giorno).forEach(([nomePasto, dettagliPasto]) => {
                        if (dettagliPasto && dettagliPasto.ricetta && dettagliPasto.riproporzionata && dettagliPasto.riproporzionata.macro_riproporzionate) {
                            const pasto = {
                                pasto: nomePasto.charAt(0).toUpperCase() + nomePasto.slice(1),
                                nome: dettagliPasto.ricetta.nome,
                                tipo: 'Ricetta',
                                id_ricetta: dettagliPasto.ricetta.ricetta_id,
                                quantita: '1 porzione',
                                kcal: dettagliPasto.riproporzionata.macro_riproporzionate.kcal,
                                proteine: dettagliPasto.riproporzionata.macro_riproporzionate.proteine,
                                carboidrati: dettagliPasto.riproporzionata.macro_riproporzionate.carboidrati,
                                lipidi: dettagliPasto.riproporzionata.macro_riproporzionate.lipidi,
                                ingredienti_riproporzionati: dettagliPasto.riproporzionata.ingredienti_riproporzionati || [],
                            };
                            pastiArray.push(pasto);
                        }
                    });
                }
                return {
                    giorno: giorno.charAt(0).toUpperCase() + giorno.slice(1),
                    pasti: pastiArray,
                };
            });
            
            const order = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
            formattedPlan.sort((a, b) => order.indexOf(a.giorno) - order.indexOf(b.giorno));

            setWeeklyPlan(formattedPlan);
            setEditablePlan(JSON.parse(JSON.stringify(formattedPlan)));
            
            // Inizializza inputValues per tutti gli ingredienti
            const initialInputValues = {};
            formattedPlan.forEach((day, dayIndex) => {
                day.pasti.forEach((pasto, mealIndex) => {
                    pasto.ingredienti_riproporzionati.forEach((ingrediente, ingredientIndex) => {
                        const inputKey = `${dayIndex}-${mealIndex}-${ingredientIndex}`;
                        initialInputValues[inputKey] = (ingrediente.quantita_g || 0) > 0 
                            ? (ingrediente.quantita_g || 0).toFixed(1).replace('.', ',')
                            : '';
                    });
                });
            });
            setInputValues(initialInputValues);

        } catch (err) {
            setError(err.message);
            console.error("Errore nel recupero del piano settimanale:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Funzione ASINCRONA per ricalcolare le macro di un pasto chiamando l'API
    const recalculateMealMacros = async (recipeId, ingredients) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ricette/recalculate-macros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    ricetta_id: recipeId,
                    ingredienti_riproporzionati: ingredients 
                }),
            });

            if (!response.ok) {
                throw new Error(`Errore durante il ricalcolo delle macro: ${response.status}`);
            }

            const data = await response.json();
            return data.macro_riproporzionate;

        } catch (err) {
            console.error("Errore nel ricalcolo delle macro tramite API:", err);
            return null;
        }
    };

    // Gestore per la modifica della quantità di un ingrediente con ricalcolo dinamico tramite API
    const handleIngredientQuantityChange = async (dayIndex, mealIndex, ingredientIndex, newQuantity) => {
        const key = `${dayIndex}-${mealIndex}`;
        setIsMealLoading(prev => ({ ...prev, [key]: true }));

        const sanitizedQuantity = newQuantity.replace(',', '.');
        const updatedQuantity = parseFloat(sanitizedQuantity);

        // Aggiorna lo stato inputValues per riflettere il valore corrente nel campo di testo
        const inputKey = `${dayIndex}-${mealIndex}-${ingredientIndex}`;
        setInputValues(prev => ({
            ...prev,
            [inputKey]: newQuantity
        }));

        setEditablePlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            
            const newPlan = JSON.parse(JSON.stringify(prevPlan));
            const pasto = newPlan[dayIndex].pasti[mealIndex];
            const ingredienti = pasto.ingredienti_riproporzionati;

            if (!isNaN(updatedQuantity) && newQuantity.trim() !== '') {
                ingredienti[ingredientIndex].quantita_g = updatedQuantity;
            } else {
                ingredienti[ingredientIndex].quantita_g = 0;
            }

            // Non ricalcoliamo localmente, ma prepariamo i dati per la chiamata API
            // ... (la chiamata API avverrà dopo)
            return newPlan;
        });

        // Ora, dopo aver aggiornato la quantità nell'editablePlan, chiamiamo l'API per il ricalcolo
        try {
            const currentPasto = editablePlan[dayIndex].pasti[mealIndex];
            const newMacros = await recalculateMealMacros(currentPasto.id_ricetta, currentPasto.ingredienti_riproporzionati);
            
            if (newMacros) {
                setEditablePlan(prevPlan => {
                    if (!prevPlan) return prevPlan;
                    const newPlan = JSON.parse(JSON.stringify(prevPlan));
                    const pasto = newPlan[dayIndex].pasti[mealIndex];
                    pasto.kcal = newMacros.kcal;
                    pasto.proteine = newMacros.proteine;
                    pasto.carboidrati = newMacros.carboidrati;
                    pasto.lipidi = newMacros.lipidi;
                    return newPlan;
                });
            }
        } finally {
            // Rimuovi lo stato di caricamento del pasto
            setIsMealLoading(prev => {
                const newLoading = { ...prev };
                delete newLoading[key];
                return newLoading;
            });
            setSaveStatus('idle');
        }
    };
    
    // Funzione per salvare le modifiche sul server
    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            // Formatta i dati da inviare al server
            const planToSave = editablePlan.reduce((acc, day) => {
                acc[day.giorno.toLowerCase()] = day.pasti.reduce((mealAcc, pasto) => {
                    mealAcc[pasto.pasto.toLowerCase()] = {
                        ricetta: {
                            nome: pasto.nome,
                            ricetta_id: pasto.id_ricetta,
                        },
                        riproporzionata: {
                            ingredienti_riproporzionati: pasto.ingredienti_riproporzionati,
                        }
                    };
                    return mealAcc;
                }, {});
                return acc;
            }, {});

            const response = await fetch(`${API_BASE_URL}/api/piani-nutrizionali/piani/piano-settimanale/${USER_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ piano_settimanale: planToSave }),
            });

            if (!response.ok) {
                throw new Error(`Errore durante il salvataggio: ${response.status}`);
            }

            // Aggiorna il weeklyPlan con i dati modificati
            setWeeklyPlan(JSON.parse(JSON.stringify(editablePlan)));
            setSaveStatus('success');

        } catch (err) {
            setSaveStatus('error');
            console.error("Errore durante il salvataggio:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Caricamento iniziale del piano settimanale
    useEffect(() => {
        fetchWeeklyPlan();
    }, []);

    // Gestore per l'espansione/riduzione delle ricette
    const handleToggleRecipe = (dayIndex, mealIndex, pasto) => {
        if (!pasto.id_ricetta) return; 
        
        const key = `${dayIndex}-${mealIndex}`;
        const isExpanded = expandedRecipeIds[key];
        
        setExpandedRecipeIds(prev => {
            const newExpanded = { ...prev };
            if (isExpanded) {
                delete newExpanded[key];
            } else {
                newExpanded[key] = true;
            }
            return newExpanded;
        });
    };

    // Gestori per gli stati di caricamento ed errore
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 text-indigo-600">
                <LuLoaderCircle className="animate-spin text-4xl mr-2" />
                <span className="text-xl">Caricamento del piano settimanale...</span>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 text-red-500 font-medium">Errore: {error}</div>;
    }

    if (!editablePlan || editablePlan.length === 0) {
        return <div className="text-center p-8 text-gray-500">Nessun piano settimanale trovato.</div>;
    }
    
    // Funzione per calcolare i totali giornalieri
    const calculateDailyTotals = (pasti) => {
      return pasti.reduce((acc, pasto) => {
        acc.kcal += pasto.kcal || 0;
        acc.proteine += pasto.proteine || 0;
        acc.carboidrati += pasto.carboidrati || 0;
        acc.grassi += pasto.lipidi || 0;
        return acc;
      }, { kcal: 0, proteine: 0, carboidrati: 0, grassi: 0 });
    };

    // Controlla se ci sono modifiche non salvate
    const hasUnsavedChanges = JSON.stringify(weeklyPlan) !== JSON.stringify(editablePlan);

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Piani Nutrizionali Settimanali</h2>
                <div className="flex items-center space-x-4">
                    {saveStatus === 'success' && (
                        <div className="text-green-500 font-medium">Modifiche salvate con successo!</div>
                    )}
                    {saveStatus === 'error' && (
                        <div className="text-red-500 font-medium">Errore durante il salvataggio. Riprova.</div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || isSaving}
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-colors duration-200
                            ${!hasUnsavedChanges || isSaving
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }
                        `}
                    >
                        {isSaving ? (
                            <LuLoaderCircle className="animate-spin inline-block mr-2" size={20} />
                        ) : (
                            <LuSave className="inline-block mr-2" size={20} />
                        )}
                        Salva modifiche
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-medium text-gray-500 uppercase">
                            <th className="px-6 py-3 rounded-l-lg">Pasto</th>
                            <th className="px-6 py-3">Alimento / Ricetta</th>
                            <th className="px-6 py-3">Quantità / Porzioni</th>
                            <th className="px-6 py-3">Kcal</th>
                            <th className="px-6 py-3">Proteine (g)</th>
                            <th className="px-6 py-3">Carboidrati (g)</th>
                            <th className="px-6 py-3 rounded-r-lg">Grassi (g)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editablePlan.map((day, dayIndex) => {
                            const dailyTotals = calculateDailyTotals(day.pasti);
                            return (
                                <React.Fragment key={day.giorno}>
                                    <tr className="bg-indigo-100 font-bold text-lg text-gray-800">
                                        <td colSpan="7" className="px-6 py-4 rounded-lg">
                                            {day.giorno}
                                        </td>
                                    </tr>
                                    {day.pasti.map((pasto, mealIndex) => {
                                        const key = `${dayIndex}-${mealIndex}`;
                                        const isLoading = isMealLoading[key];

                                        return (
                                        <React.Fragment key={pasto.id_ricetta ? `${day.giorno}-${pasto.pasto}-${pasto.id_ricetta}` : `${day.giorno}-${pasto.pasto}-${mealIndex}`}>
                                            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                                                <td className="px-6 py-4 font-medium text-gray-900">{pasto.pasto}</td>
                                                <td className="px-6 py-4 text-gray-600 flex items-center">
                                                    {pasto.nome}
                                                    {pasto.tipo === 'Ricetta' && (
                                                        <button
                                                            onClick={() => handleToggleRecipe(dayIndex, mealIndex, pasto)}
                                                            className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors duration-200"
                                                            title="Espandi ingredienti"
                                                        >
                                                            {expandedRecipeIds[key] ? <LuChevronUp size={18} /> : <LuChevronDown size={18} />}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                  {isLoading ? (
                                                      <LuLoaderCircle className="animate-spin text-indigo-500" size={20} />
                                                  ) : (
                                                      pasto.quantita
                                                  )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                  {isLoading ? (
                                                      <LuLoaderCircle className="animate-spin text-indigo-500" size={20} />
                                                  ) : (
                                                      (pasto.kcal || 0).toFixed(1)
                                                  )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                  {isLoading ? (
                                                      <LuLoaderCircle className="animate-spin text-indigo-500" size={20} />
                                                  ) : (
                                                      (pasto.proteine || 0).toFixed(1)
                                                  )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                  {isLoading ? (
                                                      <LuLoaderCircle className="animate-spin text-indigo-500" size={20} />
                                                  ) : (
                                                      (pasto.carboidrati || 0).toFixed(1)
                                                  )}
                                                </td>
                                                <td className="px-6 py-4 rounded-r-lg text-gray-600">
                                                  {isLoading ? (
                                                      <LuLoaderCircle className="animate-spin text-indigo-500" size={20} />
                                                  ) : (
                                                      (pasto.lipidi || 0).toFixed(1)
                                                  )}
                                                </td>
                                            </tr>
                                            {pasto.id_ricetta && expandedRecipeIds[key] && pasto.ingredienti_riproporzionati && (
                                                <tr className="bg-white border-b border-gray-200">
                                                    <td colSpan="7" className="px-6 py-4">
                                                        <div className="bg-gray-50 rounded-md p-4 mt-2 mb-4">
                                                            <h4 className="font-semibold text-gray-700 mb-2">Ingredienti:</h4>
                                                            <ul className="list-disc list-inside text-sm text-gray-600">
                                                                {pasto.ingredienti_riproporzionati.map((ingrediente, i) => {
                                                                    const inputKey = `${dayIndex}-${mealIndex}-${i}`;
                                                                    const value = inputValues[inputKey] !== undefined 
                                                                        ? inputValues[inputKey]
                                                                        : (ingrediente.quantita_g || 0) > 0 
                                                                            ? (ingrediente.quantita_g || 0).toFixed(1).replace('.', ',')
                                                                            : '';
                                                                    return (
                                                                        <li key={i} className="flex items-center space-x-2 my-1">
                                                                            <span className="min-w-[150px]">{ingrediente.nome_ingrediente} - </span>
                                                                            <input
                                                                                type="text"
                                                                                value={value}
                                                                                onChange={(e) => handleIngredientQuantityChange(dayIndex, mealIndex, i, e.target.value)}
                                                                                className="w-20 p-1 border rounded text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                            />
                                                                            <span className="text-gray-500">{ingrediente.unita_di_misura}</span>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                        );
                                    })}
                                    {/* Riga totale giornaliero */}
                                    <tr className="bg-indigo-50 border-b border-gray-200 font-bold text-gray-800">
                                        <td colSpan="3" className="px-6 py-4 text-right rounded-l-lg">TOTALE GIORNO</td>
                                        <td className="px-6 py-4">{dailyTotals.kcal.toFixed(1)}</td>
                                        <td className="px-6 py-4">{dailyTotals.proteine.toFixed(1)}</td>
                                        <td className="px-6 py-4">{dailyTotals.carboidrati.toFixed(1)}</td>
                                        <td className="px-6 py-4 rounded-r-lg">{dailyTotals.grassi.toFixed(1)}</td>
                                    </tr>
                                    {/* Aggiungiamo un po' di spazio tra i giorni */}
                                    <tr className="h-4"></tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PianiNutrizionaliPage;
