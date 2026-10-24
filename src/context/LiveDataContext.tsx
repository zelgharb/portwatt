import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Substation, 
  Meter, 
  ElectricalMeasurement, 
  Alert, 
  EnPI, 
  SERModel, 
  VoltageSagEvent, 
  RecetteTest, 
  PreventiveVisit, 
  CorrectiveTicket, 
  AuditLog 
} from '../types';
import { LocalDbService } from '../services/db';
import { useAuth } from './AuthContext';

interface LiveDataContextType {
  substations: Substation[];
  meters: Meter[];
  measurements: Record<string, ElectricalMeasurement>;
  alerts: Alert[];
  enpiList: EnPI[];
  serModel: SERModel;
  sags: VoltageSagEvent[];
  recetteTests: RecetteTest[];
  preventiveVisits: PreventiveVisit[];
  correctiveTickets: CorrectiveTicket[];
  auditLogs: AuditLog[];
  isSimulating: boolean;
  tickCount: number;
  totalPowerKw: number;
  todayTotalKwh: number;
  averageCosPhi: number;
  commHealthPercent: number;
  activeAlertsCount: number;
  // Actions
  toggleSimulation: () => void;
  resetAllData: () => void;
  acknowledgeAlert: (id: string, comment?: string) => void;
  resolveAlert: (id: string, comment: string) => void;
  toggleRecetteTest: (id: string) => void;
  updateEnPIList: (newList: EnPI[]) => void;
  updateSERModel: (newModel: SERModel) => void;
  saveNewMeter: (newMeter: Meter) => void;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const workerRef = useRef<Worker | null>(null);

