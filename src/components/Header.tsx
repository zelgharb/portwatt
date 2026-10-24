import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { 
  Zap, 
  Search, 
  RotateCcw, 
  Play, 
  Pause, 
  Moon, 
  Sun, 
  Tv, 
  UserCheck, 
  HelpCircle,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenCommandPalette: () => void;
  onOpenGuidedTour: () => void;
}

export const Header: React.FC<Props> = ({
  activePage,
  onNavigate,
  onOpenCommandPalette,
  onOpenGuidedTour,
}) => {
  const { currentUser, setRole, availableRoles } = useAuth();
  const { isSimulating, toggleSimulation, resetAllData, activeAlertsCount, commHealthPercent, totalPowerKw } = useLiveData();
  const { mode, setMode, isControlRoom } = useTheme();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Vue d’ensemble' },
    { id: 'substations', label: 'Postes (TGBT)' },
    { id: 'meters', label: '58 Points & TC' },
    { id: 'analytics', label: 'Analyses ISO 50001' },
    { id: 'enpi', label: 'IPE' },
    { id: 'ser', label: 'SER' },
    { id: 'alerts', label: 'Alertes', badge: activeAlertsCount > 0 ? activeAlertsCount : null },
    { id: 'reporting', label: 'Rapports' },
    { id: 'data_quality', label: 'Qualité' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'recette', label: 'Recette T01-T15' },
    { id: 'hypotheses', label: 'Hypothèses' },
    { id: 'admin', label: 'Admin' },
  ];

  const handleReset = () => {
    resetAllData();
    setResetConfirmOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* 1. BANDEAU DISCRET PERMANENT (Exigence n°2) */}
      <div className="flex items-center justify-between bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 px-4 py-1 text-[11px] text-cyan-300 border-b border-cyan-900/40">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>
            <strong>Démonstrateur :</strong> données simulées, non contractuelles — Appel d'offres N° 12/DEPA/2026 Port d’Agadir
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Simulateur Web Worker Actif
          </span>
          <span className="text-slate-400">
            Disponibilité Comm : <strong className="text-white">{commHealthPercent}%</strong>
          </span>
          <span className="text-slate-400">
            Puissance Port : <strong className="text-cyan-400">{totalPowerKw.toFixed(1)} kW</strong>
          </span>
        </div>
      </div>

      {/* 2. BARRE PRINCIPALE */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-3">
        {/* Logo Neutre Placeholder Port d'Agadir (Exigence n°3) */}
        <div 
          onClick={() => onNavigate('overview')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-700 text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white font-sans">
                PortWatt<span className="text-cyan-400">SME</span>
              </span>
              <span className="rounded bg-cyan-950 px-1.5 py-0.2 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-800">
                DEPA
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Monitoring ISO 50001 • Port d’Agadir</p>
          </div>
        </div>

        {/* Barre de Recherche Rapide (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white transition-all w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span>Recherche globale...</span>
          </div>
          <kbd className="rounded bg-slate-950 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 border border-slate-800">
            Ctrl+K
          </kbd>
        </button>

        {/* Contrôles de Démo & Profils */}
        <div className="flex items-center gap-2.5">
          {/* SÉLECTEUR DE PROFIL SANS MOT DE PASSE (Exigence n°2) */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-800 hover:border-cyan-800 hover:bg-slate-850 transition-all"
            >
              <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden lg:inline text-slate-400">Voir en tant que :</span>
              <strong className="text-cyan-300 font-bold">{currentUser.roleLabel.split(' ')[0]}</strong>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                  Changer de rôle (Test RBAC Démo)
                </span>
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setRole(role.role as UserRole);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full rounded-xl p-2.5 text-left text-xs transition-all flex flex-col gap-0.5 ${
                      currentUser.role === role.role
                        ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-800'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="font-bold text-white">{role.roleLabel}</strong>
                      {currentUser.role === role.role && (
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">ACTIF</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{role.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bouton Réinitialiser la Démo */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            title="Réinitialiser toutes les données démo du visiteur"
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition-all border border-slate-800 hover:border-rose-900"
          >
            <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden xl:inline">Réinitialiser</span>
          </button>

          {/* Toggle Pause / Play Simulation */}
          <button
            onClick={toggleSimulation}
            title={isSimulating ? 'Mettre en pause le flux' : 'Reprendre le flux live'}
            className="rounded-xl bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all border border-slate-800"
          >
            {isSimulating ? <Pause className="h-3.5 w-3.5 text-cyan-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
          </button>

          {/* Mode Affichage : Dark / Light / Salle de contrôle */}
          <button
            onClick={() => {
              if (mode === 'dark') setMode('control_room');
              else if (mode === 'control_room') setMode('light');
              else setMode('dark');
            }}
            title={`Mode d'affichage actif : ${mode}`}
            className="rounded-xl bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all border border-slate-800"
          >
            {mode === 'control_room' ? (
              <Tv className="h-3.5 w-3.5 text-cyan-400" />
            ) : mode === 'dark' ? (
              <Moon className="h-3.5 w-3.5 text-slate-300" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            )}
          </button>

          {/* Mode Formation Visite Guidée */}
          <button
            onClick={onOpenGuidedTour}
            title="Lancer la visite guidée (Mode formation)"
            className="rounded-xl bg-cyan-950/80 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900 transition-all border border-cyan-800/80 flex items-center gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Formation</span>
          </button>
        </div>
      </div>

      {/* 3. MENU DE NAVIGATION PAR ONGLETS */}
      <nav className="flex overflow-x-auto border-t border-slate-850 px-4 sm:px-6 bg-slate-950/80 scrollbar-none">
        <div className="flex space-x-1 py-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activePage === item.id
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* MODAL CONFIRMATION RESET */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-rose-400" /> Réinitialiser les données de démo ?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Cette action remet à zéro l’ensemble des données locales (IndexedDB/localStorage) pour votre session de visite : alertes acquittées, modifications d’IPE, tickets de maintenance et tests de recette cochés.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-xl px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/30"
              >
                Confirmer la réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
