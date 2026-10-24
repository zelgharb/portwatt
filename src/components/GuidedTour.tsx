import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Award, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const GuidedTour: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      page: 'overview',
      title: '1. Vue d’ensemble Portuaire & 6 Postes',
      text: 'Visualisez la topologie des 6 postes électriques du Port d’Agadir (PT Y, PT X, PT Z, PT 4, PT 1, PT 7) sur la carte maritime avec les KPIs énergétiques et l’état de communication en temps réel.',
    },
    {
      page: 'substations',
      title: '2. Synoptiques Unifilaires Interactifs',
      text: 'Explorez l’architecture électrique détaillée de chaque poste : transformateurs 22kV / 400V, disjoncteurs T1 & T2, jeu de barres avec couplage, et départs secondaires avec badges de fraîcheur (Live/Retard/Hors ligne).',
    },
    {
      page: 'meters',
      title: '3. 58 Points de Comptage & TC Split-Core',
      text: 'Contrôlez les 46 compteurs neufs (classes 0.5S et 0.2S) et les 12 compteurs existants MEIER CMM61 au PT 1. Visualisez le spectre harmonique jusqu’au rang 40 et les dates d’étalonnage.',
    },
    {
      page: 'analytics',
      title: '4. Analyses ISO 50001 (Sankey, Pareto, Heatmap)',
      text: 'Retracez les flux énergétiques globaux via le Sankey interactif, identifiez les 4 Usages Énergétiques Significatifs (UES = 86% de l’énergie) via le diagramme de Pareto, et analysez la monotone de charge classée.',
    },
    {
      page: 'enpi',
      title: '5. Indicateurs de Performance Énergétique (IPE)',
      text: 'Suivez les ratios spécifiques portuaires : kWh/EVP (conteneurs), kWh/tonne (vracs), et cold ironing navires. Modifiez ou simulez de nouveaux indicateurs personnalisés.',
    },
    {
      page: 'ser',
      title: '6. Situation Énergétique de Référence (SER / EnB)',
      text: 'Évaluez la performance selon la norme ISO 50006 : modèle de régression multivariable (R² = 0.912) normalisé selon le tonnage et les escales pour mesurer les économies d’énergie nettes.',
    },
    {
      page: 'alerts',
      title: '7. Moteur d’Alertes & Cycle de Vie',
      text: 'Détectez les pertes de communication, cos φ dégradés, pics de puissance et creux de tension (EN 50160). Acquittez et commentez les alertes selon le cycle : Nouvelle → Prise en charge → Clôturée.',
    },
    {
      page: 'reporting',
      title: '8. Reporting Automatique & Exports Clients',
      text: 'Générez et téléchargez instantanément vos bilans énergétiques ISO 50001 aux formats PDF exécutif, Excel multi-onglets (.xlsx) ou CSV, sans aucun serveur distant requis.',
    },
    {
      page: 'maintenance',
      title: '9. Maintenance & Garantie Contractuelle 24 Mois',
      text: 'Suivez le planning des 4 visites préventives annuelles, la checklist hardware/software du CPS, et la gestion des tickets correctifs avec SLA de 48h (bloquant) ou 7 jours.',
    },
    {
      page: 'recette',
      title: '10. Recette Technique (Tests T01 à T15)',
      text: 'Parcourez la grille complète des 15 tests d’homologation contractuels (connectivité, horodatage, IPE, SER, double comptage) et validez le procès-verbal de recette en 1 clic.',
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onNavigate(steps[next].page);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onNavigate(steps[prev].page);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border border-cyan-500/60 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
              Mode Formation DEPA • Étape {currentStep + 1} / {steps.length}
            </span>
            <h4 className="text-sm font-bold text-white">{step.title}</h4>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-300">
        {step.text}
      </p>

      {/* Progress Bar */}
      <div className="mt-4 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Précédent
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
        >
          {currentStep === steps.length - 1 ? 'Terminer la Visite' : 'Suivant'}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
