import React, { useState } from 'react';

interface Props {
  harmonics?: number[];
  thdU?: number;
  thdI?: number;
  meterName?: string;
}

export const HarmonicSpectrum: React.FC<Props> = ({
  harmonics,
  thdU = 2.4,
  thdI = 8.6,
  meterName = 'Point de Comptage Sélectionné',
}) => {
  const [hoveredRank, setHoveredRank] = useState<{ rank: number; freq: number; amp: number } | null>(null);

  // Valeurs par défaut si non fournies
  const ranksData = (harmonics && harmonics.length >= 40)
    ? harmonics
    : [100, 0.2, 3.4, 0.1, 5.8, 0.15, 4.2, 0.1, 1.8, 0.1, 2.5, 0.1, 1.9, 0.08, 0.9, 0.05, 1.2, 0.05, 0.8, 0.04, 0.6, 0.04, 0.5, 0.03, 0.4, 0.03, 0.35, 0.02, 0.3, 0.02, 0.25, 0.02, 0.2, 0.01, 0.18, 0.01, 0.15, 0.01, 0.12, 0.01];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
            Spectre Harmonique (Rangs 1 à 40) — CEI 61000-4-7
          </h3>
          <p className="text-xs text-slate-400">{meterName}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-cyan-400">
            THD-U : <strong className="text-white">{thdU}%</strong> (max 5%)
          </span>
          <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">
            THD-I : <strong className="text-white">{thdI}%</strong> (max 15%)
          </span>
        </div>
      </div>

      {hoveredRank && (
        <div className="mb-2 text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-md inline-block">
          Rang <strong>H{hoveredRank.rank}</strong> ({hoveredRank.freq} Hz) — Amplitude : <strong>{hoveredRank.amp}%</strong> de la fondamentale {hoveredRank.amp > 5 ? '⚠️ Dépassement limite' : '✅ Conforme'}
        </div>
      )}

      {/* Bar Chart 1 à 40 */}
      <div className="relative w-full h-[220px]">
        <svg viewBox="0 0 840 200" className="w-full h-full">
          {/* Ligne limite EN 50160 à 5% */}
          {/* On ignore le rang 1 pour l'échelle visuelle des harmoniques pour zoomer sur rangs 2 à 40 */}
          <line x1="50" y1="60" x2="820" y2="60" stroke="#f43f5e" strokeDasharray="3 3" strokeWidth="1" />
          <text x="825" y="63" fill="#f43f5e" fontSize="8" fontFamily="monospace">
            Seuil 5%
          </text>

          {/* Ligne limite 3% */}
          <line x1="50" y1="104" x2="820" y2="104" stroke="#eab308" strokeDasharray="2 2" strokeWidth="0.8" />
          <text x="825" y="107" fill="#eab308" fontSize="8" fontFamily="monospace">
            Seuil 3%
          </text>

          {/* Ligne de base */}
          <line x1="50" y1="170" x2="820" y2="170" stroke="#334155" strokeWidth="1" />

          {/* Barres pour les 40 rangs */}
          {ranksData.map((val, idx) => {
            const rank = idx + 1;
            const freq = rank * 50;
            // Pour le rang 1 (fondamentale 100%), on le plafonne visuellement pour ne pas écraser les harmoniques
            const displayHeight = rank === 1 ? 130 : Math.min(130, (val / 7) * 130);
            const y = 170 - displayHeight;
            const x = 55 + idx * 19;
            const isOverLimit = rank > 1 && val > 5;
            const isOdd = rank % 2 !== 0;

            const barColor = rank === 1 
              ? '#0ea5e9' 
              : (isOverLimit ? '#f43f5e' : (isOdd ? '#06b6d4' : '#64748b'));

            return (
              <g
                key={rank}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredRank({ rank, freq, amp: val })}
                onMouseLeave={() => setHoveredRank(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width="13"
                  height={Math.max(2, displayHeight)}
                  rx="1.5"
                  fill={barColor}
                  className="transition-opacity hover:opacity-75"
                />
                {/* Libellé axe X pour rangs clés */}
                {(rank === 1 || rank % 5 === 0) && (
                  <text x={x + 6} y="184" fill="#94a3b8" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                    {rank}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-sky-500"></span> H1 Fondamentale 50Hz
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-cyan-400"></span> Rangs Impairs (H3, H5, H7...)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-slate-500"></span> Rangs Pairs (H2, H4...)
          </span>
        </div>
        <span className="text-slate-500 font-mono">Conformité IEEE 519 & EN 50160</span>
      </div>
    </div>
  );
};
