import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Assicurati che questa URL sia corretta

export default function AddRecipeForm() {
    const [formData, setFormData] = useState({
        nome: '',
        procedimento: '',
        puoi_sostituire: '',
        porzioni: '',
        pasto: '',
        proteina: '',
    });
    const [ingredients, setIngredients] = useState([{ nome_ingrediente: '', quantita_g: '' }]);
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

    const handleIngredientChange = (index, e) => {
        const { name, value, type } = e.target;
        const newIngredients = [...ingredients];
        newIngredients[index][name] = type === 'number' && value !== '' ? parseFloat(value) : value;
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        setIngredients(prev => [...prev, { nome_ingrediente: '', quantita_g: '' }]);
    };

    const removeIngredient = (index) => {
        if (ingredients.length > 1) {
            setIngredients(prev => prev.filter((_, i) => i !== index));
        } else {
            setMessage({ text: 'Una ricetta deve avere almeno un ingrediente.', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null); // Resetta il messaggio all'inizio di ogni submit

        // Validate ingredients
        const hasEmptyIngredient = ingredients.some(ing => ing.nome_ingrediente.trim() === '' || ing.quantita_g === '');
        if (hasEmptyIngredient) {
            setMessage({ text: 'Assicurati che tutti i campi degli ingredienti siano compilati.', type: 'error' });
            setLoading(false);
            return;
        }
        if (ingredients.length === 0) {
            setMessage({ text: 'Aggiungi almeno un ingrediente alla ricetta.', type: 'error' });
            setLoading(false);
            return;
        }

        const dataToSend = {
            ...formData,
            ingredienti: ingredients.map(ing => ({
                nome_ingrediente: ing.nome_ingrediente.trim(),
                quantita_g: ing.quantita_g
            }))
        };
        // Convert empty strings to null for optional fields
        for (const key in dataToSend) {
            if (dataToSend[key] === '') {
                dataToSend[key] = null;
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/ricette/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ text: `Ricetta "${result.nome}" aggiunta con successo!`, type: 'success' });
                setFormData({
                    nome: '',
                    procedimento: '',
                    puoi_sostituire: '',
                    porzioni: '',
                    pasto: '',
                    proteina: '',
                });
                setIngredients([{ nome_ingrediente: '', quantita_g: '' }]); // Reset ingredients
            } else {
                setMessage({ text: `Errore: ${result.detail || 'Qualcosa è andato storto.'}`, type: 'error' });
            }
        } catch (error) {
            console.error('Errore durante l\'invio della ricetta:', error);
            setMessage({ text: 'Errore di rete o del server.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-section p-8 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center pb-4 border-b-2 border-blue-500">Inserisci Nuova Ricetta</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="ricettaNome" className="block text-sm font-medium text-gray-700 mb-1">Nome Ricetta</label>
                    <input
                        type="text"
                        id="ricettaNome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                    />
                </div>
                <div>
                    <label htmlFor="ricettaProcedimento" className="block text-sm font-medium text-gray-700 mb-1">Procedimento (Opzionale)</label>
                    <textarea
                        id="ricettaProcedimento"
                        name="procedimento"
                        rows="3"
                        value={formData.procedimento}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="ricettaSostituire" className="block text-sm font-medium text-gray-700 mb-1">Puoi Sostituire (Opzionale)</label>
                    <input
                        type="text"
                        id="ricettaSostituire"
                        name="puoi_sostituire"
                        value={formData.puoi_sostituire}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="ricettaPorzioni" className="block text-sm font-medium text-gray-700 mb-1">Porzioni (Opzionale)</label>
                        <input
                            type="number"
                            step="1"
                            id="ricettaPorzioni"
                            name="porzioni"
                            value={formData.porzioni}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="ricettaPasto" className="block text-sm font-medium text-gray-700 mb-1">Pasto (Opzionale)</label>
                        <input
                            type="text"
                            id="ricettaPasto"
                            name="pasto"
                            value={formData.pasto}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="ricettaProteina" className="block text-sm font-medium text-gray-700 mb-1">Proteina (Opzionale)</label>
                        <input
                            type="text"
                            id="ricettaProteina"
                            name="proteina"
                            value={formData.proteina}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">Ingredienti</h3>
                    <div className="space-y-3">
                        {ingredients.map((ingredient, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Nome Ingrediente"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out flex-grow"
                                    name="nome_ingrediente"
                                    value={ingredient.nome_ingrediente}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    required
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Quantità (g)"
                                    className="w-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                                    name="quantita_g"
                                    value={ingredient.quantita_g}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300 ease-in-out flex-shrink-0"
                                    onClick={() => removeIngredient(index)}
                                >
                                    Rimuovi
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addIngredient} className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out">
                        Aggiungi Ingrediente
                    </button>
                </div>

                <div>
                    <button type="submit" className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md w-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center justify-center">
                                Caricamento... <div className="border-4 border-gray-200 border-l-white rounded-full w-5 h-5 animate-spin ml-2"></div>
                            </span>
                        ) : (
                            "Aggiungi Ricetta"
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
