import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { ExportService } from '../services/exportService';
import { FileText, Download, Table, CheckCircle, FileSpreadsheet, FileCode } from 'lucide-react';

export const ReportingPage: React.FC = () => {
  const { substations, meters, alerts, enpiList, measurements, totalPowerKw, todayTotalKwh, activeAlertsCount } = useLiveData();

  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL'>('DAILY');
  const [reportType, setReportType] = useState<'ISO50001' | 'BALANCE' | 'QUALITY'>('ISO50001');

  const handleExportExcel = () => {
    ExportService.exportFullExcel(substations, meters, alerts, enpiList, measurements);
  };

  const handleExportPdf = () => {
    ExportService.exportPdfReport(substations, totalPowerKw, todayTotalKwh, activeAlertsCount);
  };

  const handleExportCsv = () => {
    const rows = substations.map(s => ({
      'Poste': s.code,
      'Désignation': s.name,
      'Emplacement': s.locationLabel,
      'Puissance Actuelle (kW)': s.livePowerKw,
      'Énergie du Jour (kWh)': s.todayEnergyKwh,
      'Facteur de Puissance': s.powerFactor,
      'Statut': s.status,
    }));
    ExportService.exportToCsv(`PortWatt_Rapport_${period}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE DU MODULE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
              ISO 50001:2018
            </span>
            <h2 className="text-xl font-bold text-white">
              Génération de Rapports & Reporting Automatique
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exports 100% exécutés côté navigateur (Client-side) aux formats PDF, Excel multi-feuilles et CSV
          </p>
        </div>

        {/* Boutons d'exportation instantanés */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-all shadow-md shadow-rose-600/20"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger PDF Exécutif</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Classeur Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <FileCode className="h-4 w-4 text-cyan-400" />
            <span>Données CSV</span>
          </button>
        </div>
      </div>

      {/* 2. PARAMÉTRAGE DU RAPPORT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur space-y-3">
          <label className="text-xs font-bold text-slate-300 block">Période du Bilan</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'DAILY', label: 'Quotidien' },
              { id: 'WEEKLY', label: 'Hebdo' },
              { id: 'MONTHLY', label: 'Mensuel' },
              { id: 'ANNUAL', label: 'Annuel' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`rounded-xl py-2 text-xs font-medium transition-all ${
                  period === p.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur space-y-3">
          <label className="text-xs font-bold text-slate-300 block">Modèle de Rapport Réglementaire</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ISO50001', label: 'Revue Énergie' },
              { id: 'BALANCE', label: 'Bilan Puissance' },
              { id: 'QUALITY', label: 'Qualité Onde' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setReportType(t.id as any)}
                className={`rounded-xl py-2 text-xs font-medium transition-all ${
                  reportType === t.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. APERÇU DU RAPPORT EN DIRECT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Aperçu : Rapport {period.toLowerCase()} — {reportType === 'ISO50001' ? 'Revue Énergétique ISO 50001' : 'Bilan Électrique Global'}
            </h3>
            <span className="text-xs text-slate-400">Direction d’Exploitation du Port d’Agadir</span>
          </div>
          <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Prêt à être téléchargé
          </span>
        </div>

        {/* Tableau Synthèse */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Poste</th>
                <th className="py-2.5 px-3 font-sans">Emplacement</th>
                <th className="py-2.5 px-3">Points</th>
                <th className="py-2.5 px-3">Puissance Live (kW)</th>
                <th className="py-2.5 px-3">Énergie Active (kWh)</th>
                <th className="py-2.5 px-3">Cos φ</th>
                <th className="py-2.5 px-3">Disponibilité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {substations.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{s.code}</td>
                  <td className="py-2.5 px-3 font-sans text-white">{s.locationLabel}</td>
                  <td className="py-2.5 px-3 text-slate-300">{s.feederCount}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">{s.livePowerKw.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-white">{s.todayEnergyKwh.toLocaleString('fr-FR')}</td>
                  <td className="py-2.5 px-3 text-emerald-400">{s.powerFactor}</td>
                  <td className="py-2.5 px-3 text-slate-300">99.8%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
