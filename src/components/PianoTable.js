import React from "react";
import GiornoRow from "./GiornoRow";

export default function PianoTable({ piano }) {
  return (
    <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "20px" }}>
      <thead>
        <tr>
          <th>Giorno</th>
          <th>Kcal Target</th>
          <th>Proteina Pranzo</th>
          <th>Proteina Cena</th>
          <th>Ricette Pranzo & Cena</th>
        </tr>
      </thead>
      <tbody>
        {piano &&
          Object.entries(piano).map(([giorno, info]) => (
            <GiornoRow key={giorno} giorno={giorno} info={info} />
          ))}
      </tbody>
    </table>
  );
}
