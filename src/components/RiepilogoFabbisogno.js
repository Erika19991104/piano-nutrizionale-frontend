import React from 'react';

export default function RiepilogoFabbisogno({ dati }) {
  if (!dati) return null;
  const r = dati.riepilogo_fabbisogno;
  return (
    <div>
      <h3>Riepilogo Fabbisogno</h3>
      <ul>
        <li><strong>BMI:</strong> {r.BMI}</li>
        <li><strong>Peso ideale:</strong> {r.Peso_ideale} kg</li>
        <li><strong>Metabolismo basale:</strong> {r.Metabolismo_basale} kcal</li>
        <li><strong>LAF:</strong> {r.LAF}</li>
        <li><strong>Metabolismo totale giornaliero:</strong> {r.Metabolismo_totale_giornaliero} kcal</li>
        <li><strong>Deficit calorico impostato:</strong> {r.Deficit_calorico_impostato} kcal</li>
        <li><strong>Fabbisogno proteine (g):</strong> {r.Fabbisogno_proteine_g.min} - {r.Fabbisogno_proteine_g.max}</li>
        <li><strong>Fabbisogno carboidrati (g):</strong> {r.Fabbisogno_carboidrati_g.min} - {r.Fabbisogno_carboidrati_g.max}</li>
        <li><strong>Fabbisogno grassi (g):</strong> {r.Fabbisogno_grassi_g.min} - {r.Fabbisogno_grassi_g.max}</li>
      </ul>
    </div>
  );
}
