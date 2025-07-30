import React from "react";

export default function GiornoRow({ giorno, info }) {
  return (
    <tr>
      <td>{giorno}</td>
      <td>{info.kcal_target}</td>
      <td>{info.proteina_pranzo}</td>
      <td>{info.proteina_cena}</td>
      <td>
        <div>
          <strong>Pranzo:</strong> {info.pasti?.pranzo?.ricetta || "N/A"}
        </div>
        <div>
          <strong>Cena:</strong> {info.pasti?.cena?.ricetta || "N/A"}
        </div>
      </td>
    </tr>
  );
}
