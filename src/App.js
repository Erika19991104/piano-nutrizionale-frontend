import React, { useState } from 'react';
import AlimentiPage from './components/AlimentiPage';
import PianiNutrizionaliPage from './components/PianiNutrizionaliPage';
import RicettePage from './components/RicettePage';
import ProfiliUtentePage from './components/ProfiliUtentePage';

// Il componente principale dell'applicazione
const App = () => {
    // Stato per la pagina attualmente visualizzata
    const [page, setPage] = useState('alimenti');

    // Funzione per aggiornare lo stato della pagina
    const navigateTo = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            {/* Barra di navigazione */}
            <nav className="bg-white shadow-md p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="text-2xl font-bold text-indigo-600">Pannello Nutrizionale</div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigateTo('alimenti')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                page === 'alimenti' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Alimenti
                        </button>
                        <button
                            onClick={() => navigateTo('piani-nutrizionali')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                page === 'piani-nutrizionali' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Piani Nutrizionali
                        </button>
                        <button
                            onClick={() => navigateTo('ricette')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                page === 'ricette' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Ricette
                        </button>
                        <button
                            onClick={() => navigateTo('profili-utente')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                page === 'profili-utente' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Profili Utente
                        </button>
                    </div>
                </div>
            </nav>

            {/* Contenuto principale in base alla pagina selezionata */}
            <main className="container mx-auto p-8">
                {page === 'alimenti' && <AlimentiPage />}
                {page === 'piani-nutrizionali' && <PianiNutrizionaliPage />}
                {page === 'ricette' && <RicettePage />}
                {page === 'profili-utente' && <ProfiliUtentePage />}
            </main>
        </div>
    );
};

export default App;
