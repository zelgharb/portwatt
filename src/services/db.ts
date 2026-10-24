import { 
  Substation, 
  Meter, 
  Alert, 
  EnPI, 
  SERModel, 
  PreventiveVisit, 
  CorrectiveTicket, 
  RecetteTest, 
  VoltageSagEvent,
  AuditLog 
} from '../types';
import { 
  INITIAL_SUBSTATIONS, 
  INITIAL_METERS, 
  INITIAL_ALERTS, 
  INITIAL_ENPI, 
  INITIAL_SER, 
  INITIAL_PREVENTIVE_VISITS, 
  INITIAL_CORRECTIVE_TICKETS, 
  INITIAL_RECETTE_TESTS, 
  INITIAL_SAGS 
} from '../data/initialData';

const STORAGE_KEYS = {
  SUBSTATIONS: 'portwatt_substations',
  METERS: 'portwatt_meters',
  ALERTS: 'portwatt_alerts',
  ENPI: 'portwatt_enpi',
  SER: 'portwatt_ser',
  PREVENTIVE: 'portwatt_preventive',
  CORRECTIVE: 'portwatt_corrective',
  RECETTE: 'portwatt_recette',
  SAGS: 'portwatt_sags',
  AUDIT: 'portwatt_audit',
  ACTIVE_ROLE: 'portwatt_active_role',
  THEME_MODE: 'portwatt_theme_mode',
};

