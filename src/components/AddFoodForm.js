import React, { useState, useEffect } from 'react'; // Importa useEffect

const API_BASE_URL = 'http://127.0.0.1:8000'; // Assicurati che questa URL sia corretta

export default function AddFoodForm() {
    const [formData, setFormData] = useState({
        nome_alimento: '',
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

        const dataToSend = {};
        for (const key in formData) {
            if (formData[key] !== '') { // Invia solo i campi compilati
                dataToSend[key] = formData[key];
            } else {
                dataToSend[key] = null; // Invia null per i campi opzionali vuoti
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/alimenti/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ text: `Alimento "${result.nome_alimento}" aggiunto con successo!`, type: 'success' });
                setFormData({
                    nome_alimento: '',
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
            console.error('Errore durante l\'invio dell\'alimento:', error);
            setMessage({ text: 'Errore di rete o del server.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-section p-8 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center pb-4 border-b-2 border-blue-500">Inserisci Nuovo Alimento</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="alimentoNome" className="block text-sm font-medium text-gray-700 mb-1">Nome Alimento</label>
                    <input
                        type="text"
                        id="alimentoNome"
                        name="nome_alimento"
                        value={formData.nome_alimento}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                    />
                </div>
                <div>
                    <label htmlFor="alimentoCategoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opzionale)</label>
                    <input
                        type="text"
                        id="alimentoCategoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="alimentoKcal" className="block text-sm font-medium text-gray-700 mb-1">Kcal (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="alimentoKcal"
                            name="kcal"
                            value={formData.kcal}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="alimentoProteine" className="block text-sm font-medium text-gray-700 mb-1">Proteine (g) (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="alimentoProteine"
                            name="proteine"
                            value={formData.proteine}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="alimentoLipidi" className="block text-sm font-medium text-gray-700 mb-1">Lipidi (g) (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="alimentoLipidi"
                            name="lipidi"
                            value={formData.lipidi}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="alimentoCarboidrati" className="block text-sm font-medium text-gray-700 mb-1">Carboidrati (g) (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="alimentoCarboidrati"
                            name="carboidrati"
                            value={formData.carboidrati}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="alimentoFibra" className="block text-sm font-medium text-gray-700 mb-1">Fibra (g) (Opzionale)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="alimentoFibra"
                            name="fibra"
                            value={formData.fibra}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                </div>
                <div>
                    <button type="submit" className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md w-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center justify-center">
                                Caricamento... <div className="border-4 border-gray-200 border-l-white rounded-full w-5 h-5 animate-spin ml-2"></div>
                            </span>
                        ) : (
                            "Aggiungi Alimento"
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
