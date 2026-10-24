import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Meter, PrecisionClass } from '../types';
import { MeterDetailModal } from '../components/MeterDetailModal';
import { ExportService } from '../services/exportService';
import { Search, Sliders, Download, ShieldCheck, Filter } from 'lucide-react';

interface Props {
  initialMeterId?: string;
}

export const MetersPage: React.FC<Props> = ({ initialMeterId }) => {
  const { meters, measurements } = useLiveData();

  const [search, setSearch] = useState('');
  const [substationFilter, setSubstationFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [inspectingMeter, setInspectingMeter] = useState<Meter | null>(() => {
    if (initialMeterId) {
      return meters.find(m => m.id === initialMeterId) || null;
    }
    return null;
  });

  const filteredMeters = meters.filter((m) => {
    const matchesSearch = 
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.ipAddress.includes(search);

    const matchesSub = substationFilter === 'ALL' || m.substationId === substationFilter;
    const matchesClass = classFilter === 'ALL' || m.precisionClass === classFilter;

    return matchesSearch && matchesSub && matchesClass;
  });

  const handleExportCsv = () => {
    const rows = filteredMeters.map(m => {
      const live = measurements[m.id];
      return {
        'Code Compteur': m.code,
        'Désignation': m.name,
        'Poste': m.substationId,
        'Départ': m.feederCode,
        'Classe': m.precisionClass,
        'Ratio TC': m.ctCaliber,
        'IP': m.ipAddress,
        'P (kW)': live?.activePowerKw || '',
        'I (A)': live?.currentAvg || '',
        'U (V)': live?.voltagePhPh || '',
        'Cos phi': live?.powerFactor || '',
        'Ea (kWh)': live?.activeEnergyKwh || '',
      };
    });
    ExportService.exportToCsv('PortWatt_58_Points_Comptage', rows);
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils et filtres */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher code, nom, IP..."
              className="rounded-xl bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white border border-slate-800 placeholder-slate-500 outline-none w-52 focus:border-cyan-500"
            />
          </div>

          {/* Filtre Poste */}
          <select
            value={substationFilter}
            onChange={(e) => setSubstationFilter(e.target.value)}
            className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs text-slate-300 border border-slate-800 outline-none focus:border-cyan-500"
          >
            <option value="ALL">Tous les 6 Postes</option>
            <option value="sub-pt-y">Poste PT Y (Vracs)</option>
            <option value="sub-pt-x">Poste PT X (Ateliers)</option>
            <option value="sub-pt-z">Poste PT Z (Capitainerie)</option>
            <option value="sub-pt-4">Poste PT 4 (Conteneurs)</option>
            <option value="sub-pt-1">Poste PT 1 (12 CMM61 Existants)</option>
            <option value="sub-pt-7">Poste PT 7 (Industriel Est)</option>
          </select>

          {/* Filtre Classe */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs text-slate-300 border border-slate-800 outline-none focus:border-cyan-500"
          >
            <option value="ALL">Toutes les Classes</option>
            <option value="0.5S">Classe 0.5S (20 centrales neuves)</option>
            <option value="0.2S">Classe 0.2S (26 centrales neuves)</option>
            <option value="MEIER_CMM61">MEIER CMM61 (12 compteurs existants)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400">
            {filteredMeters.length} / 58 Points Affichés
          </span>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Grille des 58 Compteurs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Poste</th>
                <th className="py-3 px-4">Classe & Type</th>
                <th className="py-3 px-4">Calibre TC</th>
                <th className="py-3 px-4">IP / Modbus</th>
                <th className="py-3 px-4">Puissance (kW)</th>
                <th className="py-3 px-4">Courant (A)</th>
                <th className="py-3 px-4">Cos φ</th>
                <th className="py-3 px-4">Énergie (kWh)</th>
                <th className="py-3 px-4">Complétude</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredMeters.map((m) => {
                const meas = measurements[m.id];
                const isWarning = m.status === 'WARNING';
                return (
                  <tr
                    key={m.id}
                    onClick={() => setInspectingMeter(m)}
                    className="cursor-pointer hover:bg-slate-800/60 transition-colors group"
                  >
                    <td className="py-3 px-4 font-bold text-cyan-400 group-hover:text-cyan-300">
                      {m.code}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-white truncate max-w-[220px]">
                      {m.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400 uppercase text-[11px]">
                      {m.substationId.replace('sub-pt-', 'PT ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                        m.isExisting 
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800' 
                          : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                      }`}>
                        {m.precisionClass}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.ctCaliber}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{m.ipAddress}</td>
                    <td className="py-3 px-4 font-bold text-cyan-300">
                      {meas ? meas.activePowerKw.toFixed(1) : '-'}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {meas ? meas.currentAvg.toFixed(1) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={meas && meas.powerFactor < 0.85 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {meas ? meas.powerFactor : 0.94}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {meas ? meas.activeEnergyKwh.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {m.dataQualityCompleteness}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                        isWarning
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {isWarning ? 'ATTENTION' : 'EN LIGNE'}
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