export class LocalDbService {
  private static load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage quota exceeded or private mode error', e);
    }
  }

  // Substations
  public static getSubstations(): Substation[] {
    return this.load<Substation[]>(STORAGE_KEYS.SUBSTATIONS, INITIAL_SUBSTATIONS);
  }

  public static saveSubstations(data: Substation[]): void {
    this.save(STORAGE_KEYS.SUBSTATIONS, data);
  }

  // Meters
  public static getMeters(): Meter[] {
    return this.load<Meter[]>(STORAGE_KEYS.METERS, INITIAL_METERS);
  }

  public static saveMeters(data: Meter[]): void {
    this.save(STORAGE_KEYS.METERS, data);
  }

  // Alerts
  public static getAlerts(): Alert[] {
    return this.load<Alert[]>(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  }

  public static saveAlerts(data: Alert[]): void {
    this.save(STORAGE_KEYS.ALERTS, data);
  }

  public static acknowledgeAlert(alertId: string, userName: string, comment?: string): Alert[] {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) => {
      if (a.id === alertId) {
        const comments = [...a.comments];
        if (comment) {
          comments.push({
            id: `c-${Date.now()}`,
            author: userName,
            text: comment,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          });
        }
        return {
          ...a,
          status: 'ACKNOWLEDGED' as const,
          acknowledgedBy: userName,
          acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          comments,
        };
      }
      return a;
    });
    this.saveAlerts(updated);
    this.logAudit(userName, 'ALERTE', `Acquittement alerte ${alertId}`);
    return updated;
  }

  public static resolveAlert(alertId: string, userName: string, resolutionComment: string): Alert[] {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) => {
      if (a.id === alertId) {
        const comments = [...a.comments, {
          id: `c-${Date.now()}`,
          author: userName,
          text: resolutionComment,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }];
        return {
          ...a,
          status: 'RESOLVED' as const,
          resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          comments,
        };
      }
      return a;
    });
    this.saveAlerts(updated);
    this.logAudit(userName, 'ALERTE', `Résolution alerte ${alertId}: ${resolutionComment}`);
    return updated;
  }

  // EnPI
  public static getEnPI(): EnPI[] {
    return this.load<EnPI[]>(STORAGE_KEYS.ENPI, INITIAL_ENPI);
  }

  public static saveEnPI(data: EnPI[]): void {
    this.save(STORAGE_KEYS.ENPI, data);
  }

  // SER
  public static getSER(): SERModel {
    return this.load<SERModel>(STORAGE_KEYS.SER, INITIAL_SER);
  }

  public static saveSER(data: SERModel): void {
    this.save(STORAGE_KEYS.SER, data);
  }

  // Maintenance
  public static getPreventiveVisits(): PreventiveVisit[] {
    return this.load<PreventiveVisit[]>(STORAGE_KEYS.PREVENTIVE, INITIAL_PREVENTIVE_VISITS);
  }

  public static savePreventiveVisits(data: PreventiveVisit[]): void {
    this.save(STORAGE_KEYS.PREVENTIVE, data);
  }

  public static getCorrectiveTickets(): CorrectiveTicket[] {
    return this.load<CorrectiveTicket[]>(STORAGE_KEYS.CORRECTIVE, INITIAL_CORRECTIVE_TICKETS);
  }

  public static saveCorrectiveTickets(data: CorrectiveTicket[]): void {
    this.save(STORAGE_KEYS.CORRECTIVE, data);
  }

  // Recette Tests
  public static getRecetteTests(): RecetteTest[] {
    return this.load<RecetteTest[]>(STORAGE_KEYS.RECETTE, INITIAL_RECETTE_TESTS);
  }

  public static saveRecetteTests(data: RecetteTest[]): void {
    this.save(STORAGE_KEYS.RECETTE, data);
  }

  public static toggleRecetteTest(testId: string, userName: string): RecetteTest[] {
    const tests = this.getRecetteTests();
    const updated = tests.map(t => {
      if (t.id === testId) {
        const nextStatus = t.status === 'SUCCESS' ? 'PENDING' : 'SUCCESS';
        return {
          ...t,
          status: nextStatus as typeof t.status,
          executedBy: userName,
          executedAt: new Date().toISOString().substring(0, 10),
        };
      }
      return t;
    });
    this.saveRecetteTests(updated);
    this.logAudit(userName, 'RECETTE', `Mise à jour statut test ${testId}`);
    return updated;
  }

  // Sags
  public static getSags(): VoltageSagEvent[] {
    return this.load<VoltageSagEvent[]>(STORAGE_KEYS.SAGS, INITIAL_SAGS);
  }

  // Audit Logs
  public static getAuditLogs(): AuditLog[] {
    return this.load<AuditLog[]>(STORAGE_KEYS.AUDIT, [
      {
        id: 'aud-init-1',
        timestamp: '2026-10-24 08:00:00',
        userName: 'Système PortWatt',
        userRole: 'ADMIN',
        action: 'DÉMARRAGE',
        target: 'Moteur d’Acquisition Modbus',
        details: 'Initialisation des 58 points de comptage actifs du Port d’Agadir.',
      },
      {
        id: 'aud-init-2',
        timestamp: '2026-10-24 08:05:12',
        userName: 'Youssef El Mansouri',
        userRole: 'ENERGY_MANAGER',
        action: 'RELECTURE',
        target: 'Modèle SER ISO 50006',
        details: 'Vérification du coefficient R² = 0.912 sur l’année de référence N-1.',
      }
    ]);
  }

  public static logAudit(userName: string, target: string, details: string): void {
    const logs = this.getAuditLogs();
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName,
      userRole: 'ADMIN',
      action: 'ACTION_UTILISATEUR',
      target,
      details,
    };
    logs.unshift(entry);
    if (logs.length > 100) logs.pop();
    this.save(STORAGE_KEYS.AUDIT, logs);
  }

  // Reset demo
  public static resetDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.SUBSTATIONS);
    localStorage.removeItem(STORAGE_KEYS.METERS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.ENPI);
    localStorage.removeItem(STORAGE_KEYS.SER);
    localStorage.removeItem(STORAGE_KEYS.PREVENTIVE);
    localStorage.removeItem(STORAGE_KEYS.CORRECTIVE);
    localStorage.removeItem(STORAGE_KEYS.RECETTE);
    localStorage.removeItem(STORAGE_KEYS.SAGS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
  }
}
