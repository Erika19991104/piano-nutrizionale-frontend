import React, { useState } from 'react';

const AddFoodForm = ({ onSuccess, onCancel }) => {
    // Stato per i dati del nuovo alimento da inviare
    const [newAlimento, setNewAlimento] = useState({
        nome_alimento: '',
        // ...gli altri campi
    });

    const handleSubmit = async (e) => {
        e.preventDefault(); // Impedisce il ricaricamento della pagina
        try {
            // Chiamata all'endpoint POST /api/alimenti/
            const response = await fetch('/api/alimenti/', {
                method: 'POST', // Specifica che è una richiesta POST
                headers: {
                    'Content-Type': 'application/json', // Dice al server che stiamo inviando JSON
                },
                body: JSON.stringify(newAlimento), // Converte i dati del form in una stringa JSON
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const createdAlimento = await response.json();
            console.log(`Alimento "${createdAlimento.nome_alimento}" creato con successo!`);
            // Chiama la funzione onSuccess che aggiorna la lista nella pagina principale
            onSuccess(); 
        } catch (e) {
            console.error("Errore nella creazione dell'alimento:", e);
            // Messaggio di errore
        }
    };
    
    return (
        // ...il form con l'attributo onSubmit={handleSubmit}
        <form onSubmit={handleSubmit} className="..."/>
    );
};

export default AddFoodForm;
