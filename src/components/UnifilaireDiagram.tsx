import React, { useState } from 'react';
import { Substation, Meter, ElectricalMeasurement } from '../types';

interface Props {
  substation: Substation;
  meters: Meter[];
  measurements: Record<string, ElectricalMeasurement>;
  onSelectMeter: (meter: Meter) => void;
}

export const UnifilaireDiagram: React.FC<Props> = ({
  substation,
  meters,
  measurements,
  onSelectMeter,
}) => {
  const [couplageClosed, setCouplageClosed] = useState(true);

  // Séparation Arrivées T1 / T2 vs Départs secondaires
  const t1Meter = meters.find(m => m.feederCode === 'ARR-T1') || meters[0];
  const t2Meter = meters.find(m => m.feederCode === 'ARR-T2') || meters[1];
  const secondaryMeters = meters.filter(m => !m.feederCode.startsWith('ARR-'));

  const m1 = t1Meter ? measurements[t1Meter.id] : null;
  const m2 = t2Meter ? measurements[t2Meter.id] : null;

  const getFreshnessBadge = (meas?: ElectricalMeasurement) => {
    if (!meas || meas.freshness === 'OFFLINE') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-800">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> HORS LIGNE
        </span>
      );
    }
    if (meas.freshness === 'STALE') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> RETARD
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span> LIVE
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur">
      {/* Entête Synoptique */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-sm font-bold text-cyan-400 border border-cyan-800">
              {substation.code}
            </span>
            <h3 className="text-xl font-bold text-white">
              Synoptique Unifilaire Interactif — {substation.name}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {substation.locationLabel} • Alimentation 22 kV / 400 V • {substation.feederCount} Points Instrumentés
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCouplageClosed(!couplageClosed)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
              couplageClosed 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' 
                : 'bg-amber-950/80 text-amber-300 border-amber-700'
            }`}
          >
            Disjoncteur Couplage T1-T2 : <strong>{couplageClosed ? 'FERMÉ (I)' : 'OUVERT (O)'}</strong>
          </button>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Puissance Appelée</span>
            <span className="font-mono text-lg font-bold text-cyan-400">
              {substation.livePowerKw.toFixed(1)} kW
            </span>
          </div>
        </div>
      </div>

      {/* SVG Schéma Unifilaire Interactif */}
      <div className="relative w-full overflow-x-auto rounded-lg bg-slate-950 p-6 border border-slate-800/80">
        <div className="min-w-[920px]">
          {/* Ligne HTA Source (22 kV) */}
          <div className="mb-4 flex justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-sky-400 font-semibold mb-1">ARRIVÉE HTA 1 (22 kV)</span>
              <div className="h-6 w-0.5 bg-sky-500"></div>
              {/* Symbole Transfo Tr1 */}
              <div className="flex -space-x-1 my-1">
                <div className="h-6 w-6 rounded-full border-2 border-cyan-400"></div>
                <div className="h-6 w-6 rounded-full border-2 border-cyan-400"></div>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">Tr 1 (1 250 kVA)</span>
              <div className="h-6 w-0.5 bg-cyan-400"></div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-sky-400 font-semibold mb-1">ARRIVÉE HTA 2 (22 kV)</span>
              <div className="h-6 w-0.5 bg-sky-500"></div>
              {/* Symbole Transfo Tr2 */}
              <div className="flex -space-x-1 my-1">
                <div className="h-6 w-6 rounded-full border-2 border-cyan-400"></div>
                <div className="h-6 w-6 rounded-full border-2 border-cyan-400"></div>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">Tr 2 (1 250 kVA)</span>
              <div className="h-6 w-0.5 bg-cyan-400"></div>
            </div>
          </div>

          {/* Cartouches Arrivées T1 / T2 avec Disjoncteurs */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Arrivée T1 */}
            <div 
              onClick={() => t1Meter && onSelectMeter(t1Meter)}
              className="cursor-pointer rounded-lg bg-slate-900 p-4 border border-cyan-900/60 hover:border-cyan-500 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                  TGBT Arrivée T1 {t1Meter?.code}
                </span>
                {getFreshnessBadge(m1 || undefined)}
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center mt-2">
                <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">P (kW)</span>
                  <span className="font-bold text-cyan-400">{m1?.activePowerKw ?? 210}</span>
                </div>
                <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">I Moy (A)</span>
                  <span className="font-bold text-white">{m1?.currentAvg ?? 325}</span>
                </div>
                <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">U (V)</span>
                  <span className="font-bold text-white">{m1?.voltagePhPh ?? 400.1}</span>
                </div>
                <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">cos φ</span>
                  <span className="font-bold text-emerald-400">{m1?.powerFactor ?? 0.94}</span>
                </div>
              </div>
            </div>

            {/* Arrivée T2 */}
            <div 
              onClick={() => t2Meter && onSelectMeter(t2Meter)}
              className="cursor-pointer rounded-lg bg-slate-900 p-4 border border-cyan-900/60 hover:border-cyan-500 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                  TGBT Arrivée T2 {t2Meter?.code}
                </span>
                {getFreshnessBadge(m2 || undefined)}
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center mt-2">
                <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">P (kW)</span>
                  <span className="font-bold text-cyan-400">{m2?.activePowerKw ?? 218}</span>
                </div>
                <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">I Moy (A)</span>
                  <span className="font-bold text-white">{m2?.currentAvg ?? 338}</span>
                </div>
                <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">U (V)</span>
                  <span className="font-bold text-white">{m2?.voltagePhPh ?? 399.8}</span>
                </div>
                <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">cos φ</span>
                  <span className="font-bold text-emerald-400">{m2?.powerFactor ?? 0.94}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Jeu de Barres Principal (Busbar) 400V avec Couplage */}
          <div className="relative my-6 flex items-center">
            {/* Barre T1 */}
            <div className="h-3.5 flex-1 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-l shadow-lg shadow-cyan-500/20"></div>

            {/* Disjoncteur de Couplage */}
            <div className="mx-2 flex flex-col items-center">
              <span className="text-[8px] font-mono text-slate-400 mb-0.5">COUPLAGE</span>
              <button
                onClick={() => setCouplageClosed(!couplageClosed)}
                className={`h-7 w-7 rounded border-2 flex items-center justify-center font-mono font-bold text-xs transition-all ${
                  couplageClosed 
                    ? 'bg-emerald-600 border-emerald-400 text-white' 
                    : 'bg-rose-950 border-rose-500 text-rose-300'
                }`}
              >
                {couplageClosed ? 'X' : '/'}
              </button>
            </div>

            {/* Barre T2 */}
            <div className="h-3.5 flex-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-r shadow-lg shadow-cyan-500/20"></div>
          </div>

          {/* Départs Secondaires (Feeder Circuits) */}
          <div className="mt-8">
            <span className="text-xs font-bold text-slate-300 mb-3 block">
              Départs Secondaires & Niches Quai ({secondaryMeters.length} circuits)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {secondaryMeters.map((meter) => {
                const meas = measurements[meter.id];
                return (
                  <div
                    key={meter.id}
                    onClick={() => onSelectMeter(meter)}
                    className="cursor-pointer rounded-lg bg-slate-900/90 p-3 border border-slate-800 hover:border-cyan-400 transition-all hover:shadow-md hover:shadow-cyan-900/20 group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-cyan-300">
                        {meter.code}
                      </span>
                      {getFreshnessBadge(meas)}
                    </div>

                    <p className="text-xs font-medium text-white truncate group-hover:text-cyan-300">
                      {meter.name}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-1.5">
                      <span className="text-slate-400">
                        {meas ? `${meas.activePowerKw.toFixed(1)} kW` : '18.4 kW'}
                      </span>
                      <span className="text-emerald-400">
                        cos φ {meas ? meas.powerFactor : 0.93}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
                      <span>{meter.ctCaliber}</span>
                      <span className="rounded bg-slate-950 px-1 py-0.5 font-semibold text-slate-400">
                        {meter.precisionClass}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
        <span className="text-slate-500">
          Cliquez sur un départ ou une arrivée pour inspecter les courbes détaillées, le spectre harmonique et les TC.
        </span>
        <span className="font-mono text-cyan-400">Échantillonnage Modbus : 1 500 ms</span>
      </div>
    </div>
  );
};
