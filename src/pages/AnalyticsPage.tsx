import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { SankeyDiagram } from '../components/SankeyDiagram';
import { ParetoDiagram } from '../components/ParetoDiagram';
import { LinearRegression } from '../components/LinearRegression';
import { LoadHeatmap } from '../components/LoadHeatmap';
import { LoadDurationCurve } from '../components/LoadDurationCurve';
import { VoltageSagView } from '../components/VoltageSagView';
import { GitCommit, BarChart3, TrendingUp, Calendar, Activity, Zap } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { sags } = useLiveData();
  const [activeTab, setActiveTab] = useState<'sankey' | 'pareto' | 'regression' | 'heatmap' | 'monotone' | 'sags'>('sankey');

  const tabs = [
    { id: 'sankey', label: 'Diagramme Sankey (Flux)', icon: GitCommit },
    { id: 'pareto', label: 'Pareto UES (80/20)', icon: BarChart3 },
    { id: 'regression', label: 'Régression ISO 50006', icon: TrendingUp },
    { id: 'heatmap', label: 'Heatmap 24h × 7j', icon: Calendar },
    { id: 'monotone', label: 'Courbe de Charge Classée', icon: Activity },
    { id: 'sags', label: 'Creux de Tension (Sags)', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête du module */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
              ISO 50001:2018
            </span>
            <h2 className="text-xl font-bold text-white">
              Analyses Énergétiques Avancées — Port d'Agadir (DEPA)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Décomposition analytique des flux, identification des usages énergétiques significatifs (UES) et normalisation multivariable
          </p>
        </div>

        {/* Navigation des Onglets */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-950 p-1.5 border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Affichage du composant actif */}
      <div>
        {activeTab === 'sankey' && <SankeyDiagram />}
        {activeTab === 'pareto' && <ParetoDiagram />}
        {activeTab === 'regression' && <LinearRegression />}
        {activeTab === 'heatmap' && <LoadHeatmap />}
        {activeTab === 'monotone' && <LoadDurationCurve />}
        {activeTab === 'sags' && <VoltageSagView sags={sags} />}
      </div>
    </div>
  );
};
