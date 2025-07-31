import React, { useState, useEffect } from 'react'; // Importa useEffect

const API_BASE_URL = 'http://127.0.0.1:8000'; // Assicurati che questa URL sia corretta

export default function EditFoodForm() {
    const [nomeAlimentoToModify, setNomeAlimentoToModify] = useState('');
    const [formData, setFormData] = useState({
        categoria: '',
        kcal: '',
        proteine: '',
        lipidi: '',
        carboidrati: '',
        fibra: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { text, type: 'success' | 'error' }

    // Effetto per nascondere automaticamente i messaggi dopo un certo tempo
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 5000); // Nasconde il messaggio dopo 5 secondi
            return () => clearTimeout(timer); // Pulisce il timer se il componente si smonta o il messaggio cambia
        }
    }, [message]);

    const handleNomeAlimentoChange = (e) => {
        setNomeAlimentoToModify(e.target.value);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' && value !== '' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null); // Resetta il messaggio all'inizio di ogni submit

        if (!nomeAlimentoToModify.trim()) {
            setMessage({ text: 'Inserisci il nome dell\'alimento da modificare.', type: 'error' });
            setLoading(false);
            return;
        }

        const dataToUpdate = {};
        for (const key in formData) {
            if (formData[key] !== '') {
                dataToUpdate[key] = formData[key];
            }
        }

        if (Object.keys(dataToUpdate).length === 0) {
            setMessage({ text: 'Nessun campo da aggiornare. Compila almeno un campo.', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/alimenti/${encodeURIComponent(nomeAlimentoToModify)}`, {
                method: 'PUT', // Ho mantenuto PUT come nel tuo endpoint FastAPI, se il backend supporta PATCH per aggiornamenti parziali, puoi cambiarlo.
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToUpdate)
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ text: `Alimento "${result.nome_alimento}" modificato con successo!`, type: 'success' });
                setNomeAlimentoToModify('');
                setFormData({
                    categoria: '',
                    kcal: '',
                    proteine: '',
                    lipidi: '',
                    carboidrati: '',
                    fibra: ''
                });
            } else {
                setMessage({ text: `Errore: ${result.detail || 'Qualcosa è andato storto.'}`, type: 'error' });
            }
        } catch (error) {
            console.error('Errore durante la modifica dell\'alimento:', error);
            setMessage({ text: 'Errore di rete o del server.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-section p-8 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center pb-4 border-b-2 border-blue-500">Modifica Alimento Esistente</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="modAlimentoNome" className="block text-sm font-medium text-gray-700 mb-1">Nome Alimento da Modificare</label>
                    <input
                        type="text"
                        id="modAlimentoNome"
                        name="nome_alimento_to_modify"
                        value={nomeAlimentoToModify}
                        onChange={handleNomeAlimentoChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                    />
                </div>
                <p className="text-sm text-gray-600">Inserisci solo i campi che vuoi modificare. Lascia vuoti gli altri.</p>
                <div>
                    <label htmlFor="modAlimentoCategoria" className="block text-sm font-medium text-gray-700 mb-1">Nuova Categoria (Opzionale)</label>
                    <input
                        type="text"
                        id="modAlimentoCategoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="modAlimentoKcal" className="block text-sm font-medium text-gray-700 mb-1">Nuove Kcal (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="modAlimentoKcal"
                            name="kcal"
                            value={formData.kcal}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="modAlimentoProteine" className="block text-sm font-medium text-gray-700 mb-1">Nuove Proteine (g) (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="modAlimentoProteine"
                            name="proteine"
                            value={formData.proteine}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="modAlimentoLipidi" className="block text-sm font-medium text-gray-700 mb-1">Nuovi Lipidi (g) (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="modAlimentoLipidi"
                            name="lipidi"
                            value={formData.lipidi}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="modAlimentoCarboidrati" className="block text-sm font-medium text-gray-700 mb-1">Nuovi Carboidrati (g) (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="modAlimentoCarboidrati"
                            name="carboidrati"
                            value={formData.carboidrati}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="modAlimentoFibra" className="block text-sm font-medium text-gray-700 mb-1">Nuova Fibra (g) (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="modAlimentoFibra"
                            name="fibra"
                            value={formData.fibra}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                </div>
                <div>
                    <button type="submit" className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out shadow-md w-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center justify-center">
                                Caricamento... <div className="border-4 border-gray-200 border-l-white rounded-full w-5 h-5 animate-spin ml-2"></div>
                            </span>
                        ) : (
                            "Modifica Alimento"
                        )}
                    </button>
                </div>
                {message && (
                    <div className={`p-4 mt-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
}
