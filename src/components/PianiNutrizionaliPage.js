import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// URL di base per le API
const API_BASE_URL = '/api';

const NutritionalTrackerPage = () => {
  const [userId, setUserId] = useState('5c5c0250-34fb-489d-8f1f-f0d96daa05d8');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weeklyStartDate, setWeeklyStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).toISOString().split('T')[0]
  );

  const [dailyTotals, setDailyTotals] = useState(null);
  const [dailyMealMacros, setDailyMealMacros] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [weeklyData, setWeeklyData] = useState(null);
  const [alimenti, setAlimenti] = useState([]);
  const [ricette, setRicette] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Stato per l'ordinamento della tabella
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' per ascendente, 'desc' per discendente

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();
  const tipoSelezionato = useWatch({
    control,
    name: 'tipo',
    defaultValue: 'alimento',
  });

  // Funzioni di fetching memorizzate con useCallback
  const fetchDailyData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/consumi/${userId}/${selectedDate}/totali`);
      if (!res.ok) {
        throw new Error('Errore nel recupero dei dati giornalieri.');
      }
      const data = await res.json();
      setDailyTotals(data.totali_macro_giornalieri);
    } catch (err) {
      setError(err.message);
      console.error(err);
      setDailyTotals(null);
      throw err;
    }
  }, [userId, selectedDate]);

  const fetchDailyMealMacros = useCallback(async () => {
    try {
      const macrosRes = await fetch(`${API_BASE_URL}/consumi/${userId}/${selectedDate}/macro_pasto`);
      if (!macrosRes.ok) {
        throw new Error('Errore nel recupero dei dati macro per pasto.');
      }
      const macrosData = await macrosRes.json();
      setDailyMealMacros(macrosData); 
    } catch (err) {
      setError(err.message);
      console.error(err);
      setDailyMealMacros([]);
      throw err;
    }
  }, [userId, selectedDate]);
  
  const fetchDailySummary = useCallback(async () => {
    try {
      const summaryRes = await fetch(`${API_BASE_URL}/consumi/${userId}/${selectedDate}/riepilogo`);
      if (!summaryRes.ok) {
        throw new Error('Errore nel recupero del riepilogo dettagliato.');
      }
      const summaryData = await summaryRes.json();
      setDailySummary(summaryData);
    } catch (err) {
      setError(err.message);
      console.error(err);
      setDailySummary([]);
      throw err;
    }
  }, [userId, selectedDate]);

  const fetchWeeklyData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/consumi/${userId}/settimanale?start_date=${weeklyStartDate}`);
      if (!res.ok) {
        throw new Error('Errore nel recupero dei dati settimanali.');
      }
      const data = await res.json();
      setWeeklyData(data.totali_settimanali);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId, weeklyStartDate]);

  const fetchAlimenti = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/alimenti/`);
      const data = await res.json();
      setAlimenti(data);
    } catch (err) {
      console.error("Errore nel recupero degli alimenti:", err);
    }
  }, []);

  const fetchRicette = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/ricette/`);
      const data = await res.json();
      setRicette(data);
    } catch (err) {
      console.error("Errore nel recupero delle ricette:", err);
    }
  }, []);

  // Funzione unificata per il fetching di tutti i dati
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchDailyData(),
        fetchDailyMealMacros(),
        fetchDailySummary(),
        fetchWeeklyData(),
        fetchAlimenti(),
        fetchRicette(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore sconosciuto.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchDailyData, fetchDailyMealMacros, fetchDailySummary, fetchWeeklyData, fetchAlimenti, fetchRicette]);

  // useEffect che si attiva al cambio di data o inizio settimana
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, selectedDate, weeklyStartDate]);

  // Funzione per l'invio del form, con la correzione del payload
  const onSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    let payload;
    
    if (data.tipo === 'alimento') {
      payload = {
        user_id: userId,
        giorno: selectedDate,
        pasto: data.pasto,
        alimento_id: data.nome,
        quantita_g: data.quantita,
        ricetta_id: null,
        quantita: null,
      };
    } else if (data.tipo === 'ricetta') {
      payload = {
        user_id: userId,
        giorno: selectedDate,
        pasto: data.pasto,
        ricetta_id: data.nome,
        quantita: data.quantita,
        alimento_id: null,
        quantita_g: null,
      };
    }
    console.log(payload)
    try {
      const res = await fetch(`${API_BASE_URL}/consumi/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Errore durante l'inserimento: ${errorData.detail}`);
      }
      
      await fetchAllData();
      
      setSuccess("Consumo registrato con successo!");
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore sconosciuto.");
      setSuccess(null);
    } finally {
      setIsSaving(false);
    }
  };

  const macroColors = {
    proteine: '#34d399',
    carboidrati: '#60a5fa',
    lipidi: '#facc15',
    fibra: '#c084fc',
    // Colori per il grafico a torta
    colazione: '#facc15',
    pranzo: '#60a5fa',
    cena: '#34d399',
    spuntino: '#c084fc',
  };

  // Funzione per gestire il clic sull'intestazione di colonna del pasto
  const handleSortByPasto = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  // Logica per l'ordinamento dell'array prima del rendering
  const pastoOrder = ['colazione', 'pranzo', 'merenda', 'cena', 'spuntino'];
  
  const sortedDailySummary = [...dailySummary].sort((a, b) => {
      const aIndex = pastoOrder.indexOf(a.pasto.toLowerCase());
      const bIndex = pastoOrder.indexOf(b.pasto.toLowerCase());

      if (sortOrder === 'asc') {
          return aIndex - bIndex;
      } else {
          return bIndex - aIndex;
      }
  });

  // Logica per raggruppare i dati e calcolare i totali per pasto
  const groupedSummary = sortedDailySummary.reduce((acc, item) => {
    const { pasto, kcal, proteine, lipidi, carboidrati } = item;
    
    if (!acc[pasto]) {
      acc[pasto] = {
        items: [],
        totals: { kcal: 0, proteine: 0, lipidi: 0, carboidrati: 0 }
      };
    }

    acc[pasto].items.push(item);
    acc[pasto].totals.kcal += parseFloat(kcal);
    acc[pasto].totals.proteine += parseFloat(proteine);
    acc[pasto].totals.lipidi += parseFloat(lipidi);
    acc[pasto].totals.carboidrati += parseFloat(carboidrati);
    
    return acc;
  }, {});


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-gray-800 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-indigo-700">
          Gestione Piano Nutrizionale
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <label htmlFor="userId" className="font-semibold text-gray-700">User ID:</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="dailyDate" className="font-semibold text-gray-700">Giorno:</label>
            <input
              id="dailyDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
            <p className="font-semibold">Errore:</p>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md">
            <p className="font-semibold">Successo:</p>
            <p>{success}</p>
          </div>
        )}

        {/* Sezione Consumi Giornalieri */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Riepilogo Consumi Giornalieri ({selectedDate})
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-indigo-600">
              <span className="text-xl animate-pulse">⟳</span>
              <span className="text-xl">Caricamento dati...</span>
            </div>
          ) : (
            <>
              {dailyTotals && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 text-center">
                  <div className="bg-blue-50 p-4 rounded-md shadow-sm">
                    <p className="font-bold text-lg text-blue-700">Kcal</p>
                    <p className="text-xl">{dailyTotals.kcal.toFixed(1)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md shadow-sm">
                    <p className="font-bold text-lg text-green-700">Proteine (g)</p>
                    <p className="text-xl">{dailyTotals.proteine.toFixed(1)}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-md shadow-sm">
                    <p className="font-bold text-lg text-yellow-700">Lipidi (g)</p>
                    <p className="text-xl">{dailyTotals.lipidi.toFixed(1)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-md shadow-sm">
                    <p className="font-bold text-lg text-blue-700">Carboidrati (g)</p>
                    <p className="text-xl">{dailyTotals.carboidrati.toFixed(1)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-md shadow-sm">
                    <p className="font-bold text-lg text-purple-700">Fibra (g)</p>
                    <p className="text-xl">{dailyTotals.fibra.toFixed(1)}</p>
                  </div>
                </div>
              )}

              {/* Tabella Riepilogo dettagliato */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Dettaglio Consumi ({selectedDate})
                </h3>
                {dailySummary && dailySummary.length > 0 ? (
                  <div className="overflow-x-auto rounded-md shadow-md">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                          <th 
                            scope="col" 
                            className="cursor-pointer px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                            onClick={handleSortByPasto}
                          >
                            Pasto
                            <span className="ml-2">
                                {sortOrder === 'asc' ? '▲' : '▼'}
                            </span>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quantità</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kcal</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Proteine</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lipidi</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Carboidrati</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {Object.entries(groupedSummary).map(([pastoName, data]) => (
                          <React.Fragment key={pastoName}>
                            {/* Mappa gli item del pasto */}
                            {data.items.map((item, index) => (
                              <tr key={`${pastoName}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">{item.tipo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{item.pasto}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{item.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">{item.quantita !== null ? item.quantita.toFixed(0) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">{item.kcal !== null ? item.kcal.toFixed(2) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">{item.proteine !== null ? item.proteine.toFixed(2) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">{item.lipidi !== null ? item.lipidi.toFixed(2) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">{item.carboidrati !== null ? item.carboidrati.toFixed(2) : 'N/A'}</td>
                              </tr>
                            ))}
                            
                            {/* Riga dei totali per pasto */}
                            <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
                              <td colSpan="4" className="px-6 py-2 text-right text-sm text-gray-800 dark:text-gray-200 uppercase">Totale {pastoName}:</td>
                              <td className="px-6 py-2 text-right text-sm text-gray-800 dark:text-gray-200">{data.totals.kcal.toFixed(2)}</td>
                              <td className="px-6 py-2 text-right text-sm text-gray-800 dark:text-gray-200">{data.totals.proteine.toFixed(2)}</td>
                              <td className="px-6 py-2 text-right text-sm text-gray-800 dark:text-gray-200">{data.totals.lipidi.toFixed(2)}</td>
                              <td className="px-6 py-2 text-right text-sm text-gray-800 dark:text-gray-200">{data.totals.carboidrati.toFixed(2)}</td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Nessun dettaglio di consumo trovato per questo giorno.</p>
                )}
              </div>

              {/* Grafico a barre per la distribuzione dei macro per pasto */}
              {dailyMealMacros && dailyMealMacros.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-700">
                    Distribuzione Macro per Pasto
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyMealMacros}>
                      <XAxis dataKey="pasto" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="proteine" fill={macroColors.proteine} name="Proteine" />
                      <Bar dataKey="carboidrati" fill={macroColors.carboidrati} name="Carboidrati" />
                      <Bar dataKey="lipidi" fill={macroColors.lipidi} name="Lipidi" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 italic">Nessun dato sui pasti disponibile per questa data.</p>
              )}
              
              {/* Grafico a torta per la distribuzione delle Kcal per pasto */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Distribuzione Kcal per Pasto
                </h3>
                {dailyMealMacros && dailyMealMacros.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={dailyMealMacros}
                        dataKey="kcal"
                        nameKey="pasto"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {dailyMealMacros.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={macroColors[entry.pasto]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 italic">Nessun dato sulle calorie per pasto disponibile.</p>
                )}
              </div>

            </>
          )}
        </div>

        {/* Sezione Inserimento Consumo */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Aggiungi un Nuovo Consumo
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  {...register('tipo', { required: 'Il tipo è obbligatorio' })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="alimento">Alimento</option>
                  <option value="ricetta">Ricetta</option>
                </select>
                {errors.tipo && <span className="text-red-500 text-sm">{errors.tipo.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <select
                  {...register('nome', { required: 'Il nome è obbligatorio', valueAsNumber: true })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Seleziona...</option>
                  {tipoSelezionato === 'alimento'
                    ? alimenti.map((item) => (
                      <option key={item.id_alimento} value={item.id_alimento}>
                        {item.nome_alimento}
                      </option>
                    ))
                    : ricette.map((item) => (
                      <option key={item.ricetta_id} value={item.ricetta_id}>
                        {item.nome}
                      </option>
                    ))}
                </select>
                {errors.nome && <span className="text-red-500 text-sm">{errors.nome.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantità ({tipoSelezionato === 'alimento' ? 'g' : 'porzioni'})</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('quantita', { required: 'La quantità è obbligatoria', valueAsNumber: true })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.quantita && <span className="text-red-500 text-sm">{errors.quantita.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pasto</label>
                <select
                  {...register('pasto', { required: 'Il pasto è obbligatorio' })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="colazione">Colazione</option>
                  <option value="pranzo">Pranzo</option>
                  <option value="cena">Cena</option>
                  <option value="spuntino">Spuntino</option>
                </select>
                {errors.pasto && <span className="text-red-500 text-sm">{errors.pasto.message}</span>}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
                ${isSaving ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Salvataggio...
                </>
              ) : (
                <>
                  <span className="mr-2">✔️</span>
                  Aggiungi Consumo
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sezione Macro Settimanali */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Macro Settimanali
          </h2>
          <div className="flex items-center space-x-2 mb-4">
            <label htmlFor="weeklyDate" className="font-semibold text-gray-700">Inizio Settimana:</label>
            <input
              id="weeklyDate"
              type="date"
              value={weeklyStartDate}
              onChange={(e) => setWeeklyStartDate(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-indigo-600">
              <span className="text-xl animate-pulse">⟳</span>
              <span className="text-xl">Caricamento dati...</span>
            </div>
          ) : (
            <>
              {weeklyData && Object.keys(weeklyData).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={Object.entries(weeklyData).map(([day, macros]) => ({
                    day: day,
                    ...macros,
                  }))}
                  >
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="kcal" stroke="#3b82f6" name="Kcal" />
                    <Line type="monotone" dataKey="proteine" stroke={macroColors.proteine} name="Proteine" />
                    <Line type="monotone" dataKey="carboidrati" stroke={macroColors.carboidrati} name="Carboidrati" />
                    <Line type="monotone" dataKey="lipidi" stroke={macroColors.lipidi} name="Lipidi" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 italic">Nessun dato settimanale disponibile per questo periodo.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionalTrackerPage;