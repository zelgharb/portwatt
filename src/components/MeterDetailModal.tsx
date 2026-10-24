import React, { useState } from 'react';
import { Meter, ElectricalMeasurement } from '../types';
import { HarmonicSpectrum } from './HarmonicSpectrum';
import { X, Activity, Cpu, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  meter: Meter;
  measurement?: ElectricalMeasurement;
  onClose: () => void;
}

export const MeterDetailModal: React.FC<Props> = ({ meter, measurement, onClose }) => {
  const [activeTab, setActiveTab] = useState<'realtime' | 'harmonics' | 'specs'>('realtime');

  const meas = measurement || {
    timestamp: new Date().toISOString(),
    meterId: meter.id,
    substationId: meter.substationId,
    voltagePhPh: 400.2,
    voltagePhN: 231.1,
    currentL1: 42.1,
    currentL2: 41.8,
    currentL3: 42.5,
    currentAvg: 42.1,
    activePowerKw: 29.2,
    reactivePowerKvar: 10.4,
    apparentPowerKva: 31.0,
    powerFactor: 0.94,
    activeEnergyKwh: 148520,
    reactiveEnergyKvarh: 24800,
    thdU: 2.3,
    thdI: 7.8,
    frequency: 50.01,
    harmonics: [],
    freshness: 'LIVE' as const,
    isInvalid: false,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-950 px-2.5 py-1 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
                {meter.code}
              </span>
              <h2 className="text-xl font-bold text-white">{meter.name}</h2>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                {meter.precisionClass}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Départ : {meter.feederCode} • IP Modbus : {meter.ipAddress}:{meter.port} • Ratio TC : {meter.ctCaliber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-6 bg-slate-950/60">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'realtime'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4" /> Grandeurs Temps Réel
          </button>
          <button
            onClick={() => setActiveTab('harmonics')}
            className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'harmonics'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" /> Spectre Harmonique (1-40)
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'specs'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="h-4 w-4" /> Fiche Métrologique & TC
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'realtime' && (
            <div className="space-y-6">
              {/* Cartes KPI live */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <span className="text-xs text-slate-400">Puissance Active P</span>
                  <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">
                    {meas.activePowerKw.toFixed(1)} <span className="text-sm font-normal text-slate-400">kW</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Q : {meas.reactivePowerKvar.toFixed(1)} kVAR</span>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <span className="text-xs text-slate-400">Courant Moyen I</span>
                  <p className="text-2xl font-bold text-white font-mono mt-1">
                    {meas.currentAvg.toFixed(1)} <span className="text-sm font-normal text-slate-400">A</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">L1:{meas.currentL1}A L2:{meas.currentL2}A L3:{meas.currentL3}A</span>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <span className="text-xs text-slate-400">Tension U (ph-ph)</span>
                  <p className="text-2xl font-bold text-white font-mono mt-1">
                    {meas.voltagePhPh.toFixed(1)} <span className="text-sm font-normal text-slate-400">V</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">V (ph-N) : {meas.voltagePhN.toFixed(1)} V</span>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <span className="text-xs text-slate-400">Facteur de Puissance</span>
                  <p className={`text-2xl font-bold font-mono mt-1 ${meas.powerFactor < 0.85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {meas.powerFactor.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Fréquence : {meas.frequency.toFixed(2)} Hz</span>
                </div>
              </div>

              {/* Compteurs d'énergie cumulée */}
              <div className="rounded-xl bg-slate-950/80 p-5 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-3">Index des Énergies Cumulées (Registres Hardware)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-900 p-3 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Énergie Active Totale (Ea)</span>
                      <p className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                        {meas.activeEnergyKwh.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} kWh
                      </p>
                    </div>
                    <span className="rounded bg-cyan-950 px-2 py-1 text-[10px] font-mono text-cyan-400 border border-cyan-800">
                      Float32
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-900 p-3 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Énergie Réactive Totale (Er)</span>
                      <p className="text-lg font-bold text-amber-300 font-mono mt-0.5">
                        {meas.reactiveEnergyKvarh.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} kVARh
                      </p>
                    </div>
                    <span className="rounded bg-amber-950 px-2 py-1 text-[10px] font-mono text-amber-400 border border-amber-800">
                      Float32
                    </span>
                  </div>
                </div>
              </div>

              {/* Qualité de l'onde */}
              <div className="rounded-xl bg-slate-950/80 p-5 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-3">Taux de Distorsion Harmonique (THD)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400">THD-U (Tension)</span>
                      <p className="text-base font-bold text-white font-mono mt-0.5">{meas.thdU}%</p>
                      <span className="text-[10px] text-emerald-400">Conforme norme CEI (&lt; 5.0%)</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-800 text-emerald-400">
                      ✓
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400">THD-I (Courant)</span>
                      <p className="text-base font-bold text-white font-mono mt-0.5">{meas.thdI}%</p>
                      <span className="text-[10px] text-slate-400">Tolérance variateurs charges non linéaires</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-800 text-cyan-400 font-mono text-xs">
                      ~
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'harmonics' && (
            <HarmonicSpectrum
              harmonics={meas.harmonics}
              thdU={meas.thdU}
              thdI={meas.thdI}
              meterName={meter.name}
            />
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-950 p-5 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Caractéristiques Métrologiques & Raccordement
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Type & Modèle Centrale</span>
                    <strong className="text-white">
                      {meter.isExisting ? 'MEIER CMM61 (Existant PT 1)' : `Centrale Numérique Neuf Classe ${meter.precisionClass}`}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Classe de Précision Active</span>
                    <strong className="text-cyan-400 font-mono">{meter.precisionClass}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Transformateurs de Courant (TC)</span>
                    <strong className="text-white">3 TC Split-core ouvrants {meter.ctCaliber}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Date Échéance Étalonnage Métrologique</span>
                    <strong className="text-emerald-400 font-mono">{meter.calibrationDueDate}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Adresse IP Modbus TCP</span>
                    <strong className="text-white font-mono">{meter.ipAddress}:{meter.port} (Unit ID : {meter.unitId})</strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Contrôle Anti-Double Comptage</span>
                    <strong className="text-white">
                      {meter.isSubmetering ? '✅ Sous-comptage (exclu du cumul direct)' : '✅ Comptage Principal (Arrivée TGBT)'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
