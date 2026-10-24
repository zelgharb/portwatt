import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Substation, Meter } from '../types';
import { Zap, Activity, AlertTriangle, CheckCircle2, TrendingDown, ArrowUpRight, Anchor, ShieldCheck } from 'lucide-react';

interface Props {
  onNavigate: (page: string, param?: string) => void;
  onSelectMeter: (meter: Meter) => void;
}

export const OverviewPage: React.FC<Props> = ({ onNavigate, onSelectMeter }) => {
  const { 
    substations, 
    meters, 
    totalPowerKw, 
    todayTotalKwh, 
    averageCosPhi, 
    commHealthPercent, 
    activeAlertsCount,
    alerts 
  } = useLiveData();

  const recentAlerts = alerts.filter(a => a.status !== 'RESOLVED').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. SCÉNARIO DÉMO ACTIF (Histoire de démo parlante) */}
      <div className="rounded-2xl border border-cyan-800/60 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Scénario Opérationnel en Cours
              </span>
              <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800">
                Port d’Agadir
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Chargement à quai au <strong>Poste PT 4</strong> (portiques 1 et 2 synchronisés) • Décrochage ponctuel simulé sur <strong>MEIER CMM61 (Halle Poisson, PT 1)</strong> • Cos φ dégradé à 0.79 sur <strong>PT Z</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('alerts')}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
        >
          <span>Examiner les alertes</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 2. CARTES KPIS GLOBAUX */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 : Puissance Instantanée */}
        <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Puissance Globale</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white font-mono tracking-tight">
            {totalPowerKw.toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
            <span>Somme TGBT sans doublon</span>
          </div>
        </div>

        {/* KPI 2 : Énergie du Jour */}
        <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Énergie du Jour</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white font-mono tracking-tight">
            {(todayTotalKwh / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-400">MWh</span>
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span>{todayTotalKwh.toLocaleString('fr-FR')} kWh</span>
          </div>
        </div>

        {/* KPI 3 : Facteur de Puissance */}
        <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cos φ Moyen Port</span>
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white font-mono tracking-tight">
            {averageCosPhi.toFixed(2)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span>Seuil contractuel ONEE : 0.85</span>
          </div>
        </div>

        {/* KPI 4 : Disponibilité Communication */}
        <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Disponibilité Modbus</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white font-mono tracking-tight">
            {commHealthPercent}%
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>57/58 en ligne (1 simulateur)</span>
          </div>
        </div>

        {/* KPI 5 : Alertes Ouvertes */}
        <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 backdrop-blur shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Alertes Actives</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-400 font-mono tracking-tight">
            {activeAlertsCount}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>1 critique • 1 avertissement</span>
          </div>
        </div>
      </div>

      {/* 3. CARTE INTERACTIVE SCHÉMATIQUE DU PORT D'AGADIR & 6 POSTES */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Carte Synoptique Portuaire — Les 6 Postes Électriques DEPA
            </h3>
            <p className="text-xs text-slate-400">
              Cliquez sur un poste pour basculer sur son synoptique unifilaire interactif
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span> Attention
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span> Défaut
            </span>
          </div>
        </div>

        {/* Carte SVG maritime stylisée du Port d'Agadir */}
        <div className="relative w-full h-[360px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <svg viewBox="0 0 920 340" className="w-full h-full">
            {/* Océan Atlantique / Bassin portuaire */}
            <rect width="920" height="340" fill="#051024" />
            
            {/* Contour des quais et digues du Port d'Agadir */}
            <path
              d="M 0,160 Q 200,170 340,190 L 520,130 L 700,160 L 880,100 L 920,100 L 920,340 L 0,340 Z"
              fill="#0f2240"
              stroke="#1e3a5f"
              strokeWidth="2"
            />
            {/* Jetée principale / Brise-lames */}
            <path
              d="M 120,60 L 380,40 L 620,80 L 850,50"
              fill="none"
              stroke="#1e3a5f"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.6"
            />
            <text x="360" y="32" fill="#38bdf8" fontSize="10" fontFamily="sans-serif" letterSpacing="2">
              DIGUE PRINCIPALE — BASSIN DU COMMERCE
            </text>

            <text x="50" y="290" fill="#334155" fontSize="18" fontWeight="bold" letterSpacing="4">
              PORT D'AGADIR (DEPA)
            </text>

            {/* Représentation des 6 Postes sur la carte */}
            {[
              { sub: substations[0], x: 260, y: 150, align: 'top' }, // PT Y
              { sub: substations[1], x: 440, y: 110, align: 'top' }, // PT X
              { sub: substations[2], x: 620, y: 130, align: 'bottom' }, // PT Z
              { sub: substations[3], x: 160, y: 220, align: 'top' }, // PT 4
              { sub: substations[4], x: 740, y: 180, align: 'bottom' }, // PT 1
              { sub: substations[5], x: 840, y: 90, align: 'top' }, // PT 7
            ].map(({ sub, x, y }) => {
              if (!sub) return null;
              const isWarning = sub.status === 'WARNING';
              const dotColor = isWarning ? '#f59e0b' : '#10b981';

              return (
                <g
                  key={sub.id}
                  onClick={() => onNavigate('substations', sub.id)}
                  className="cursor-pointer group"
                >
                  {/* Halo animé */}
                  <circle cx={x} cy={y} r="18" fill={dotColor} fillOpacity="0.15" className="animate-ping" />
                  
                  {/* Boitier Poste */}
                  <rect
                    x={x - 22}
                    y={y - 22}
                    width="44"
                    height="44"
                    rx="10"
                    fill="#0a192f"
                    stroke={dotColor}
                    strokeWidth="2.5"
                    className="group-hover:stroke-cyan-300 transition-all group-hover:scale-110"
                  />
                  <text x={x} y={y + 4} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    {sub.code.replace('PT_', '')}
                  </text>

                  {/* Étiquette d'information */}
                  <rect
                    x={x - 65}
                    y={y + 26}
                    width="130"
                    height="42"
                    rx="6"
                    fill="#0a192f"
                    stroke="#1e293b"
                    className="shadow-xl"
                  />
                  <text x={x} y={y + 40} fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {sub.name}
                  </text>
                  <text x={x} y={y + 54} fill="#38bdf8" fontSize="9.5" fontFamily="monospace" textAnchor="middle">
                    {sub.livePowerKw.toFixed(1)} kW • {sub.feederCount} pts
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. GRILLE DES 6 POSTES DÉTAILLÉS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">Synthèse Opérationnelle des 6 Postes</h3>
          <span className="text-xs text-slate-400">Total : 58 points de comptage actifs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {substations.map((sub) => {
            const isWarning = sub.status === 'WARNING';
            return (
              <div
                key={sub.id}
                onClick={() => onNavigate('substations', sub.id)}
                className="cursor-pointer rounded-2xl bg-slate-900/90 p-5 border border-slate-800 hover:border-cyan-500/80 transition-all hover:shadow-xl hover:shadow-cyan-900/20 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
                      {sub.code}
                    </span>
                    <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {sub.name}
                    </h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      isWarning
                        ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                        : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {isWarning ? 'ATTENTION' : 'NORMAL'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">{sub.locationLabel}</p>

                <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
                  <div className="rounded-xl bg-slate-950 p-2 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block">Puissance</span>
                    <strong className="text-cyan-400 font-bold">{sub.livePowerKw.toFixed(1)} kW</strong>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-2 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block">Jour</span>
                    <strong className="text-white font-bold">{sub.todayEnergyKwh} kWh</strong>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-2 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block">Points</span>
                    <strong className="text-slate-200 font-bold">{sub.feederCount} pts</strong>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Cos φ : <strong className={sub.powerFactor < 0.85 ? 'text-amber-400' : 'text-emerald-400'}>{sub.powerFactor}</strong></span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Voir synoptique →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
