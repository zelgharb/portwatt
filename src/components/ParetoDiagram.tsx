import React from 'react';

interface UESItem {
  name: string;
  category: string;
  mwhYear: number;
  pct: number;
  cumulPct: number;
  isSignificant: boolean;
}

export const ParetoDiagram: React.FC = () => {
  const data: UESItem[] = [
    { name: 'Portiques & Grues Quai', category: 'Manutention', mwhYear: 1420, pct: 32.5, cumulPct: 32.5, isSignificant: true },
    { name: 'Niches Conteneurs Frigorifiques', category: 'Froid Portuaire', mwhYear: 1250, pct: 28.6, cumulPct: 61.1, isSignificant: true },
    { name: 'Cold Ironing (Navires à Quai)', category: 'Shore Power', mwhYear: 610, pct: 14.0, cumulPct: 75.1, isSignificant: true },
    { name: 'Éclairage Terre-pleins & Phare', category: 'Infrastructure', mwhYear: 480, pct: 11.0, cumulPct: 86.1, isSignificant: true },
    { name: 'Bâtiments Administratifs & Douane', category: 'Tertiaire', mwhYear: 390, pct: 8.9, cumulPct: 95.0, isSignificant: false },
    { name: 'Station Pompage & Auxiliaires', category: 'Utilités', mwhYear: 220, pct: 5.0, cumulPct: 100.0, isSignificant: false },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            Diagramme de Pareto (80/20) — Usages Énergétiques Significatifs (UES)
          </h3>
          <p className="text-xs text-slate-400">
            Conforme ISO 50001:2018 §6.3 : Identification et priorisation des UES pour le plan d'actions
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded">
            Seuil UES : 80% de l’énergie totale
          </span>
        </div>
      </div>

      {/* Diagramme double-axe SVG */}
      <div className="relative w-full h-[280px]">
        <svg viewBox="0 0 850 250" className="w-full h-full">
          {/* Lignes de repère horizontales (0, 25, 50, 75, 100%) */}
          {[0, 25, 50, 75, 80, 100].map((level) => {
            const y = 210 - (level / 100) * 180;
            const is80 = level === 80;
            return (
              <g key={level}>
                <line
                  x1="60"
                  y1={y}
                  x2="780"
                  y2={y}
                  stroke={is80 ? '#f43f5e' : '#334155'}
                  strokeDasharray={is80 ? '4 3' : '2 4'}
                  strokeWidth={is80 ? '1.5' : '0.8'}
                />
                <text x="790" y={y + 3} fill={is80 ? '#f43f5e' : '#64748b'} fontSize="9" fontFamily="monospace">
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Ligne Seuil 80% Label */}
          <text x="700" y="58" fill="#f43f5e" fontSize="9" fontWeight="bold">
            Seuil UES (80%)
          </text>

          {/* Colonnes Pareto */}
          {data.map((item, idx) => {
            const barW = 75;
            const x = 85 + idx * 115;
            const maxMwh = 1600;
            const barH = (item.mwhYear / maxMwh) * 180;
            const y = 210 - barH;

            return (
              <g key={item.name} className="group cursor-pointer">
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="4"
                  fill={item.isSignificant ? '#0ea5e9' : '#475569'}
                  className="transition-all hover:brightness-125"
                />
                {/* MWh value on top of bar */}
                <text x={x + barW / 2} y={y - 6} fill="#e2e8f0" fontSize="10" fontWeight="600" textAnchor="middle">
                  {item.mwhYear}
                </text>
                {/* Label X-axis */}
                <text
                  x={x + barW / 2}
                  y="228"
                  fill="#94a3b8"
                  fontSize="8.5"
                  textAnchor="middle"
                  className="font-medium"
                >
                  {item.name.split(' ')[0]} {item.name.split(' ')[1] || ''}
                </text>
                <text x={x + barW / 2} y="240" fill="#64748b" fontSize="7.5" textAnchor="middle">
                  {item.pct}%
                </text>
              </g>
            );
          })}

          {/* Courbe cumulative des pourcentages */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            points={data.map((item, idx) => {
              const x = 85 + idx * 115 + 75 / 2;
              const y = 210 - (item.cumulPct / 100) * 180;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Points sur la courbe cumulative */}
          {data.map((item, idx) => {
            const x = 85 + idx * 115 + 75 / 2;
            const y = 210 - (item.cumulPct / 100) * 180;
            return (
              <g key={`pt-${idx}`}>
                <circle cx={x} cy={y} r="4.5" fill="#022c22" stroke="#10b981" strokeWidth="2" />
                <text x={x} y={y - 8} fill="#34d399" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                  {item.cumulPct.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-3">
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <p className="text-[11px] text-slate-400">UES Critiques Classés</p>
          <p className="text-sm font-bold text-cyan-400 font-mono">Top 4 Usages = 86.1%</p>
          <p className="text-[10px] text-slate-500">Portiques, Reefers, Cold Ironing, Éclairage</p>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Potentiel d'Économie Cible</p>
          <p className="text-sm font-bold text-emerald-400 font-mono">-8.5% d'ici fin 2027</p>
          <p className="text-[10px] text-slate-500">Sur les UES prioritaires auditées</p>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Méthodologie Contractuelle</p>
          <p className="text-sm font-bold text-white font-mono">ISO 50001 §6.3 / 6.5</p>
          <p className="text-[10px] text-slate-500">Intégrée au plan d'objectifs DEPA</p>
        </div>
      </div>
    </div>
  );
};
