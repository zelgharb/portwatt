import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';
import { ExportService } from '../services/exportService';
import { CheckSquare, CheckCircle, Download, Award, ShieldCheck, AlertCircle } from 'lucide-react';

export const RecettePage: React.FC = () => {
  const { recetteTests, toggleRecetteTest } = useLiveData();
  const { currentUser } = useAuth();

  const successCount = recetteTests.filter(t => t.status === 'SUCCESS').length;
  const totalCount = recetteTests.length;
  const progressPct = Math.round((successCount / totalCount) * 100);

  const handleExportPvRecette = () => {
    const rows = recetteTests.map(t => ({
      'Code Test': t.code,
      'Titre': t.title,
      'Catégorie': t.category,
      'Description': t.description,
      'Résultat Attendu': t.expectedResult,
      'Preuve / PV': t.evidence,
      'Statut': t.status === 'SUCCESS' ? 'CONFORME (VALIDÉ)' : 'EN ATTENTE',
      'Validé par': t.executedBy,
      'Date': t.executedAt,
    }));
    ExportService.exportToCsv('PV_Recette_Technique_T01_T15_DEPA', rows);
  };

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE DU MODULE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
              CPS 12/DEPA/2026
            </span>
            <h2 className="text-xl font-bold text-white">
              Cahier de Recette Technique (Tests T01 à T15)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grille d'homologation contractuelle des 15 tests obligatoires avec enregistrement des preuves et PV
          </p>
        </div>

        <button
          onClick={handleExportPvRecette}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Download className="h-4 w-4" />
          <span>Exporter le PV de Recette Signé (CSV)</span>
        </button>
      </div>

      {/* 2. PROGRESSION GLOBALE DE LA RECETTE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-cyan-400" />
            <strong className="text-sm font-bold text-white">
              Taux de Validation Métrologique & Fonctionnelle
            </strong>
          </div>
          <span className="font-mono text-sm font-bold text-cyan-400">
            {successCount} / {totalCount} Tests Validés ({progressPct}%)
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 3. GRILLE DES 15 TESTS T01 À T15 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recetteTests.map((t) => {
          const isSuccess = t.status === 'SUCCESS';

          return (
            <div
              key={t.id}
              className={`rounded-2xl border p-5 backdrop-blur transition-all flex flex-col justify-between space-y-3 ${
                isSuccess
                  ? 'border-emerald-800/80 bg-slate-900/90 shadow-sm'
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
                      {t.code}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {t.category}
                    </span>
                  </div>

                  {currentUser.permissions.canRunRecette && (
                    <button
                      onClick={() => toggleRecetteTest(t.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                        isSuccess
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                          : 'bg-slate-850 text-slate-400 border border-slate-700 hover:text-white'
                      }`}
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>{isSuccess ? 'Validé' : 'À valider'}</span>
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">{t.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
              </div>

              {/* Résultat et preuve */}
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Attendu :</span>
                  <span className="text-slate-300">{t.expectedResult}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Preuve / Constat :</span>
                  <span className="text-emerald-300 font-bold">{t.evidence}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span>Vérifié par : <strong className="text-slate-400">{t.executedBy}</strong></span>
                <span>Date : {t.executedAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
