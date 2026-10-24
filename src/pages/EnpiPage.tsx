import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';
import { EnPI } from '../types';
import { FileText, Plus, AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Info } from 'lucide-react';

export const EnpiPage: React.FC = () => {
  const { enpiList, updateEnPIList } = useLiveData();
  const { currentUser } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEnPI, setEditingEnPI] = useState<EnPI | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [formula, setFormula] = useState('');
  const [target, setTarget] = useState<number>(10);
  const [unit, setUnit] = useState('kWh / EVP');
  const [category, setCategory] = useState<'PORT_CARGO' | 'COLD_IRONING' | 'INFRASTRUCTURE'>('PORT_CARGO');

  const openCreateModal = () => {
    setEditingEnPI(null);
    setCode(`IPE-${String(enpiList.length + 1).padStart(2, '0')}`);
    setName('');
    setFormula('Énergie consommée (kWh) / Unité d’œuvre');
    setTarget(10);
    setUnit('kWh / unité');
    setCategory('PORT_CARGO');
    setModalOpen(true);
  };

  const openEditModal = (item: EnPI) => {
    setEditingEnPI(item);
    setCode(item.code);
    setName(item.name);
    setFormula(item.formula);
    setTarget(item.target);
    setUnit(item.unit);
    setCategory(item.category);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEnPI) {
      const updated = enpiList.map(e => e.id === editingEnPI.id ? {
        ...e,
        code,
        name,
        formula,
        target,
        unit,
        category,
      } : e);
      updateEnPIList(updated);
    } else {
      const newItem: EnPI = {
        id: `enpi-${Date.now()}`,
        code,
        name,
        formula,
        target,
        unit,
        currentValue: parseFloat((target * 0.95).toFixed(2)),
        previousValue: parseFloat((target * 1.02).toFixed(2)),
        trend: 'DOWN',
        isGoodDirectionDown: true,
        category,
        isDemoToValidate: true,
      };
      updateEnPIList([...enpiList, newItem]);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. BANDEAU DE TRANSPARENCE CONTRACTUELLE (Règle Métier) */}
      <div className="rounded-2xl border border-amber-800/80 bg-amber-950/30 p-4 backdrop-blur flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200">
          <strong className="text-amber-300 font-bold block mb-0.5">
            Mentions Démonstrateur ISO 50001 — Indicateurs d'exemple à valider avec la DEPA
          </strong>
          Conformément aux directives contractuelles, les formules de calcul, unités d’œuvre portuaires (EVP, tonnes, escales) et valeurs cibles présentées ci-dessous constituent un modèle de démonstration et doivent être formellement validées en phase d'exécution par la Direction d'Exploitation de Marsa Maroc au Port d'Agadir.
        </div>
      </div>

      {/* 2. EN-TÊTE DU MODULE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            Indicateurs de Performance Énergétique (IPE / EnPI)
          </h2>
          <p className="text-xs text-slate-400">
            Édition et suivi continu des ratios de performance selon la norme ISO 50001:2018 §6.4
          </p>
        </div>

        {currentUser.permissions.canEditEnPIAndSER && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un IPE</span>
          </button>
        )}
      </div>

      {/* 3. GRILLE DES IPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enpiList.map((enpi) => {
          const isFavorable = enpi.trend === 'DOWN' ? enpi.isGoodDirectionDown : !enpi.isGoodDirectionDown;
          const pctVsTarget = (((enpi.currentValue - enpi.target) / enpi.target) * 100).toFixed(1);

          return (
            <div
              key={enpi.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-cyan-950 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
                      {enpi.code}
                    </span>
                    {enpi.isDemoToValidate && (
                      <span className="rounded-full bg-amber-950/80 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-800">
                        À VALIDER DEPA
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{enpi.name}</h3>
                </div>

                {currentUser.permissions.canEditEnPIAndSER && (
                  <button
                    onClick={() => openEditModal(enpi)}
                    className="text-xs text-slate-400 hover:text-cyan-400 font-medium"
                  >
                    Modifier
                  </button>
                )}
              </div>

              {/* Formule documentée */}
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 font-mono text-xs text-slate-300">
                <span className="text-[10px] text-slate-500 block">Formule d’agrégation :</span>
                {enpi.formula}
              </div>

              {/* Chiffres clés */}
              <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
                <div className="rounded-xl bg-slate-950 p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Valeur Actuelle</span>
                  <strong className="text-base font-bold text-cyan-400">
                    {enpi.currentValue}
                  </strong>
                  <span className="text-[9px] text-slate-500 block truncate">{enpi.unit}</span>
                </div>

                <div className="rounded-xl bg-slate-950 p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cible DEPA</span>
                  <strong className="text-base font-bold text-white">
                    {enpi.target}
                  </strong>
                  <span className="text-[9px] text-slate-500 block truncate">{enpi.unit}</span>
                </div>

                <div className="rounded-xl bg-slate-950 p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Écart vs Cible</span>
                  <strong className={`text-base font-bold ${isFavorable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {parseFloat(pctVsTarget) > 0 ? `+${pctVsTarget}%` : `${pctVsTarget}%`}
                  </strong>
                  <span className="text-[9px] text-slate-500 block">
                    {isFavorable ? 'Conforme' : 'Dérive'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Précédente : {enpi.previousValue} {enpi.unit}</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <TrendingDown className="h-3.5 w-3.5" /> Tendance favorable
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CRÉATION / ÉDITION D'UN IPE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingEnPI ? 'Modifier l’indicateur de performance' : 'Créer un nouvel IPE ISO 50001'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Code IPE</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 px-3 py-2 text-xs text-white border border-slate-800 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Désignation de l’Indicateur</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Ratio Énergie Portique / EVP"
                  className="w-full rounded-xl bg-slate-950 px-3 py-2 text-xs text-white border border-slate-800 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Formule Documentée</label>
                <input
                  type="text"
                  required
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder="Ex : Total kWh / Nombre EVP"
                  className="w-full rounded-xl bg-slate-950 px-3 py-2 text-xs text-white border border-slate-800 outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Valeur Cible</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={target}
                    onChange={(e) => setTarget(parseFloat(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 px-3 py-2 text-xs text-white border border-slate-800 outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Unité</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kWh / EVP"
                    className="w-full rounded-xl bg-slate-950 px-3 py-2 text-xs text-white border border-slate-800 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                >
                  Enregistrer l'IPE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
