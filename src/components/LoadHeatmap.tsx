import React, { useState } from 'react';

export const LoadHeatmap: React.FC = () => {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; powerKw: number } | null>(null);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Simulation de la matrice 7 jours x 24 heures
  const getPower = (dayIdx: number, hour: number): number => {
    const isWeekend = dayIdx >= 5;
    const isNight = hour < 6 || hour >= 21;
    const isPeakShift = hour >= 9 && hour <= 18;

    let base = 1200;
    if (isWeekend) base = 950;
    if (isNight) base -= 400;
    if (isPeakShift) base += 850;

    // Simulation de pics navires le mardi et jeudi après-midi
    if ((dayIdx === 1 || dayIdx === 3) && hour >= 13 && hour <= 17) {
      base += 600;
    }

    // Légère variation pseudo-déterministe
    const seed = Math.sin(dayIdx * 24 + hour) * 120;
    return Math.round(base + seed);
  };

  const getColor = (kw: number) => {
    // Échelle : < 1000 kW (bleu foncé), 1000-1800 (cyan/bleu), 1800-2400 (vert/jaune), > 2400 (ambre/corail)
    if (kw < 900) return '#0c4a6e'; // Sky-900
    if (kw < 1300) return '#0369a1'; // Sky-700
    if (kw < 1700) return '#0284c7'; // Sky-600
    if (kw < 2100) return '#06b6d4'; // Cyan-500
    if (kw < 2500) return '#10b981'; // Emerald-500
    return '#f59e0b'; // Amber-500 (Pic)
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
            Heatmap Horaire de Charge (24h × 7 jours)
          </h3>
          <p className="text-xs text-slate-400">
            Intensité de puissance appelée sur la plateforme portuaire d’Agadir
          </p>
        </div>
        {hoveredCell && (
          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-md">
            {hoveredCell.day} à {String(hoveredCell.hour).padStart(2, '0')}:00 — <span className="text-white font-bold">{hoveredCell.powerKw} kW</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* En-tête des heures */}
          <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 mb-1.5 text-center text-[10px] text-slate-400 font-mono">
            <div></div>
            {hours.map((h) => (
              <div key={h}>{h % 3 === 0 ? `${h}h` : ''}</div>
            ))}
          </div>

          {/* Lignes par jour */}
          {days.map((day, dIdx) => (
            <div key={day} className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 mb-1 items-center">
              <span className="text-xs font-medium text-slate-300">{day}</span>
              {hours.map((h) => {
                const kw = getPower(dIdx, h);
                const color = getColor(kw);
                return (
                  <div
                    key={`${day}-${h}`}
                    style={{ backgroundColor: color }}
                    className="h-6 rounded-sm cursor-pointer transition-transform hover:scale-125 hover:z-10 hover:shadow-lg hover:border hover:border-white/50"
                    onMouseEnter={() => setHoveredCell({ day, hour: h, powerKw: kw })}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px]">Charge :</span>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="h-3 w-4 rounded-sm" style={{ backgroundColor: '#0c4a6e' }}></span> &lt;900 kW
            <span className="h-3 w-4 rounded-sm ml-2" style={{ backgroundColor: '#0284c7' }}></span> ~1500 kW
            <span className="h-3 w-4 rounded-sm ml-2" style={{ backgroundColor: '#06b6d4' }}></span> ~2000 kW
            <span className="h-3 w-4 rounded-sm ml-2" style={{ backgroundColor: '#f59e0b' }}></span> &gt;2500 kW (Pointe)
          </div>
        </div>
        <span className="text-[11px] text-slate-500">Cycles de levage synchronisés le mardi/jeudi</span>
      </div>
    </div>
  );
};