  const [substations, setSubstations] = useState<Substation[]>(() => LocalDbService.getSubstations());
  const [meters, setMeters] = useState<Meter[]>(() => LocalDbService.getMeters());
  const [measurements, setMeasurements] = useState<Record<string, ElectricalMeasurement>>({});
  const [alerts, setAlerts] = useState<Alert[]>(() => LocalDbService.getAlerts());
  const [enpiList, setEnpiList] = useState<EnPI[]>(() => LocalDbService.getEnPI());
  const [serModel, setSerModel] = useState<SERModel>(() => LocalDbService.getSER());
  const [sags, setSags] = useState<VoltageSagEvent[]>(() => LocalDbService.getSags());
  const [recetteTests, setRecetteTests] = useState<RecetteTest[]>(() => LocalDbService.getRecetteTests());
  const [preventiveVisits, setPreventiveVisits] = useState<PreventiveVisit[]>(() => LocalDbService.getPreventiveVisits());
  const [correctiveTickets, setCorrectiveTickets] = useState<CorrectiveTicket[]>(() => LocalDbService.getCorrectiveTickets());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => LocalDbService.getAuditLogs());

  const [isSimulating, setIsSimulating] = useState(true);
  const [tickCount, setTickCount] = useState(0);

  // Initialize Worker
  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('../workers/simulator.worker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (event: MessageEvent) => {
        const { type, payload, tick } = event.data;
        if (type === 'MEASUREMENTS_UPDATE' && Array.isArray(payload)) {
          setTickCount(tick);
          const map: Record<string, ElectricalMeasurement> = {};
          payload.forEach((m: ElectricalMeasurement) => {
            map[m.meterId] = m;
          });
          setMeasurements(map);

          // Dynamically compute substation live powers & power factors
          setSubstations((prev) =>
            prev.map((sub) => {
              // Somme des arrivées T1 / T2
              const t1Id = `m-${sub.code.toLowerCase().replace('_', '')}-1`;
              const t2Id = `m-${sub.code.toLowerCase().replace('_', '')}-2`;
              const t1 = map[t1Id]?.activePowerKw || 0;
              const t2 = map[t2Id]?.activePowerKw || 0;
              const subPower = t1 + t2 > 0 ? t1 + t2 : sub.livePowerKw;
              const pf = map[t1Id]?.powerFactor || sub.powerFactor;

              return {
                ...sub,
                livePowerKw: parseFloat(subPower.toFixed(1)),
                powerFactor: pf,
              };
            })
          );
        }
      };

      workerRef.current = worker;

      return () => {
        worker.terminate();
      };
    } catch (e) {
      console.error('Failed to instantiate Web Worker', e);
    }
  }, []);

  // Aggregated KPIs
  const totalPowerKw = Object.values(measurements).reduce((acc, m) => {
    // Only add TGBT incomers or substations arrivals to avoid double counting!
    if (m.meterId.endsWith('-1') || m.meterId.endsWith('-2')) {
      return acc + m.activePowerKw;
    }
    return acc;
  }, 0) || 2438.6;

  const todayTotalKwh = substations.reduce((acc, s) => acc + s.todayEnergyKwh, 0);

  const averageCosPhi = 0.93;

  // Active meters communication rate
  const onlineCount = meters.filter((m) => {
    const meas = measurements[m.id];
    return meas ? meas.freshness !== 'OFFLINE' : m.status !== 'OFFLINE';
  }).length;
  const commHealthPercent = parseFloat(((onlineCount / meters.length) * 100).toFixed(1));

  const activeAlertsCount = alerts.filter((a) => a.status !== 'RESOLVED').length;

  const toggleSimulation = () => {
    if (!workerRef.current) return;
    if (isSimulating) {
      workerRef.current.postMessage({ type: 'PAUSE' });
      setIsSimulating(false);
    } else {
      workerRef.current.postMessage({ type: 'START' });
      setIsSimulating(true);
    }
  };

  const resetAllData = () => {
    LocalDbService.resetDemo();
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET_DATA' });
    }
    setSubstations(LocalDbService.getSubstations());
    setMeters(LocalDbService.getMeters());
    setAlerts(LocalDbService.getAlerts());
    setEnpiList(LocalDbService.getEnPI());
    setSerModel(LocalDbService.getSER());
    setRecetteTests(LocalDbService.getRecetteTests());
    setPreventiveVisits(LocalDbService.getPreventiveVisits());
    setCorrectiveTickets(LocalDbService.getCorrectiveTickets());
    setAuditLogs(LocalDbService.getAuditLogs());
  };

  const acknowledgeAlert = (id: string, comment?: string) => {
    const updated = LocalDbService.acknowledgeAlert(id, currentUser.name, comment);
    setAlerts(updated);
    setAuditLogs(LocalDbService.getAuditLogs());
  };

  const resolveAlert = (id: string, comment: string) => {
    const updated = LocalDbService.resolveAlert(id, currentUser.name, comment);
    setAlerts(updated);
    setAuditLogs(LocalDbService.getAuditLogs());
  };

  const toggleRecetteTest = (id: string) => {
    const updated = LocalDbService.toggleRecetteTest(id, currentUser.name);
    setRecetteTests(updated);
    setAuditLogs(LocalDbService.getAuditLogs());
  };

  const updateEnPIList = (newList: EnPI[]) => {
    LocalDbService.saveEnPI(newList);
    setEnpiList(newList);
    LocalDbService.logAudit(currentUser.name, 'IPE', 'Mise à jour des indicateurs de performance');
    setAuditLogs(LocalDbService.getAuditLogs());
  };

  const updateSERModel = (newModel: SERModel) => {
    LocalDbService.saveSER(newModel);
    setSerModel(newModel);
    LocalDbService.logAudit(currentUser.name, 'SER', 'Recalcul du modèle de référence ISO 50006');
    setAuditLogs(LocalDbService.getAuditLogs());
  };

  const saveNewMeter = (newMeter: Meter) => {
    const updated = [...meters, newMeter];
    LocalDbService.saveMeters(updated);
    setMeters(updated);
    LocalDbService.logAudit(currentUser.name, 'EQUIPEMENT', `Ajout du compteur ${newMeter.code}`);
    setAuditLogs(LocalDbService.getAuditLogs());
  };

  return (
    <LiveDataContext.Provider
      value={{
        substations,
        meters,
        measurements,
        alerts,
        enpiList,
        serModel,
        sags,
        recetteTests,
        preventiveVisits,
        correctiveTickets,
        auditLogs,
        isSimulating,
        tickCount,
        totalPowerKw,
        todayTotalKwh,
        averageCosPhi,
        commHealthPercent,
        activeAlertsCount,
        toggleSimulation,
        resetAllData,
        acknowledgeAlert,
        resolveAlert,
        toggleRecetteTest,
        updateEnPIList,
        updateSERModel,
        saveNewMeter,
      }}
    >
      {children}
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context) throw new Error('useLiveData must be used within a LiveDataProvider');
  return context;
};
