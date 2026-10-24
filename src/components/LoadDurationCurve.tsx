import React from 'react';

export const LoadDurationCurve: React.FC = () => {
  // Courbe classée décroissante (Monotone de charge)
  const points = [
    { hour: 0, kw: 2750, label: 'Pointe Extrême' },
    { hour: 250, kw: 2480, label: 'Pointe Fréquente' },
    { hour: 1000, kw: 2150, label: 'Charge Élevée' },
    { hour: 2500, kw: 1820, label: 'Semi-Base Supérieure' },
    { hour: 4500, kw: 1450, label: 'Charge Moyenne' },
    { hour: 6500, kw: 1100, label: 'Semi-Base Inférieure' },
    { hour: 8000, kw: 860, label: 'Baseload Régulier' },
    { hour: 8760, kw: 720, label: 'Talon Incompressible' },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
            Courbe de Charge Classée (Monotone de Charge)
          </h3>
          <p className="text-xs text-slate-400">
            Tri décroissant des puissances horaires appelées sur l'année complète (8 760 heures)
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 rounded">
            Talon Incompressible : 720 kW
          </span>
        </div>
      </div>

      <div className="relative w-full h-[240px]">
        <svg viewBox="0 0 800 220" className="w-full h-full">
          {/* Lignes de repère */}
          {[1000, 1500, 2000, 2500].map((kw) => {
            const y = 190 - ((kw - 600) / 2300) * 160;
            return (
              <g key={kw}>
                <line x1="60" y1={y} x2="760" y2={y} stroke="#1e293b" strokeDasharray="2 4" strokeWidth="0.8" />
                <text x="50" y={y + 3} fill="#64748b" fontSize="8.5" fontFamily="monospace" textAnchor="end">
                  {kw} kW
                </text>
              </g>
            );
          })}

          {/* Aire sous la courbe */}
          <path
            d="M 60,35 C 180,60 300,105 450,135 C 600,160 700,175 760,180 L 760,190 L 60,190 Z"
            fill="url(#gradCyanArea)"
            opacity="0.4"
          />

          {/* Courbe monotone */}
          <path
            d="M 60,35 C 180,60 300,105 450,135 C 600,160 700,175 760,180"
            fill="none"
            stroke="#00f2fe"
            strokeWidth="2.5"
          />

          {/* Ligne repère Talon Incompressible (720 kW) */}
          <line x1="60" y1="180" x2="760" y2="180" stroke="#f43f5e" strokeDasharray="3 3" strokeWidth="1.2" />
          <text x="640" y="172" fill="#f43f5e" fontSize="9" fontWeight="bold">
            Talon : 720 kW
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="gradCyanArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Axe X heures */}
          {[0, 2000, 4000, 6000, 8760].map((h) => {
            const x = 60 + (h / 8760) * 700;
            return (
              <text key={h} x={x} y="208" fill="#64748b" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
                {h} h
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-3">
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Zone de Pointe (&gt; 2 200 kW)</p>
          <p className="text-sm font-bold text-amber-400 font-mono">820 heures / an</p>
          <p className="text-[10px] text-slate-500">Candidat direct effacement tarifaire</p>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Régime Permanent (Semi-base)</p>
          <p className="text-sm font-bold text-cyan-400 font-mono">5 400 heures / an</p>
          <p className="text-[10px] text-slate-500">Moyenne de charge : 1 480 kW</p>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Talon Incompressible</p>
          <p className="text-sm font-bold text-slate-200 font-mono">720 kW permanent</p>
          <p className="text-[10px] text-slate-500">Froid conteneurs & servitudes port</p>
        </div>
      </div>
    </div>
  );
};
