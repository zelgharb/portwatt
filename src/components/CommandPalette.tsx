import React, { useState, useEffect } from 'react';
import { Search, Zap, Building2, Sliders, FileText, Wrench, Shield, HelpCircle, CheckSquare, RefreshCw, Moon, Sun } from 'lucide-react';
import { Substation, Meter } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  substations: Substation[];
  meters: Meter[];
  onNavigate: (page: string, param?: string) => void;
  onResetDemo: () => void;
  onToggleTheme: () => void;
}

export const CommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  substations,
  meters,
  onNavigate,
  onResetDemo,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Pages standard
  const pages = [
    { id: 'overview', name: 'Vue d’ensemble Portuaire', desc: 'Carte générale du Port d’Agadir et 6 postes', icon: Building2 },
    { id: 'substations', name: 'Postes & Synoptiques Unifilaires', desc: 'Schémas électriques TGBT T1/T2 et départs', icon: Zap },
    { id: 'meters', name: '58 Points de Comptage & TC', desc: 'Liste complète des compteurs et spectres harmoniques', icon: Sliders },
    { id: 'analytics', name: 'Analyses ISO 50001 (Sankey, Pareto, Régression)', desc: 'Flux énergétiques, heatmap et courbe classée', icon: ActivityIcon },
    { id: 'enpi', name: 'Indicateurs de Performance (IPE)', desc: 'Suivi des ratios kWh/EVP, kWh/tonne, cold ironing', icon: FileText },
    { id: 'ser', name: 'Situation Énergétique de Référence (SER)', desc: 'Modèles de normalisation et baseline ISO 50006', icon: FileText },
    { id: 'alerts', name: 'Gestion des Alertes & Seuils', desc: 'Perte communication, cos phi bas, creux de tension', icon: Zap },
    { id: 'reporting', name: 'Rapports & Exports (PDF, Excel, CSV)', desc: 'Génération instantanée de bilans d’énergie', icon: FileText },
    { id: 'data_quality', name: 'Qualité des Données & Anti-doublons', desc: 'Complétude, réconciliation PT 1, zéro vs absent', icon: Shield },
    { id: 'maintenance', name: 'Maintenance & Garantie 24 Mois', desc: 'Visites préventives, tickets correctifs 48h/7j', icon: Wrench },
    { id: 'recette', name: 'Recette Technique (Tests T01 à T15)', desc: 'PV de recette contractuel cochable et exportable', icon: CheckSquare },
    { id: 'hypotheses', name: 'Hypothèses & Points à Confirmer', desc: 'Analyse des écarts CPS (58 vs 59 départs)', icon: HelpCircle },
    { id: 'admin', name: 'Administration & Habilitations (RBAC)', desc: 'Cartographie Modbus, utilisateurs, NTP', icon: Shield },
  ];

  const filteredPages = pages.filter(p => 
    p.name.toLowerCase().includes(normalizedQuery) || p.desc.toLowerCase().includes(normalizedQuery)
  );

  const filteredSubstations = substations.filter(s =>
    s.name.toLowerCase().includes(normalizedQuery) || s.code.toLowerCase().includes(normalizedQuery) || s.locationLabel.toLowerCase().includes(normalizedQuery)
  );

  const filteredMeters = meters.filter(m =>
    m.code.toLowerCase().includes(normalizedQuery) || m.name.toLowerCase().includes(normalizedQuery) || m.ipAddress.includes(normalizedQuery)
  ).slice(0, 6); // Limite top 6 pour rapidité

  function ActivityIcon(props: any) {
    return <Zap {...props} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3 bg-slate-950">
          <Search className="h-5 w-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un poste, un compteur, une fonction, une action..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          <kbd className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Actions Rapides */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
              Actions Système Rapides
            </span>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <button
                onClick={() => { onResetDemo(); onClose(); }}
                className="flex items-center gap-2 rounded-lg p-2 text-left text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-all border border-transparent hover:border-rose-900/60"
              >
                <RefreshCw className="h-4 w-4 text-rose-400" />
                <span>Réinitialiser la Démo</span>
              </button>
              <button
                onClick={() => { onToggleTheme(); onClose(); }}
                className="flex items-center gap-2 rounded-lg p-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-all border border-transparent hover:border-slate-700"
              >
                <Moon className="h-4 w-4 text-cyan-400" />
                <span>Changer Thème (Dark / Light / Salle)</span>
              </button>
            </div>
          </div>

          {/* Postes */}
          {filteredSubstations.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Postes Électriques ({filteredSubstations.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredSubstations.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => { onNavigate('substations', sub.id); onClose(); }}
                    className="flex items-center justify-between rounded-lg p-2.5 text-xs text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-200 transition-all cursor-pointer border border-transparent hover:border-cyan-800/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      <div>
                        <strong className="text-white">{sub.code}</strong> — {sub.name}
                        <span className="text-slate-400 block text-[10px]">{sub.locationLabel}</span>
                      </div>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">{sub.livePowerKw} kW</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compteurs */}
          {filteredMeters.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Points de Comptage & TC ({filteredMeters.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredMeters.map((meter) => (
                  <div
                    key={meter.id}
                    onClick={() => { onNavigate('meters', meter.id); onClose(); }}
                    className="flex items-center justify-between rounded-lg p-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                  >
                    <div>
                      <strong className="text-cyan-400 font-mono">{meter.code}</strong> — {meter.name}
                      <span className="text-[10px] text-slate-400 block">IP : {meter.ipAddress} • {meter.ctCaliber}</span>
                    </div>
                    <span className="rounded bg-slate-950 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 border border-slate-800">
                      {meter.precisionClass}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules Fonctionnels */}
          {filteredPages.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Modules & Pages Fonctionnelles
              </span>
              <div className="mt-1 space-y-1">
                {filteredPages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.id}
                      onClick={() => { onNavigate(p.id); onClose(); }}
                      className="flex items-center gap-3 rounded-lg p-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-cyan-400" />
                      <div>
                        <strong className="text-white block">{p.name}</strong>
                        <span className="text-[10px] text-slate-400">{p.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
