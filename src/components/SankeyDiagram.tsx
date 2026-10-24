import React, { useState } from 'react';

interface SankeyNode {
  id: string;
  name: string;
  color: string;
  value: number; // kW
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export const SankeyDiagram: React.FC = () => {
  const [hoveredLink, setHoveredLink] = useState<{ label: string; value: number } | null>(null);

  // Nodes definition
  const nodes: SankeyNode[] = [
    // Source
    { id: 'grid', name: 'Réseau ONEE (22 kV)', color: '#0ea5e9', value: 2438 },
    // 6 Postes
    { id: 'pty', name: 'Poste PT Y (Vrac)', color: '#38bdf8', value: 428 },
    { id: 'ptx', name: 'Poste PT X (Ateliers)', color: '#38bdf8', value: 312 },
    { id: 'ptz', name: 'Poste PT Z (Capitainerie)', color: '#f59e0b', value: 190 },
    { id: 'pt4', name: 'Poste PT 4 (Conteneurs)', color: '#06b6d4', value: 846 },
    { id: 'pt1', name: 'Poste PT 1 (Ro-Ro & Pêche)', color: '#38bdf8', value: 295 },
    { id: 'pt7', name: 'Poste PT 7 (Industriel Est)', color: '#38bdf8', value: 367 },
    // Usages ISO 50001
    { id: 'portiques', name: 'Portiques & Grues de Quai', color: '#00f2fe', value: 720 },
    { id: 'reefers', name: 'Niches Conteneurs Frigo', color: '#22c55e', value: 680 },
    { id: 'cold_ironing', name: 'Cold Ironing (Navires à Quai)', color: '#a855f7', value: 340 },
    { id: 'lighting', name: 'Éclairage Terre-pleins & Phare', color: '#eab308', value: 295 },
    { id: 'buildings', name: 'Bâtiments Administratifs & Ateliers', color: '#ec4899', value: 243 },
    { id: 'pumps', name: 'Station Pompage & Auxiliaires', color: '#64748b', value: 160 },
  ];

  const links: SankeyLink[] = [
    { source: 'grid', target: 'pty', value: 428 },
    { source: 'grid', target: 'ptx', value: 312 },
    { source: 'grid', target: 'ptz', value: 190 },
    { source: 'grid', target: 'pt4', value: 846 },
    { source: 'grid', target: 'pt1', value: 295 },
    { source: 'grid', target: 'pt7', value: 367 },

    // PT 4 vers usages
    { source: 'pt4', target: 'portiques', value: 480 },
    { source: 'pt4', target: 'reefers', value: 280 },
    { source: 'pt4', target: 'cold_ironing', value: 86 },

    // PT Y vers usages
    { source: 'pty', target: 'portiques', value: 240 },
    { source: 'pty', target: 'reefers', value: 110 },
    { source: 'pty', target: 'lighting', value: 45 },
    { source: 'pty', target: 'buildings', value: 33 },

    // PT 1 vers usages
    { source: 'pt1', target: 'reefers', value: 140 },
    { source: 'pt1', target: 'cold_ironing', value: 95 },
    { source: 'pt1', target: 'pumps', value: 60 },

    // PT X vers usages
    { source: 'ptx', target: 'buildings', value: 110 },
    { source: 'ptx', target: 'reefers', value: 80 },
    { source: 'ptx', target: 'lighting', value: 72 },
    { source: 'ptx', target: 'pumps', value: 50 },

    // PT 7 vers usages
    { source: 'pt7', target: 'lighting', value: 130 },
    { source: 'pt7', target: 'reefers', value: 70 },
    { source: 'pt7', target: 'cold_ironing', value: 117 },
    { source: 'pt7', target: 'pumps', value: 50 },

    // PT Z vers usages
    { source: 'ptz', target: 'buildings', value: 100 },
    { source: 'ptz', target: 'lighting', value: 48 },
    { source: 'ptz', target: 'cold_ironing', value: 42 },
  ];

  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Diagramme Sankey — Bilan des Flux Énergétiques Port d'Agadir
          </h3>
          <p className="text-xs text-slate-400">
            Traçabilité ISO 50001 : Alimentation Réseau HTA → 6 Postes Transformateurs → Usages Énergétiques
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 rounded">
            Total Injecté : 2 438 kW
          </span>
        </div>
      </div>

      {hoveredLink && (
        <div className="mb-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-3 py-1.5 rounded-md inline-block">
          Flux actif : <span className="font-bold">{hoveredLink.label}</span> — <span className="text-white font-bold">{hoveredLink.value} kW</span> ({((hoveredLink.value / 2438) * 100).toFixed(1)}% du port)
        </div>
      )}

      {/* SVG Canvas for Sankey representation */}
      <div className="min-w-[800px] h-[340px] relative">
        <svg viewBox="0 0 960 330" className="w-full h-full">
          {/* Colonne 1: Réseau HTA (x = 30) */}
          <rect x="30" y="80" width="22" height="170" rx="4" fill="#0ea5e9" className="hover:opacity-80 transition-opacity" />
          <text x="25" y="68" fill="#94a3b8" fontSize="11" fontWeight="600">RÉSEAU HT 22kV</text>
          <text x="25" y="268" fill="#38bdf8" fontSize="11" fontFamily="monospace">2 438 kW</text>

          {/* Colonne 2: 6 Postes (x = 320) */}
          {[
            { id: 'pty', y: 20, h: 42, label: 'PT Y (428 kW)', color: '#38bdf8' },
            { id: 'ptx', y: 72, h: 36, label: 'PT X (312 kW)', color: '#38bdf8' },
            { id: 'ptz', y: 118, h: 26, label: 'PT Z (190 kW)', color: '#f59e0b' },
            { id: 'pt4', y: 154, h: 72, label: 'PT 4 (846 kW)', color: '#06b6d4' },
            { id: 'pt1', y: 236, h: 32, label: 'PT 1 (295 kW)', color: '#38bdf8' },
            { id: 'pt7', y: 278, h: 40, label: 'PT 7 (367 kW)', color: '#38bdf8' },
          ].map((sub, idx) => (
            <g key={sub.id}>
              {/* Curve from Grid to Substation */}
              <path
                d={`M 52,${165} C 180,${165} 180,${sub.y + sub.h / 2} 320,${sub.y + sub.h / 2}`}
                fill="none"
                stroke={sub.color}
                strokeWidth={Math.max(3, sub.h / 3)}
                strokeOpacity="0.35"
                className="hover:stroke-opacity-90 cursor-pointer transition-all"
                onMouseEnter={() => setHoveredLink({ label: `Réseau HTA → ${sub.label.split(' ')[0]} ${sub.label.split(' ')[1]}`, value: parseInt(sub.label.match(/\d+/)?.[0] || '0') })}
                onMouseLeave={() => setHoveredLink(null)}
              />
              <rect x="320" y={sub.y} width="18" height={sub.h} rx="3" fill={sub.color} />
              <text x="345" y={sub.y + sub.h / 2 + 4} fill="#e2e8f0" fontSize="10" fontWeight="500">
                {sub.label}
              </text>
            </g>
          ))}

          {/* Colonne 3: Usages Significatifs ISO 50001 (x = 680) */}
          {[
            { id: 'portiques', y: 15, h: 56, label: 'Portiques & Grues (720 kW)', pct: '29.5%', color: '#00f2fe' },
            { id: 'reefers', y: 80, h: 52, label: 'Niches Frigo (680 kW)', pct: '27.9%', color: '#22c55e' },
            { id: 'cold_ironing', y: 140, h: 38, label: 'Cold Ironing Navires (340 kW)', pct: '13.9%', color: '#a855f7' },
            { id: 'lighting', y: 186, h: 34, label: 'Éclairage Terre-pleins (295 kW)', pct: '12.1%', color: '#eab308' },
            { id: 'buildings', y: 228, h: 32, label: 'Bâtiments & Ateliers (243 kW)', pct: '10.0%', color: '#ec4899' },
            { id: 'pumps', y: 268, h: 26, label: 'Pompage & Auxiliaires (160 kW)', pct: '6.6%', color: '#64748b' },
          ].map((usage) => (
            <g key={usage.id}>
              {/* Generalized link curves from intermediate substations to usages */}
              <path
                d={`M 440,${170} C 550,${170} 550,${usage.y + usage.h / 2} 680,${usage.y + usage.h / 2}`}
                fill="none"
                stroke={usage.color}
                strokeWidth={Math.max(2, usage.h / 3.5)}
                strokeOpacity="0.28"
                className="hover:stroke-opacity-80 cursor-pointer transition-all"
                onMouseEnter={() => setHoveredLink({ label: `Postes → ${usage.label}`, value: parseInt(usage.label.match(/\d+/)?.[0] || '0') })}
                onMouseLeave={() => setHoveredLink(null)}
              />
              <rect x="680" y={usage.y} width="18" height={usage.h} rx="3" fill={usage.color} />
              <text x="705" y={usage.y + usage.h / 2 - 2} fill="#ffffff" fontSize="10" fontWeight="600">
                {usage.label}
              </text>
              <text x="705" y={usage.y + usage.h / 2 + 10} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                Part UES : {usage.pct}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Équipements Neufs Cl. 0.5S/0.2S
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400"></span> Compteurs Existants MEIER CMM61 (PT 1)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Niches Frigo Quai
        </span>
        <span className="text-slate-500 font-mono">ISO 50001:2018 §6.3</span>
      </div>
    </div>
  );
};
