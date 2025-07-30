import React from 'react';

export default function PianoSettimanaleOutput({ dati }) {
  if (!dati) return null;
  const piano = dati.piano_settimanale;

  console.log("Dati ricevuti in output: ", dati);

  return (
    <div>
      <h3>Piano Settimanale</h3>
      {Object.entries(piano).map(([giorno, dettagli]) => (
        <div key={giorno} style={{ border: '1px solid #ccc', marginBottom: '15px', padding: '10px' }}>
          <h4>{giorno.charAt(0).toUpperCase() + giorno.slice(1)}</h4>
          <p><strong>Kcal target:</strong> {dettagli.kcal_target}</p>
          <p><strong>Proteina pranzo:</strong> {dettagli.proteina_pranzo}</p>
          <p><strong>Proteina cena:</strong> {dettagli.proteina_cena}</p>
          {dettagli.totale_kcal_target && (
  <p><strong>Totale kcal target:</strong> {dettagli.totale_kcal_target}</p>
)}
{dettagli.totale_kcal_ripartito && (
  <p><strong>Totale kcal ripartito:</strong> {dettagli.totale_kcal_ripartito}</p>
)}


          <h5>Pasti</h5>

          {dettagli.pasti.errore ? (
            <p style={{ color: 'red' }}>Errore: {dettagli.pasti.errore}</p>
          ) : (
            Object.entries(dettagli.pasti).map(([pastoNome, pasto]) => (
              <div key={pastoNome} style={{ marginBottom: '10px' }}>
                <strong>{pastoNome.charAt(0).toUpperCase() + pastoNome.slice(1)}</strong>: {pasto.ricetta || 'N/A'}
                
                {Array.isArray(pasto.ingredienti) && (
                  <ul>
                    {pasto.ingredienti.map((ingrediente, i) => (
                      <li key={i}>
                        {ingrediente.nome} - {ingrediente.quantita_g.toFixed(1)} g, kcal: {ingrediente.macro.kcal.toFixed(1)}, 
                        proteine: {ingrediente.macro.proteine.toFixed(1)} g, lipidi: {ingrediente.macro.lipidi.toFixed(1)} g, 
                        carboidrati: {ingrediente.macro.carboidrati.toFixed(1)} g
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}

          {/* Frutta e verdura, solo se presenti */}
          {dettagli.pasti?.pranzo?.verdura && (
            <p><strong>Verdura pranzo:</strong> {dettagli.pasti.pranzo.verdura.nome} ({dettagli.pasti.pranzo.verdura.quantita} g)</p>
          )}
          {dettagli.pasti?.pranzo?.frutta && (
            <p><strong>Frutta pranzo:</strong> {dettagli.pasti.pranzo.frutta.nome} ({dettagli.pasti.pranzo.frutta.quantita} g)</p>
          )}
          {dettagli.pasti?.cena?.verdura && (
            <p><strong>Verdura cena:</strong> {dettagli.pasti.cena.verdura.nome} ({dettagli.pasti.cena.verdura.quantita} g)</p>
          )}
          {dettagli.pasti?.cena?.frutta && (
            <p><strong>Frutta cena:</strong> {dettagli.pasti.cena.frutta.nome} ({dettagli.pasti.cena.frutta.quantita} g)</p>
          )}
        </div>
      ))}
    </div>
  );
}
