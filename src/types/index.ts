export type PrecisionClass = '0.5S' | '0.2S' | 'MEIER_CMM61';

export type MeterStatus = 'ONLINE' | 'WARNING' | 'OFFLINE';

export type UsageCategory = 
  | 'TGBT_INCOMER'
  | 'CONTAINER_REEFER'
  | 'QUAY_CRANE'
  | 'LIGHTING'
  | 'GENERATOR'
  | 'BUILDING_HVAC'
  | 'WORKSHOP_PUMP';

export interface Substation {
  id: string;
  code: 'PT_Y' | 'PT_X' | 'PT_Z' | 'PT_4' | 'PT_1' | 'PT_7';
  name: string;
  locationLabel: string;
  lat: number;
  lng: number;
  tgbtArrivals: string[];
  feederCount: number;
  transformerCount: number;
  installedCapacityKva: number;
  status: MeterStatus;
  livePowerKw: number;
  todayEnergyKwh: number;
  powerFactor: number;
}

export interface Meter {
  id: string;
  code: string;
  name: string;
  substationId: string;
  feederCode: string;
  usageCategory: UsageCategory;
  precisionClass: PrecisionClass;
  ipAddress: string;
  port: number;
  unitId: number;
  ctRatioPrimary: number; // e.g. 1000
  ctRatioSecondary: number; // 5
  ctCaliber: string; // "1000/5A"
  isExisting: boolean; // true for PT 1 MEIER CMM61
  isSubmetering: boolean; // anti-double-counting flag
  calibrationDueDate: string;
  status: MeterStatus;
  lastCommunication: string;
  dataQualityCompleteness: number; // percentage 0-100
}

export interface ElectricalMeasurement {
  timestamp: string;
  meterId: string;
  substationId: string;
  voltagePhPh: number; // V (e.g. 400.2)
  voltagePhN: number; // V (e.g. 231.0)
  currentL1: number; // A
  currentL2: number;
  currentL3: number;
  currentAvg: number;
  activePowerKw: number; // kW
  reactivePowerKvar: number; // kVAR
  apparentPowerKva: number; // kVA
  powerFactor: number; // cos phi (e.g. 0.93)
  activeEnergyKwh: number; // cumulative kWh
  reactiveEnergyKvarh: number; // cumulative kVARh
  thdU: number; // % (e.g. 2.1%)
  thdI: number; // % (e.g. 6.4%)
  frequency: number; // Hz (e.g. 50.02)
  harmonics: number[]; // Ranks 1 to 40 relative amplitudes
  freshness: 'LIVE' | 'STALE' | 'OFFLINE';
  isInvalid: boolean;
}

export interface VoltageSagEvent {
  id: string;
  meterId: string;
  meterCode: string;
  substationCode: string;
  timestamp: string;
  durationMs: number;
  depthPercent: number; // e.g. 35% drop
  residualVoltageV: number;
  classification: 'ITIC_ACCEPTABLE' | 'ITIC_PROHIBITED' | 'SEMI_F47';
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  substationId: string;
  meterId?: string;
  substationName: string;
  meterName?: string;
  timestamp: string;
  valueRecorded?: string;
  threshold?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  comments: {
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
}

export interface EnPI {
  id: string;
  code: string;
  name: string;
  formula: string;
  target: number;
  unit: string;
  currentValue: number;
  previousValue: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  isGoodDirectionDown: boolean;
  category: 'PORT_CARGO' | 'COLD_IRONING' | 'INFRASTRUCTURE';
  isDemoToValidate: boolean;
}

export interface SERModel {
  id: string;
  title: string;
  periodRef: string;
  rSquared: number;
  formula: string;
  variables: { name: string; unit: string; weight: number }[];
  baselineKwh: number;
  actualKwh: number;
  varianceKwh: number;
  variancePercent: number;
  status: 'OPTIMAL' | 'DRIFTING';
}

export interface MaintenanceChecklistTask {
  id: string;
  label: string;
  cpsReference: string;
  done: boolean;
  note?: string;
}

export interface PreventiveVisit {
  id: string;
  code: string;
  quarter: 'T1' | 'T2' | 'T3' | 'T4';
  year: number;
  dateScheduled: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  inspector: string;
  tasks: MaintenanceChecklistTask[];
}

export interface CorrectiveTicket {
  id: string;
  ticketNumber: string;
  title: string;
  substationCode: string;
  meterCode: string;
  severity: 'BLOCKING_48H' | 'NON_BLOCKING_7D';
  createdAt: string;
  slaLimit: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  technician: string;
  resolutionSummary?: string;
}

export interface RecetteTest {
  id: string;
  code: string; // T01 .. T15
  title: string;
  category: string;
  description: string;
  expectedResult: string;
  evidence: string;
  status: 'SUCCESS' | 'WARNING' | 'PENDING';
  executedBy: string;
  executedAt: string;
}

export type UserRole = 'ADMIN' | 'ENERGY_MANAGER' | 'OPERATOR' | 'VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  description: string;
  permissions: {
    canConfigureEquipment: boolean;
    canAcknowledgeAlerts: boolean;
    canEditEnPIAndSER: boolean;
    canRunRecette: boolean;
    canManageUsers: boolean;
    canExportReports: boolean;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  details: string;
}
