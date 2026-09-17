import React from 'react';
import { ResultatCalculElement, ElementBeton } from '../types';

interface Props {
  element: ElementBeton;
  resultat: ResultatCalculElement;
}

export const TechnicalSvgDiagram: React.FC<Props> = ({ element, resultat }) => {
  const { enrobage, modificateurs } = resultat;
  const phi = element.diametreBarreMm;
  const cnom = enrobage.cnom;
  const cminDur = enrobage.cminDur;
  const deltaCdev = enrobage.deltaCDev;

  // Visual scaling: scale so cnom + phi fits nicely in viewBox
  const isDalle = element.typeElement === 'dalle';

  return (
    <div id="technical-diagram-card" className="bg-white border border-zinc-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Schéma de principe en coupe
          </span>
          <h4 className="text-sm font-medium text-zinc-900">
            {isDalle ? 'Enrobage dalle (face inférieure ou supérieure)' : 'Enrobage voile (parement extérieur/intérieur)'}
          </h4>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
          Échelle indicative
        </span>
      </div>

      <div className="relative w-full aspect-[16/9] max-h-64 flex items-center justify-center bg-zinc-50/60 rounded border border-zinc-100 overflow-hidden">
        <svg
          viewBox="0 0 540 280"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Concrete hatch pattern */}
            <pattern id="concreteHatch" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 0,16 l 16,-16 M 6,22 l 16,-16 M -6,10 l 16,-16" stroke="#e4e4e7" strokeWidth="1" />
              <circle cx="4" cy="4" r="0.75" fill="#a1a1aa" />
              <circle cx="12" cy="11" r="0.75" fill="#a1a1aa" />
            </pattern>
            {/* Rebar rib pattern */}
            <pattern id="rebarRib" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.5" />
            </pattern>
            {/* Arrow markers */}
            <marker id="arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 10 0 L 0 5 L 10 10 z" fill="#0284c7" />
            </marker>
            <marker id="arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
            </marker>
            <marker id="arrow-sub-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 10 0 L 0 5 L 10 10 z" fill="#71717a" />
            </marker>
            <marker id="arrow-sub-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
            </marker>
          </defs>

          {/* Background Concrete Block */}
          <rect x="40" y="40" width="340" height="200" fill="#fafafa" stroke="#d4d4d8" strokeWidth="1.5" />
          <rect x="40" y="40" width="340" height="200" fill="url(#concreteHatch)" />

          {/* Concrete outer face (the exposed face being calculated) */}
          <line x1="40" y1="30" x2="40" y2="250" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" />
          <text x="32" y="26" fill="#18181b" fontSize="11" fontWeight="600" textAnchor="start" fontFamily="system-ui">
            Parement exposé ({element.nom})
          </text>

          {/* Environment side arrow/label */}
          <text x="18" y="140" fill="#71717a" fontSize="11" fontWeight="500" textAnchor="middle" transform="rotate(-90 18 140)">
            Milieu ambiant ({enrobage.classeDeterminante})
          </text>

          {/* Theoretical position of bar center and radius */}
          {/* Base offset = 40 (parement), cnom scaled: let scale = 2.4 px/mm */}
          {/* Clamped for visual clarity */}
          {(() => {
            const pxPerMm = Math.min(2.8, Math.max(1.8, 140 / (cnom + phi)));
            const cnomPx = cnom * pxPerMm;
            const rPx = (phi / 2) * pxPerMm;
            const barCx = 40 + cnomPx + rPx;
            const barCy = 140;

            const cminDurPx = cminDur * pxPerMm;
            const deltaDevPx = deltaCdev * pxPerMm;

            return (
              <g>
                {/* Stirrup/cadre indicative wire */}
                <rect
                  x={40 + cnomPx - 3}
                  y="65"
                  width="180"
                  height="150"
                  rx="6"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Longitudinal rebar */}
                <circle
                  cx={barCx}
                  cy={barCy}
                  r={Math.max(12, rPx)}
                  fill="#09090b"
                  stroke="#d97706"
                  strokeWidth="2.5"
                />
                <circle
                  cx={barCx}
                  cy={barCy}
                  r={Math.max(10, rPx - 2)}
                  fill="#fef3c7"
                  opacity="0.25"
                />
                {/* Cross mark inside rebar center */}
                <line x1={barCx - 4} y1={barCy} x2={barCx + 4} y2={barCy} stroke="#d97706" strokeWidth="1" />
                <line x1={barCx} y1={barCy - 4} x2={barCx} y2={barCy + 4} stroke="#d97706" strokeWidth="1" />

                {/* Bar diameter dimension */}
                <line x1={barCx} y1={barCy - Math.max(12, rPx) - 16} x2={barCx} y2={barCy - Math.max(12, rPx) - 2} stroke="#a1a1aa" strokeWidth="1" />
                <text x={barCx} y={barCy - Math.max(12, rPx) - 20} fill="#b45309" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="monospace">
                  ∅ {phi} mm
                </text>

                {/* Secondary longitudinal bar behind */}
                <circle
                  cx={barCx + 90}
                  cy={barCy}
                  r={Math.max(12, rPx)}
                  fill="#27272a"
                  stroke="#d97706"
                  strokeWidth="2"
                  opacity="0.4"
                />

                {/* --- DIMENSION LINES --- */}
                {/* 1. Main cnom dimension (Top dimension line) */}
                <line x1="40" y1="70" x2="40" y2="45" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1={40 + cnomPx} y1={barCy - Math.max(12, rPx)} x2={40 + cnomPx} y2="45" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                
                <line
                  x1="44"
                  y1="52"
                  x2={40 + cnomPx - 4}
                  y2="52"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  markerStart="url(#arrow-start)"
                  markerEnd="url(#arrow-end)"
                />
                <rect x={(80 + cnomPx) / 2 - 32} y="38" width="64" height="18" fill="#ffffff" rx="3" stroke="#0284c7" strokeWidth="1" />
                <text
                  x={(80 + cnomPx) / 2}
                  y="51"
                  fill="#0369a1"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  cnom = {cnom} mm
                </text>

                {/* 2. Sub-breakdown: cmin,dur & delta_cdev (Bottom dimension line) */}
                <line x1="40" y1="210" x2="40" y2="235" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="2 2" />
                <line x1={40 + cminDurPx} y1="180" x2={40 + cminDurPx} y2="235" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="2 2" />
                <line x1={40 + cnomPx} y1="180" x2={40 + cnomPx} y2="235" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="2 2" />

                {/* cmin,dur arrow */}
                <line
                  x1="44"
                  y1="228"
                  x2={40 + cminDurPx - 3}
                  y2="228"
                  stroke="#52525b"
                  strokeWidth="1.2"
                  markerStart="url(#arrow-sub-start)"
                  markerEnd="url(#arrow-sub-end)"
                />
                <text
                  x={(80 + cminDurPx) / 2}
                  y="222"
                  fill="#3f3f46"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  cmin,dur = {cminDur}
                </text>

                {/* delta_cdev arrow */}
                <line
                  x1={40 + cminDurPx + 3}
                  y1="228"
                  x2={40 + cnomPx - 3}
                  y2="228"
                  stroke="#71717a"
                  strokeWidth="1.2"
                  markerStart="url(#arrow-sub-start)"
                  markerEnd="url(#arrow-sub-end)"
                />
                <text
                  x={40 + cminDurPx + deltaDevPx / 2}
                  y="244"
                  fill="#71717a"
                  fontSize="9.5"
                  fontWeight="500"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  Δcdev = {deltaCdev}
                </text>

                {/* Right callout stats box */}
                <g transform="translate(395, 45)">
                  <rect width="135" height="190" fill="#ffffff" rx="6" stroke="#e4e4e7" strokeWidth="1" />
                  <text x="12" y="22" fill="#71717a" fontSize="10" fontWeight="600" textAnchor="start" letterSpacing="0.5">
                    RÉCAPITULATIF
                  </text>

                  <line x1="12" y1="30" x2="123" y2="30" stroke="#f4f4f5" strokeWidth="1" />

                  <text x="12" y="48" fill="#71717a" fontSize="10">Classe structurale :</text>
                  <text x="123" y="48" fill="#18181b" fontSize="11" fontWeight="700" textAnchor="end" fontFamily="monospace">
                    S{modificateurs.classeFinale}
                  </text>

                  <text x="12" y="70" fill="#71717a" fontSize="10">Classe déterminante :</text>
                  <text x="123" y="70" fill="#0284c7" fontSize="11" fontWeight="700" textAnchor="end" fontFamily="monospace">
                    {enrobage.classeDeterminante}
                  </text>

                  <text x="12" y="92" fill="#71717a" fontSize="10">cmin,b (barre ∅) :</text>
                  <text x="123" y="92" fill="#18181b" fontSize="11" fontWeight="600" textAnchor="end" fontFamily="monospace">
                    {enrobage.cminB} mm
                  </text>

                  <text x="12" y="114" fill="#71717a" fontSize="10">cmin,dur :</text>
                  <text x="123" y="114" fill="#18181b" fontSize="11" fontWeight="600" textAnchor="end" fontFamily="monospace">
                    {enrobage.cminDur} mm
                  </text>

                  <text x="12" y="136" fill="#71717a" fontSize="10">Δcdev (tolérance) :</text>
                  <text x="123" y="136" fill="#18181b" fontSize="11" fontWeight="600" textAnchor="end" fontFamily="monospace">
                    +{enrobage.deltaCDev} mm
                  </text>

                  <line x1="12" y1="146" x2="123" y2="146" stroke="#e4e4e7" strokeWidth="1" />

                  <text x="12" y="165" fill="#0369a1" fontSize="11" fontWeight="700">cnom requis :</text>
                  <text x="123" y="165" fill="#0369a1" fontSize="14" fontWeight="800" textAnchor="end" fontFamily="monospace">
                    {enrobage.cnom} mm
                  </text>

                  <text x="12" y="180" fill="#a1a1aa" fontSize="9" textAnchor="start">
                    cmin = max(cmin,b; cmin,dur)
                  </text>
                </g>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};
