import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertStatus, AlertSeverity } from '../types';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, ShieldAlert, Check } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert } = useLiveData();
  const { currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState<'ALL' | AlertStatus>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');

  // Modals
  const [ackModalAlert, setAckModalAlert] = useState<Alert | null>(null);
  const [ackComment, setAckComment] = useState('');
  const [resolveModalAlert, setResolveModalAlert] = useState<Alert | null>(null);
  const [resolveComment, setResolveComment] = useState('');

  const filteredAlerts = alerts.filter(a => {
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    return matchStatus && matchSeverity;
  });

  const handleAcknowledge = () => {
    if (!ackModalAlert) return;
    acknowledgeAlert(ackModalAlert.id, ackComment || 'Prise en charge par l’exploitant');
    setAckModalAlert(null);
    setAckComment('');
  };

  const handleResolve = () => {
    if (!resolveModalAlert) return;
    resolveAlert(resolveModalAlert.id, resolveComment || 'Incident résolu et vérifié');
    setResolveModalAlert(null);
    setResolveComment('');
  };

  const getSeverityBadge = (sev: AlertSeverity) => {
    if (sev === 'CRITICAL') {
      return (
        <span className="rounded-full bg-rose-950 px-2 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-800">
          CRITIQUE
        </span>
      );
    }
    if (sev === 'WARNING') {
      return (
        <span className="rounded-full bg-amber-950 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-800">
          AVERTISSEMENT
        </span>
      );
    }
    return (
      <span className="rounded-full bg-sky-950 px-2 py-0.5 text-[9px] font-bold text-sky-400 border border-sky-800">
        INFORMATION
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE DU MODULE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            Gestion des Alertes & Qualité d'Énergie
          </h2>
          <p className="text-xs text-slate-400">
            Cycle de vie des événements : Nouvelle → Prise en charge → Clôturée
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs text-slate-300 border border-slate-800 outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="NEW">Nouvelles</option>
            <option value="ACKNOWLEDGED">Prises en charge</option>
            <option value="RESOLVED">Clôturées</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs text-slate-300 border border-slate-800 outline-none"
          >
            <option value="ALL">Toutes les gravités</option>
            <option value="CRITICAL">Critique</option>
            <option value="WARNING">Avertissement</option>
            <option value="INFO">Information</option>
          </select>
        </div>
      </div>

      {/* 2. LISTE DES ALERTES */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400 text-xs">
            Aucune alerte correspondant aux critères de filtrage.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isNew = alert.status === 'NEW';
            const isAck = alert.status === 'ACKNOWLEDGED';
            const isResolved = alert.status === 'RESOLVED';

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 backdrop-blur transition-all ${
                  isNew
                    ? 'border-amber-700/80 bg-slate-900 shadow-md shadow-amber-950/20'
                    : isAck
                    ? 'border-slate-700 bg-slate-900/80'
                    : 'border-slate-800 bg-slate-950/60 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      <span className="font-mono text-xs font-bold text-slate-400">{alert.code}</span>
                      <span className="text-[11px] text-slate-500">• {alert.timestamp}</span>
                    </div>

                    <h3 className="text-base font-bold text-white">{alert.title}</h3>
                    <p className="text-xs text-slate-300 max-w-2xl">{alert.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                      <span>Poste : <strong className="text-slate-200">{alert.substationName}</strong></span>
                      {alert.meterName && <span>Compteur : <strong className="text-cyan-400">{alert.meterName}</strong></span>}
                      {alert.valueRecorded && <span>Mesure : <strong className="text-amber-400">{alert.valueRecorded}</strong></span>}
                      {alert.threshold && <span>Seuil : <strong className="text-slate-400">{alert.threshold}</strong></span>}
                    </div>
                  </div>

                  {/* Actions du cycle de vie */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    {isNew && currentUser.permissions.canAcknowledgeAlerts && (
                      <button
                        onClick={() => setAckModalAlert(alert)}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Prendre en charge</span>
                      </button>
                    )}

                    {isAck && currentUser.permissions.canAcknowledgeAlerts && (
                      <button
                        onClick={() => setResolveModalAlert(alert)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Clôturer l'alerte</span>
                      </button>
                    )}

                    {isResolved && (
                      <span className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400">
                        <CheckCircle className="h-4 w-4" /> Clôturée
                      </span>
                    )}
                  </div>
                </div>

                {/* Fil des commentaires et acquittements */}
                {alert.comments && alert.comments.length > 0 && (
                  <div className="mt-4 border-t border-slate-800/80 pt-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Historique des interventions
                    </span>
                    {alert.comments.map((c) => (
                      <div key={c.id} className="rounded-xl bg-slate-950 p-2.5 text-xs border border-slate-800/80 flex items-start gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white">{c.author}</strong>
                            <span className="text-[10px] text-slate-500 font-mono">{c.timestamp}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PRISE EN CHARGE */}
      {ackModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Prise en charge de l'alerte</h3>
            <p className="text-xs text-slate-400 mb-4">{ackModalAlert.title}</p>
            <textarea
              rows={3}
              value={ackComment}
              onChange={(e) => setAckComment(e.target.value)}
              placeholder="Ajouter une instruction ou remarque pour l'équipe..."
              className="w-full rounded-xl bg-slate-950 p-3 text-xs text-white border border-slate-800 outline-none focus:border-amber-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setAckModalAlert(null)} className="rounded-xl px-4 py-2 text-xs text-slate-400">Annuler</button>
              <button onClick={handleAcknowledge} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">Valider la prise en charge</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLÔTURE */}
      {resolveModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Clôturer l'événement</h3>
            <p className="text-xs text-slate-400 mb-4">{resolveModalAlert.title}</p>
            <textarea
              rows={3}
              value={resolveComment}
              onChange={(e) => setResolveComment(e.target.value)}
              placeholder="Renseignez le compte-rendu de résolution (cause racine, action menée)..."
              className="w-full rounded-xl bg-slate-950 p-3 text-xs text-white border border-slate-800 outline-none focus:border-emerald-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setResolveModalAlert(null)} className="rounded-xl px-4 py-2 text-xs text-slate-400">Annuler</button>
              <button onClick={handleResolve} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950">Confirmer la clôture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
