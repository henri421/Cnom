import React from 'react';
import { FaceBeton, ResultatFace } from '../types';

interface Props {
  face: FaceBeton;
  resultat: ResultatFace;
}

/**
 * Coupe schematique au droit du parement : enrobage cote (cmin, Δcdev, cnom)
 * jusqu'au nu de la barre la plus proche. Echelle adaptee a la valeur de cnom.
 */
export const Coupe: React.FC<Props> = ({ face, resultat }) => {
  const e = resultat.enrobage;
  const x0 = 70; // parement
  const yHaut = 44;
  const yBas = 176;
  const largeurUtile = 190;
  const phi = e.diametreEquivalentMm;
  const s = largeurUtile / Math.max(e.cnomRetenu + phi * 1.6, 30);
  const xCmin = x0 + e.cminMajore * s;
  const xDev = x0 + (e.cminMajore + e.deltaCDev) * s;
  const xCnom = x0 + e.cnomRetenu * s;
  const r = Math.max((phi / 2) * s, 4);
  const yBarre = (yHaut + yBas) / 2;
  const contreTerrain = face.betonnageContreTerrain !== 'non';

  const cote = (xa: number, xb: number, y: number, texte: string, forte = false, aDroite = false) => {
    const classe = forte ? 'cote-forte' : 'cote';
    return (
      <g>
        <line className={classe} x1={xa} y1={y} x2={xb} y2={y} />
        {[xa, xb].map((x) => (
          <line key={x} className={classe} x1={x - 3} y1={y + 3} x2={x + 3} y2={y - 3} />
        ))}
        <text
          className={forte ? 'fort' : undefined}
          x={aDroite ? xb + 6 : (xa + xb) / 2}
          y={aDroite ? y + 4 : y - 5}
          textAnchor={aDroite ? 'start' : 'middle'}
        >
          {texte}
        </text>
      </g>
    );
  };

  return (
    <figure className="coupe" aria-label="coupe sur l’enrobage">
      <svg viewBox="0 0 360 232" role="img">
        {contreTerrain && (
          <g>
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} className="terrain" x1={x0 - 40} y1={yHaut + 12 + i * 15} x2={x0 - 4} y2={yHaut + i * 15 - 6} />
            ))}
            <text className="etiquette" x={x0 - 22} y={yHaut - 6} textAnchor="middle">
              terrain
            </text>
          </g>
        )}
        <rect className="beton" x={x0} y={yHaut} width={340 - x0} height={yBas - yHaut} />
        <rect className="tolerance" x={xCmin} y={yHaut} width={Math.max(xDev - xCmin, 0)} height={yBas - yHaut} />
        <line className="parement" x1={x0} y1={yHaut - 6} x2={x0} y2={yBas + 6} />

        <line className="rappel" x1={xCmin} y1={14} x2={xCmin} y2={yHaut} />
        <line className="rappel" x1={xDev} y1={14} x2={xDev} y2={yHaut} />
        <line className="rappel" x1={xCnom} y1={yBarre} x2={xCnom} y2={yBas + 26} />

        <circle className="barre-acier" cx={xCnom + r} cy={yBarre} r={r} />
        <circle className="barre-coeur" cx={xCnom + r} cy={yBarre} r={1.6} />
        <text x={xCnom + 2 * r + 6} y={yBarre + 4}>
          Ø{phi}
        </text>

        {cote(x0, xCmin, 26, `cmin ${e.cminMajore}`)}
        {e.deltaCDev > 0 && cote(xCmin, xDev, 26, `Δcdev ${e.deltaCDev}`, false, true)}
        {cote(x0, xCnom, yBas + 22, `cnom ${e.cnomRetenu} mm`, true)}

        <text className="etiquette" x={x0} y={yBas + 46} textAnchor="middle">
          parement
        </text>
      </svg>
      <figcaption className="note">
        Cotes en mm jusqu’au nu de la barre la plus proche du parement (cadres compris). Zone tiretée : tolérance
        d’exécution Δcdev.
      </figcaption>
    </figure>
  );
};
