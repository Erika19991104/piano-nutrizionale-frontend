import React, { useState } from "react";

export default function PianoSettimanaleForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    eta: "",
    peso: "",
    altezza: "",
    sesso: "",
    attivita: "",
    deficit_giornaliero: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="eta" placeholder="Età" value={formData.eta} onChange={handleChange} required />
      <input name="peso" placeholder="Peso (kg)" value={formData.peso} onChange={handleChange} required />
      <input name="altezza" placeholder="Altezza (cm)" value={formData.altezza} onChange={handleChange} required />
      <select name="sesso" value={formData.sesso} onChange={handleChange} required>
        <option value="">Sesso</option>
        <option value="M">Maschio</option>
        <option value="F">Femmina</option>
      </select>
      <input name="attivita" placeholder="Livello attività" value={formData.attivita} onChange={handleChange} required />
      <input
        name="deficit_giornaliero"
        placeholder="Deficit giornaliero"
        value={formData.deficit_giornaliero}
        onChange={handleChange}
        required
      />
      <button type="submit">Calcola Piano</button>
    </form>
  );
}
