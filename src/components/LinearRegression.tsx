import React, { useState } from 'react';

export const LinearRegression: React.FC = () => {
  const [selectedFactor, setSelectedFactor] = useState<'tonnage' | 'ships' | 'temp'>('tonnage');

  // 12 mois consolidés (Observations réelles vs Régression)
  const monthlyData = [
    { month: 'Jan', xTonnage: 125, xShips: 42, actualMwh: 345, modelMwh: 352, savedMwh: -7 },
    { month: 'Fév', xTonnage: 130, xShips: 44, actualMwh: 350, modelMwh: 358, savedMwh: -8 },
    { month: 'Mar', xTonnage: 145, xShips: 48, actualMwh: 375, modelMwh: 382, savedMwh: -7 },
    { month: 'Avr', xTonnage: 152, xShips: 52, actualMwh: 385, modelMwh: 395, savedMwh: -10 },
    { month: 'Mai', xTonnage: 168, xShips: 58, actualMwh: 410, modelMwh: 425, savedMwh: -15 },
    { month: 'Juin', xTonnage: 175, xShips: 62, actualMwh: 430, modelMwh: 446, savedMwh: -16 },
    { month: 'Juil', xTonnage: 192, xShips: 68, actualMwh: 465, modelMwh: 485, savedMwh: -20 },
    { month: 'Août', xTonnage: 188, xShips: 66, actualMwh: 458, modelMwh: 476, savedMwh: -18 },
    { month: 'Sep', xTonnage: 165, xShips: 55, actualMwh: 405, modelMwh: 420, savedMwh: -15 },
    { month: 'Oct', xTonnage: 150, xShips: 50, actualMwh: 380, modelMwh: 392, savedMwh: -12 },
    { month: 'Nov', xTonnage: 138, xShips: 46, actualMwh: 360, modelMwh: 370, savedMwh: -10 },
    { month: 'Déc', xTonnage: 140, xShips: 47, actualMwh: 362, modelMwh: 374, savedMwh: -12 },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
            Modèle de Normalisation & Régression Linéaire (ISO 50006)
          </h3>
          <p className="text-xs text-slate-400">
            Ajustement de la consommation énergétique selon les variables pertinentes de l’activité portuaire
          </p>
        </div>

        {/* Facteurs influents */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSelectedFactor('tonnage')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              selectedFactor === 'tonnage'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tonnage (kTonnes)
          </button>
          <button
            onClick={() => setSelectedFactor('ships')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              selectedFactor === 'ships'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Escales Navires
          </button>
        </div>
      </div>

      {/* Stats mathématiques du modèle */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <span className="text-[10px] text-slate-400">Coefficient R²</span>
          <p className="text-base font-bold text-cyan-400 font-mono">0.912</p>
          <span className="text-[10px] text-emerald-400">Excellente corrélation (&gt; 0.85)</span>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <span className="text-[10px] text-slate-400">Équation du Modèle</span>
          <p className="text-xs font-bold text-white font-mono mt-1">y = 1.62x + 148.2</p>
          <span className="text-[10px] text-slate-400">Droite de référence SER</span>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <span className="text-[10px] text-slate-400">Économie CUSUM Cumulée</span>
          <p className="text-base font-bold text-emerald-400 font-mono">-150 MWh</p>
          <span className="text-[10px] text-slate-400">Sur les 12 mois révisés</span>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <span className="text-[10px] text-slate-400">P-Value Statistique</span>
          <p className="text-base font-bold text-white font-mono">&lt; 0.0001</p>
          <span className="text-[10px] text-emerald-400">Significativité confirmée</span>
        </div>
      </div>

      {/* SVG Scatter Plot & Regression Line */}
      <div className="relative w-full h-[250px]">
        <svg viewBox="0 0 800 230" className="w-full h-full">
          {/* Grille */}
          {[300, 350, 400, 450, 500].map((mwh) => {
            const y = 200 - ((mwh - 300) / 200) * 160;
            return (
              <g key={mwh}>
                <line x1="60" y1={y} x2="760" y2={y} stroke="#1e293b" strokeDasharray="2 4" strokeWidth="0.8" />
                <text x="50" y={y + 3} fill="#64748b" fontSize="8.5" fontFamily="monospace" textAnchor="end">
                  {mwh} MWh
                </text>
              </g>
            );
          })}

          {/* Droite de régression linéaire ajustée */}
          <line
            x1="80"
            y1="195"
            x2="740"
            y2="45"
            stroke="#0ea5e9"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />

          {/* Points d'observation mensuelle */}
          {monthlyData.map((d, idx) => {
            // X selon tonnage (110 à 200 kTonnes)
            const minX = selectedFactor === 'tonnage' ? 110 : 35;
            const maxX = selectedFactor === 'tonnage' ? 200 : 75;
            const xVal = selectedFactor === 'tonnage' ? d.xTonnage : d.xShips;
            const x = 70 + ((xVal - minX) / (maxX - minX)) * 670;

            // Y selon MWh (300 à 500 MWh)
            const y = 200 - ((d.actualMwh - 300) / 200) * 160;
            const yModel = 200 - ((d.modelMwh - 300) / 200) * 160;

            return (
              <g key={d.month} className="cursor-pointer group">
                {/* Ligne d'écart (résidu) */}
                <line x1={x} y1={y} x2={x} y2={yModel} stroke="#22c55e" strokeWidth="1.2" strokeOpacity="0.7" />
                
                {/* Point réel */}
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />
                
                {/* Libellé mois */}
                <text x={x} y={y - 8} fill="#e2e8f0" fontSize="8" fontWeight="600" textAnchor="middle">
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400"></span> Observations Réelles
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-sky-500 inline-block"></span> Droite de Régression ISO 50006
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-0.5 bg-emerald-400 inline-block"></span> Écart Favorable (Économie)
          </span>
        </div>
        <span className="text-slate-500 font-mono">Formule : Consommation = f(Activité)</span>
      </div>
    </div>
  );
};
