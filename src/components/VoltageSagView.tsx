import React from 'react';
import { VoltageSagEvent } from '../types';

interface Props {
  sags: VoltageSagEvent[];
}

export const VoltageSagView: React.FC<Props> = ({ sags }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            Surveillance des Creux de Tension (EN 50160 & CEI 61000-4-30)
          </h3>
          <p className="text-xs text-slate-400">
            Détection automatique des chutes U &lt; 90% Un (durée &gt; 10 ms) et classification ITIC / CBEMA
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2.5 py-1 rounded">
            {sags.length} Événements Enregistrés
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique Courbe ITIC / CBEMA */}
        <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Gabarit de Vulnérabilité ITIC (CBEMA)</span>
            <span className="text-[10px] text-slate-500 font-mono">Tension Résiduelle vs Durée</span>
          </div>

          <div className="relative w-full h-[180px]">
            <svg viewBox="0 0 380 160" className="w-full h-full">
              {/* Zones de tolérance ITIC */}
              {/* Zone Interdite (bas gauche) */}
              <rect x="40" y="70" width="160" height="70" fill="#f43f5e" fillOpacity="0.15" />
              <text x="50" y="115" fill="#f43f5e" fontSize="9" fontWeight="bold">ZONE DÉCLENCHEMENT MATÉRIEL</text>

              {/* Zone Tolérée (haut) */}
              <rect x="40" y="15" width="320" height="55" fill="#10b981" fillOpacity="0.1" />
              <text x="210" y="35" fill="#10b981" fontSize="9" fontWeight="bold">ZONE DE FONCTIONNEMENT NORMAL</text>

              {/* Ligne limite ITIC */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 2"
                points="40,70 120,70 200,90 360,90"
              />

              {/* Points d'événements réels */}
              {sags.map((sag) => {
                // Echelle log duration (10ms à 1000ms)
                const x = 50 + (Math.log10(sag.durationMs / 10) / 2) * 280;
                // Echelle tension résiduelle (0% à 100%)
                const y = 140 - ((100 - sag.depthPercent) / 100) * 120;
                return (
                  <g key={sag.id} className="cursor-pointer group">
                    <circle cx={x} cy={y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={x + 7} y={y + 3} fill="#f8fafc" fontSize="8" fontWeight="600">
                      {sag.substationCode} ({sag.durationMs}ms)
                    </text>
                  </g>
                );
              })}

              {/* Axes */}
              <line x1="40" y1="140" x2="360" y2="140" stroke="#475569" strokeWidth="1" />
              <line x1="40" y1="15" x2="40" y2="140" stroke="#475569" strokeWidth="1" />
              <text x="360" y="155" fill="#64748b" fontSize="8" textAnchor="end">Durée (ms)</text>
              <text x="35" y="20" fill="#64748b" fontSize="8" textAnchor="end">U res %</text>
            </svg>
          </div>
        </div>

        {/* Historique des événements */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-300">Journal des Événements Transitoires</span>
          <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
            {sags.map((sag) => (
              <div
                key={sag.id}
                className="flex items-center justify-between rounded-lg bg-slate-950/70 p-2.5 border border-slate-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{sag.substationCode}</span>
                    <span className="font-mono text-cyan-400">{sag.meterCode}</span>
                    <span className="text-[10px] text-slate-400">{sag.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Chute de <strong>{sag.depthPercent}%</strong> • Résiduelle : <strong>{sag.residualVoltageV} V</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-amber-400 font-bold">{sag.durationMs} ms</span>
                  <span className="block text-[9px] text-emerald-400">{sag.classification}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
