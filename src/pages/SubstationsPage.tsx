import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Substation, Meter } from '../types';
import { UnifilaireDiagram } from '../components/UnifilaireDiagram';
import { MeterDetailModal } from '../components/MeterDetailModal';
import { Zap, Activity, Sliders, ShieldCheck } from 'lucide-react';

interface Props {
  initialSubstationId?: string;
}

export const SubstationsPage: React.FC<Props> = ({ initialSubstationId }) => {
  const { substations, meters, measurements } = useLiveData();

  const [selectedSubId, setSelectedSubId] = useState<string>(
    initialSubstationId || substations[0]?.id || 'sub-pt-y'
  );
  const [inspectingMeter, setInspectingMeter] = useState<Meter | null>(null);

  const selectedSub = substations.find(s => s.id === selectedSubId) || substations[0];
  const subMeters = meters.filter(m => m.substationId === selectedSub.id);

  return (
    <div className="space-y-6">
      {/* Sélecteur de Poste */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-900/90 p-2 border border-slate-800">
        {substations.map((sub) => {
          const isSelected = sub.id === selectedSub.id;
          const isWarning = sub.status === 'WARNING';
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubId(sub.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{sub.code}</span>
              <span className="hidden sm:inline font-normal opacity-85">({sub.name.replace('Poste ', '')})</span>
              {isWarning && (
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Synoptique Unifilaire Interactif */}
      <UnifilaireDiagram
        substation={selectedSub}
        meters={subMeters}
        measurements={measurements}
        onSelectMeter={(m) => setInspectingMeter(m)}
      />

      {/* Tableau détaillé des départs du poste */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            Inventaire des Circuits du {selectedSub.name} ({subMeters.length} Points Actifs)
          </h4>
          <span className="text-xs text-slate-400">Cliquez sur une ligne pour voir les harmoniques et registres</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3">Classe</th>
                <th className="py-2.5 px-3">Ratio TC</th>
                <th className="py-2.5 px-3">Puissance (kW)</th>
                <th className="py-2.5 px-3">Courant (A)</th>
                <th className="py-2.5 px-3">Cos φ</th>
                <th className="py-2.5 px-3">THD-I (%)</th>
                <th className="py-2.5 px-3">Énergie (kWh)</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {subMeters.map((m) => {
                const meas = measurements[m.id];
                return (
                  <tr
                    key={m.id}
                    onClick={() => setInspectingMeter(m)}
                    className="cursor-pointer hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-bold text-cyan-400 group-hover:text-cyan-300">
                      {m.code}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-white truncate max-w-[200px]">
                      {m.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-slate-950 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-800">
                        {m.precisionClass}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{m.ctCaliber}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300">
                      {meas ? meas.activePowerKw.toFixed(1) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-white">
                      {meas ? meas.currentAvg.toFixed(1) : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={meas && meas.powerFactor < 0.85 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {meas ? meas.powerFactor : 0.94}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {meas ? `${meas.thdI}%` : '6.4%'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {meas ? meas.activeEnergyKwh.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800">
                        EN LIGNE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails */}
      {inspectingMeter && (
        <MeterDetailModal
          meter={inspectingMeter}
          measurement={measurements[inspectingMeter.id]}
          onClose={() => setInspectingMeter(null)}
        />
      )}
    </div>
  );
};
