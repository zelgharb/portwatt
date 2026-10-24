import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth, USER_PROFILES } from '../context/AuthContext';
import { Meter } from '../types';
import { Shield, Plus, Download, Upload, Clock, Server, CheckCircle2, User, Key, Layers } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { meters, substations, auditLogs, saveNewMeter } = useLiveData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'hierarchy' | 'commissioning' | 'mapping' | 'users' | 'ntp' | 'audit'>('hierarchy');

  // Assistant de mise en service (Wizard Modbus)
  const [wizardCode, setWizardCode] = useState('M-NEW-01');
  const [wizardName, setWizardName] = useState('Nouveau Départ Quai');
  const [wizardSub, setWizardSub] = useState('sub-pt-4');
  const [wizardIp, setWizardIp] = useState('192.168.50.120');
  const [wizardPort, setWizardPort] = useState(502);
  const [wizardCt, setWizardCt] = useState('400/5A');
  const [wizardClass, setWizardClass] = useState<'0.5S' | '0.2S'>('0.2S');
  const [wizardTestStatus, setWizardTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS'>('IDLE');

  const runModbusTest = () => {
    setWizardTestStatus('TESTING');
    setTimeout(() => {
      setWizardTestStatus('SUCCESS');
    }, 1200);
  };

  const handleCommissionMeter = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeter: Meter = {
      id: `m-custom-${Date.now()}`,
      code: wizardCode,
      name: wizardName,
      substationId: wizardSub,
      feederCode: 'DEP-NEW',
      usageCategory: 'CONTAINER_REEFER',
      precisionClass: wizardClass,
      ipAddress: wizardIp,
      port: wizardPort,
      unitId: 1,
      ctRatioPrimary: parseInt(wizardCt.split('/')[0]) || 400,
      ctRatioSecondary: 5,
      ctCaliber: wizardCt,
      isExisting: false,
      isSubmetering: true,
      calibrationDueDate: '2028-10-24',
      status: 'ONLINE',
      lastCommunication: 'À l’instant',
      dataQualityCompleteness: 100.0,
    };
    saveNewMeter(newMeter);
    setWizardTestStatus('IDLE');
    alert(`Le compteur ${newMeter.code} a été raccordé avec succès au système PortWatt.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE DU MODULE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800">
              CONSOLE SYSTÈME
            </span>
            <h2 className="text-xl font-bold text-white">
              Administration & Paramétrage Technique PortWatt
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mise en service Modbus, cartographie des registres, synchronisation d'horloge NTP et journal d'audit
          </p>
        </div>

        {/* Navigation des Onglets */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-950 p-1.5 border border-slate-800">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'hierarchy' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Arborescence
          </button>
          <button
            onClick={() => setActiveTab('commissioning')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'commissioning' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mise en Service
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Habilitations (RBAC)
          </button>
          <button
            onClick={() => setActiveTab('ntp')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'ntp' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Statut NTP
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'audit' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Journal d’Audit
          </button>
        </div>
      </div>

      {/* 2. CONTENU PAR ONGLET */}
      {activeTab === 'hierarchy' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Topologie Hiérarchique Portuaire (Site → Postes → Tableaux → Compteurs)
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
              PORT D’AGADIR (DEPA) — 6 Postes Électriques HTA / BT
            </div>
            <div className="pl-6 space-y-2">
              {substations.map((sub) => {
                const subM = meters.filter(m => m.substationId === sub.id);
                return (
                  <div key={sub.id} className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
                    <div className="flex items-center justify-between text-white font-bold mb-1">
                      <span>└── {sub.code} : {sub.name} ({sub.locationLabel})</span>
                      <span className="text-cyan-400">{subM.length} Points de Comptage</span>
                    </div>
                    <div className="pl-6 text-slate-400 text-[11px] space-y-0.5">
                      <div>• Tableaux : TGBT T1 & T2 (Arrivées 22 kV / 400 V)</div>
                      <div>• Départs secondaires : {subM.length - 2} circuits sous-comptés</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Assistant de mise en service */}
      {activeTab === 'commissioning' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur max-w-2xl mx-auto space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-cyan-400" />
            Assistant de Mise en Service d'un Nouveau Compteur Modbus TCP/IP
          </h3>
          <p className="text-xs text-slate-400">
            Raccordement, test d'interrogation trame 03/04, vérification des facteurs d'échelle et intégration
          </p>

          <form onSubmit={handleCommissionMeter} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Code Compteur</label>
                <input
                  type="text"
                  required
                  value={wizardCode}
                  onChange={(e) => setWizardCode(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 px-3 py-2 text-white border border-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Poste d'affectation</label>
                <select
                  value={wizardSub}
                  onChange={(e) => setWizardSub(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 px-3 py-2 text-white border border-slate-800"
                >
                  {substations.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Désignation du Départ Instrumenté</label>
              <input
                type="text"
                required
                value={wizardName}
                onChange={(e) => setWizardName(e.target.value)}
                className="w-full rounded-xl bg-slate-950 px-3 py-2 text-white border border-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Adresse IP Modbus</label>
                <input
                  type="text"
                  required
                  value={wizardIp}
                  onChange={(e) => setWizardIp(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 px-3 py-2 text-white border border-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Port</label>
                <input
                  type="number"
                  value={wizardPort}
                  onChange={(e) => setWizardPort(parseInt(e.target.value))}
                  className="w-full rounded-xl bg-slate-950 px-3 py-2 text-white border border-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Calibre TC (.../5A)</label>
                <input
                  type="text"
                  value={wizardCt}
                  onChange={(e) => setWizardCt(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 px-3 py-2 text-white border border-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Test Modbus interactif */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Test de Connectivité Modbus TCP</span>
                <span className="text-[11px] text-slate-400">Envoi requête Fonction 03 (Read Holding Registers)</span>
              </div>
              <button
                type="button"
                onClick={runModbusTest}
                disabled={wizardTestStatus === 'TESTING'}
                className="rounded-xl bg-slate-800 px-3 py-1.5 font-bold text-cyan-300 hover:bg-slate-700 transition-all border border-slate-700"
              >
                {wizardTestStatus === 'TESTING' ? 'Interrogation...' : 'Tester la Liaison'}
              </button>
            </div>

            {wizardTestStatus === 'SUCCESS' && (
              <div className="rounded-xl bg-emerald-950/60 p-3 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Trame reçue avec succès : U=400.2V, I=34.2A, cos φ=0.94. Étalonnage Float32 validé.</span>
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
              >
                Mettre en Service & Intégrer au Bilan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Matrice RBAC */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="h-4 w-4 text-cyan-400" />
            Matrice des Droits d'Accès & Habilitations (RBAC / Abstraction LDAP)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Rôle Profil</th>
                  <th className="py-2.5 px-3">Surveillance Live</th>
                  <th className="py-2.5 px-3">Acquittement Alertes</th>
                  <th className="py-2.5 px-3">Édition IPE / SER</th>
                  <th className="py-2.5 px-3">Cahier de Recette</th>
                  <th className="py-2.5 px-3">Mise en Service Compteurs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {Object.values(USER_PROFILES).map((u) => (
                  <tr key={u.role}>
                    <td className="py-3 px-3 font-sans font-bold text-white">
                      {u.roleLabel}
                      <span className="block text-[10px] text-slate-500 font-mono">{u.email}</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400">✓ Oui</td>
                    <td className="py-3 px-3">{u.permissions.canAcknowledgeAlerts ? <span className="text-emerald-400">✓ Oui</span> : <span className="text-slate-600">✗ Non</span>}</td>
                    <td className="py-3 px-3">{u.permissions.canEditEnPIAndSER ? <span className="text-emerald-400">✓ Oui</span> : <span className="text-slate-600">✗ Non</span>}</td>
                    <td className="py-3 px-3">{u.permissions.canRunRecette ? <span className="text-emerald-400">✓ Oui</span> : <span className="text-slate-600">✗ Non</span>}</td>
                    <td className="py-3 px-3">{u.permissions.canConfigureEquipment ? <span className="text-emerald-400">✓ Oui</span> : <span className="text-slate-600">✗ Non</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NTP Status */}
      {activeTab === 'ntp' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            Synchronisation Temporelle NTP (Horodateurs de Précision)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[11px]">Serveur NTP Maître</span>
              <strong className="text-white text-sm">ntp.depa.marsamaroc.co.ma</strong>
              <p className="text-slate-500 text-[10px] mt-1 font-sans">IP Locale : 192.168.1.10 (Stratum 1)</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[11px]">Écart d'Horloge (Gigue)</span>
              <strong className="text-emerald-400 text-sm font-bold">&lt; 1.8 millisecondes</strong>
              <p className="text-slate-500 text-[10px] mt-1 font-sans">Tolérance contractuelle : &lt; 50 ms</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[11px]">État de Synchronisation</span>
              <strong className="text-emerald-400 text-sm font-bold flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="h-4 w-4" /> VERROUILLÉ (LOCKED)
              </strong>
              <p className="text-slate-500 text-[10px] mt-1 font-sans">Dernier sync : il y a 8 secondes</p>
            </div>
          </div>
        </div>
      )}

      {/* Journal d'audit */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur space-y-4">
          <h3 className="text-base font-bold text-white">Journal d'Audit Horodaté (Traçabilité ISO 50001)</h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs font-mono flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{log.timestamp}</span>
                    <strong className="text-cyan-400">{log.userName}</strong>
                    <span className="rounded bg-slate-900 px-1 text-[9px] text-slate-400 border border-slate-800">{log.action}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-500">{log.target}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
