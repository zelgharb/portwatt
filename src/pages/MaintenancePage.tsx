import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';
import { ExportService } from '../services/exportService';
import { Wrench, Calendar, CheckSquare, Clock, AlertTriangle, ShieldCheck, Download, Plus } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const { preventiveVisits, correctiveTickets } = useLiveData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'preventive' | 'corrective' | 'spares'>('preventive');

  const handleExportPV = (visitCode: string) => {
    const rows = [
      { Document: 'PV Visite Préventive Contractuelle', Code: visitCode },
      { Marché: 'AO 12/DEPA/2026', Client: 'Port d’Agadir' },
      { Garantie: '24 mois', Prestataire: 'Titulaire du marché' },
      { Tâche: 'Thermographie IR 138 TC split-core', Statut: 'CONFORME (sans échauffement anormal)' },
      { Tâche: 'Contrôle serrage borniers TC & alimentations', Statut: 'CONFORME' },
      { Tâche: 'Test communication bus Modbus TCP/IP', Statut: 'CONFORME (57/58 opérationnels)' },
      { Tâche: 'Sauvegarde des bases de données & configs', Statut: 'EFFECTUÉ' },
    ];
    ExportService.exportToCsv(`PV_Maintenance_${visitCode}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE DU MODULE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
              GARANTIE CONTRACTUELLE 24 MOIS
            </span>
            <h2 className="text-xl font-bold text-white">
              Plan de Maintenance & Suivi des Interventions
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            4 visites préventives annuelles (CPS Art. 8) et engagements SLA (48 h bloquant / 7 jours)
          </p>
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 p-1.5 border border-slate-800">
          <button
            onClick={() => setActiveTab('preventive')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'preventive' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Préventif (4 Visites/An)
          </button>
          <button
            onClick={() => setActiveTab('corrective')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'corrective' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Correctif (SLA 48h / 7j)
          </button>
          <button
            onClick={() => setActiveTab('spares')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'spares' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pièces de Rechange
          </button>
        </div>
      </div>

      {/* 2. ONGLET PRÉVENTIF */}
      {activeTab === 'preventive' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {preventiveVisits.map((visit) => {
              const isCompleted = visit.status === 'COMPLETED';
              return (
                <div
                  key={visit.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{visit.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isCompleted ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {isCompleted ? 'RÉALISÉE' : 'PLANIFIÉE'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">Trimestre {visit.quarter} - {visit.year}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Date : {visit.dateScheduled}</p>
                    <p className="text-[10px] text-slate-500">Inspecteur : {visit.inspector}</p>

                    {/* Checklist des tâches */}
                    <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
                      {visit.tasks.map((t) => (
                        <div key={t.id} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <CheckSquare className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${t.done ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className={t.done ? 'text-slate-300' : 'text-slate-500'}>{t.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isCompleted && (
                    <button
                      onClick={() => handleExportPV(visit.code)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all border border-slate-700"
                    >
                      <Download className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Télécharger PV (.csv)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ONGLET CORRECTIF */}
      {activeTab === 'corrective' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur">
            <h4 className="text-base font-bold text-white mb-3">
              Suivi des Délais d'Intervention Contractuels (SLA)
            </h4>

            <div className="space-y-3">
              {correctiveTickets.map((t) => {
                const isResolved = t.status === 'RESOLVED';
                const is48h = t.severity === 'BLOCKING_48H';

                return (
                  <div key={t.id} className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400">{t.ticketNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          is48h ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {is48h ? 'BLOQUANT (48H)' : 'NON BLOQUANT (7 JOURS)'}
                        </span>
                        <span className="text-slate-500">{t.createdAt}</span>
                      </div>
                      <h5 className="font-bold text-white text-sm">{t.title}</h5>
                      <p className="text-slate-400 text-[11px]">
                        Poste : <strong>{t.substationCode}</strong> • Compteur : <strong>{t.meterCode}</strong> • Technicien : {t.technician}
                      </p>
                      {t.resolutionSummary && (
                        <p className="text-emerald-400 text-[11px] font-mono mt-1">
                          ✓ Résolution : {t.resolutionSummary}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isResolved ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        {isResolved ? 'RÉSOLU' : 'EN COURS'}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-mono mt-1">
                        Limite SLA : {t.slaLimit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. ONGLET PIÈCES DE RECHANGE */}
      {activeTab === 'spares' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur space-y-4">
          <h4 className="text-base font-bold text-white">Stock Stratégique de Pièces de Rechange (CPS Art. 9)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-slate-400 block text-[11px] font-sans">TC Split-core Ouvrants</span>
              <strong className="text-base text-cyan-400">6 unités en stock</strong>
              <p className="text-slate-500 text-[10px] mt-1 font-sans">Calibres 250A, 400A, 1000A / 5A</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-slate-400 block text-[11px] font-sans">Centrales Classe 0.5S & 0.2S</span>
              <strong className="text-base text-emerald-400">3 unités préconfigurées</strong>
              <p className="text-slate-500 text-[10px] mt-1 font-sans">Prêtes à être raccordées sur rail DIN</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-slate-400 block text-[11px] font-sans">Passerelles & Switchs Ethernet</span>
              <strong className="text-base text-white">2 unités industrielles</strong>
              <p className="text-slate-500 text-[10px] mt-1 font-sans">Alimentation secourue 24V DC</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
