import React from 'react';
import { HelpCircle, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export const HypothesesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE DU MODULE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
            TRANSPARENCE CONTRACTUELLE
          </span>
          <h2 className="text-xl font-bold text-white">
            Hypothèses Retenues & Points à Valider avec la DEPA
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Inventaire exhaustif des points techniques non fixés par le CPS n° 12/DEPA/2026 afin de garantir une traçabilité totale sans invention arbitraire.
        </p>
      </div>

      {/* 2. LES 5 GRANDS AXES D'HYPOTHÈSES */}
      <div className="space-y-4">
        {/* Hypothèse 1 : 58 points vs 59 départs */}
        <div className="rounded-2xl border border-amber-800/80 bg-slate-900/90 p-6 backdrop-blur space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              1. Écart d'Inventaire : 58 Points de Comptage Actifs vs 59 Départs Recensés
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Le CPS indique un total de <strong>58 points de comptage actifs</strong> (46 centrales neuves + 12 compteurs existants MEIER CMM61 au PT 1). Toutefois, le recensement physique des schémas unifilaires des 6 postes totalise <strong>59 départs physiques</strong>.
          </p>
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs font-mono space-y-1.5">
            <div className="text-cyan-300 font-bold">Hypothèse intégrée dans PortWatt SME :</div>
            <div className="text-slate-300">
              • Les 58 points de comptage actifs contractuels sont modélisés et instrumentés en temps réel.<br />
              • Le 59ème départ est identifié au <strong>Poste PT 4</strong> comme <em>« Départ Réserve Quai Ouest »</em> (disjoncteur présent, sans TC ni centrale).<br />
              • <strong>Action DEPA :</strong> Confirmer en phase d'exécution si ce départ réserve doit recevoir un 59ème compteur ou rester en réserve d'extension future.
            </div>
          </div>
        </div>

        {/* Hypothèse 2 : Modbus MEIER CMM61 vs SunSpec */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              2. Cartographie des Registres Modbus & Intégration MEIER CMM61
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Le protocole retenu pour les 12 compteurs existants du Poste PT 1 est le Modbus TCP/IP sur port 502. Les registres ont été configurés selon les standards industriels (format Float32 Big-Endian) et sont <strong>100% éditables dans le module Admin</strong> sans recompilation du code.
          </p>
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs font-mono text-slate-300">
            • 30001-30006 : Tensions V & U • 30007-30012 : Courants L1, L2, L3 • 30013-30018 : Puissances P & Q • 30025 : Énergie Active Cumulée (kWh).
          </div>
        </div>

        {/* Hypothèse 3 : IPE et Unités d'œuvre Portuaires */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              3. Formules des Indicateurs de Performance Énergétique (IPE)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Les ratios portuaires (kWh / EVP pour le terminal conteneurs, kWh / tonne manutentionnée pour le quai vrac, kWh / escale navire pour le cold ironing) sont des <strong>propositions méthodologiques conformes au guide ISO 50006</strong>.
          </p>
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs font-mono text-amber-300">
            Tous les indicateurs sont marqués avec le statut « Démo à valider avec la DEPA » et un éditeur de formules est mis à disposition du Responsable Énergie.
          </div>
        </div>

        {/* Hypothèse 4 : Calibres et Ratios des 138 TC Split-Core */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-sky-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              4. Calibres des Transformateurs de Courant (138 TC Ouvrants)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Répartition des calibres secondaires .../5A : 2000A pour les arrivées TGBT T1/T2, 400A à 1000A pour les grues et portiques, et 63A à 250A pour les niches frigorifiques et éclairages.
          </p>
        </div>

        {/* Hypothèse 5 : Tarifs ONEE et Seuils de Dépassement */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-slate-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              5. Grille Tarifaire ONEE MT et Seuils d'Alertes
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Les seuils de puissance souscrite et les pénalités pour cos φ &lt; 0.85 appliquent la grille tarifaire standard Moyenne Tension ONEE en vigueur. Les seuils sont configurables dans le module Administration.
          </p>
        </div>
      </div>
    </div>
  );
};
