import { MeterStatus, PrecisionClass, Substation, Meter, Alert, EnPI, SERModel, PreventiveVisit, CorrectiveTicket, RecetteTest, VoltageSagEvent } from '../types';

export const INITIAL_SUBSTATIONS: Substation[] = [
  {
    id: 'sub-pt-y',
    code: 'PT_Y',
    name: 'Poste PT Y',
    locationLabel: 'Terminal Polyvalent & Vracs',
    lat: 30.418,
    lng: -9.625,
    tgbtArrivals: ['TGBT-Y-T1', 'TGBT-Y-T2'],
    feederCount: 9,
    transformerCount: 2,
    installedCapacityKva: 2500,
    status: 'ONLINE',
    livePowerKw: 428.4,
    todayEnergyKwh: 4890,
    powerFactor: 0.94,
  },
  {
    id: 'sub-pt-x',
    code: 'PT_X',
    name: 'Poste PT X',
    locationLabel: 'Ateliers & Quai Nord',
    lat: 30.422,
    lng: -9.628,
    tgbtArrivals: ['TGBT-X-T1', 'TGBT-X-T2'],
    feederCount: 10,
    transformerCount: 2,
    installedCapacityKva: 2000,
    status: 'ONLINE',
    livePowerKw: 312.1,
    todayEnergyKwh: 3620,
    powerFactor: 0.92,
  },
  {
    id: 'sub-pt-z',
    code: 'PT_Z',
    name: 'Poste PT Z',
    locationLabel: 'Capitainerie & Administratif',
    lat: 30.415,
    lng: -9.619,
    tgbtArrivals: ['TGBT-Z-T1', 'TGBT-Z-T2'],
    feederCount: 8,
    transformerCount: 2,
    installedCapacityKva: 1600,
    status: 'WARNING', // Scénario démo : cos phi dégradé sur le départ Bâtiment Admin
    livePowerKw: 189.6,
    todayEnergyKwh: 2150,
    powerFactor: 0.84, // Cos phi bas -> génère alerte
  },
  {
    id: 'sub-pt-4',
    code: 'PT_4',
    name: 'Poste PT 4',
    locationLabel: 'Terminal Conteneurs & Portiques',
    lat: 30.411,
    lng: -9.632,
    tgbtArrivals: ['TGBT-4-T1', 'TGBT-4-T2'],
    feederCount: 9, // 9 points actifs + 1 réserve identifiée (59 départs total dans CPS)
    transformerCount: 2,
    installedCapacityKva: 3200,
    status: 'ONLINE', // Scénario démo : Fort pic d'activité (chargement navire porte-conteneurs)
    livePowerKw: 845.8,
    todayEnergyKwh: 9840,
    powerFactor: 0.95,
  },
  {
    id: 'sub-pt-1',
    code: 'PT_1',
    name: 'Poste PT 1',
    locationLabel: 'Quai Roulier Ro-Ro & Pêche',
    lat: 30.419,
    lng: -9.613,
    tgbtArrivals: ['TGBT-1-T1', 'TGBT-1-T2'],
    feederCount: 12, // 12 compteurs existants MEIER CMM61
    transformerCount: 2,
    installedCapacityKva: 2000,
    status: 'WARNING', // Scénario démo : perte com ponctuelle sur CMM61 #105
    livePowerKw: 295.2,
    todayEnergyKwh: 3410,
    powerFactor: 0.91,
  },
  {
    id: 'sub-pt-7',
    code: 'PT_7',
    name: 'Poste PT 7',
    locationLabel: 'Zone Industrielle Est & Phare',
    lat: 30.426,
    lng: -9.610,
    tgbtArrivals: ['TGBT-7-T1', 'TGBT-7-T2'],
    feederCount: 10,
    transformerCount: 2,
    installedCapacityKva: 2500,
    status: 'ONLINE',
    livePowerKw: 367.5,
    todayEnergyKwh: 4230,
    powerFactor: 0.93,
  },
];

// Génération des 58 points de comptage actifs
export const INITIAL_METERS: Meter[] = [
  // ================= PT 1 : 12 COMPTEURS EXISTANTS MEIER CMM61 =================
  ...Array.from({ length: 12 }, (_, i) => {
    const idx = i + 1;
    const isArrivee = idx <= 2;
    const ipLast = 100 + idx;
    return {
      id: `m-pt1-${idx}`,
      code: `M-PT1-${String(idx).padStart(2, '0')}`,
      name: isArrivee ? `Arrivée TGBT T${idx} (PT 1)` : `Départ PT1-${String(idx).padStart(2, '0')} ${['Niche RoRo 1', 'Niche RoRo 2', 'Niche Pêche A', 'Niche Pêche B', 'Halle Poisson', 'Éclairage Quai', 'Pompage Cale', 'Grue Mobile 1', 'Atelier Pêche', 'Auxiliaires'][idx - 3]}`,
      substationId: 'sub-pt-1',
      feederCode: isArrivee ? `ARR-T${idx}` : `DEP-D${idx - 2}`,
      usageCategory: (isArrivee ? 'TGBT_INCOMER' : (idx <= 6 ? 'CONTAINER_REEFER' : (idx === 7 ? 'LIGHTING' : 'WORKSHOP_PUMP'))) as any,
      precisionClass: 'MEIER_CMM61' as const,
      ipAddress: `192.168.10.${ipLast}`,
      port: 502,
      unitId: idx,
      ctRatioPrimary: isArrivee ? 1600 : (idx <= 6 ? 400 : 250),
      ctRatioSecondary: 5,
      ctCaliber: isArrivee ? '1600/5A' : (idx <= 6 ? '400/5A' : '250/5A'),
      isExisting: true,
      isSubmetering: !isArrivee,
      calibrationDueDate: '2027-04-15',
      status: (idx === 5 ? 'WARNING' : 'ONLINE') as MeterStatus, // Scénario démo : meter 5 perte com simulée
      lastCommunication: idx === 5 ? 'Il y a 14 min' : 'Il y a 2 sec',
      dataQualityCompleteness: idx === 5 ? 91.2 : 99.8,
    };
  }),

  // ================= PT Y : 9 POINTS NEUFS (4 Cl. 0.5S + 5 Cl. 0.2S) =================
  ...Array.from({ length: 9 }, (_, i) => {
    const idx = i + 1;
    const isArrivee = idx <= 2;
    const is05S = idx <= 4; // T1, T2, Eclairage, Batiment
    return {
      id: `m-pty-${idx}`,
      code: `M-PTY-${String(idx).padStart(2, '0')}`,
      name: isArrivee 
        ? `TGBT Arrivée T${idx} (PT Y)` 
        : (idx === 3 ? 'Départ Éclairage Quais & Voieries' : (idx === 4 ? 'Départ Bâtiment Exploitation' : `Niche Multiprise Quai Vrac ${idx - 4}`)),
      substationId: 'sub-pt-y',
      feederCode: isArrivee ? `ARR-T${idx}` : `DEP-Y${idx - 2}`,
      usageCategory: (isArrivee ? 'TGBT_INCOMER' : (idx === 3 ? 'LIGHTING' : (idx === 4 ? 'BUILDING_HVAC' : 'CONTAINER_REEFER'))) as any,
      precisionClass: (is05S ? '0.5S' : '0.2S') as PrecisionClass,
      ipAddress: `192.168.20.${100 + idx}`,
      port: 502,
      unitId: 1,
      ctRatioPrimary: isArrivee ? 2000 : (is05S ? 400 : 250),
      ctRatioSecondary: 5,
      ctCaliber: isArrivee ? '2000/5A' : (is05S ? '400/5A' : '250/5A'),
      isExisting: false,
      isSubmetering: !isArrivee,
      calibrationDueDate: '2028-10-10',
      status: 'ONLINE' as const,
      lastCommunication: 'Il y a 1 sec',
      dataQualityCompleteness: 99.9,
    };
  }),

  // ================= PT X : 10 POINTS NEUFS (4 Cl. 0.5S + 6 Cl. 0.2S) =================
  ...Array.from({ length: 10 }, (_, i) => {
    const idx = i + 1;
    const isArrivee = idx <= 2;
    const is05S = idx <= 4; // T1, T2, Groupes Electrogènes, Ateliers
    return {
      id: `m-ptx-${idx}`,
      code: `M-PTX-${String(idx).padStart(2, '0')}`,
      name: isArrivee 
        ? `TGBT Arrivée T${idx} (PT X)` 
        : (idx === 3 ? 'Départ Groupe Électrogène Secours' : (idx === 4 ? 'Départ Ateliers & Maintenance' : `Niche Multiprise Quai Nord ${idx - 4}`)),
      substationId: 'sub-pt-x',
      feederCode: isArrivee ? `ARR-T${idx}` : `DEP-X${idx - 2}`,
      usageCategory: (isArrivee ? 'TGBT_INCOMER' : (idx === 3 ? 'GENERATOR' : (idx === 4 ? 'WORKSHOP_PUMP' : 'CONTAINER_REEFER'))) as any,
      precisionClass: (is05S ? '0.5S' : '0.2S') as PrecisionClass,
      ipAddress: `192.168.30.${100 + idx}`,
      port: 502,
      unitId: 1,
      ctRatioPrimary: isArrivee ? 1600 : (is05S ? 630 : 250),
      ctRatioSecondary: 5,
      ctCaliber: isArrivee ? '1600/5A' : (is05S ? '630/5A' : '250/5A'),
      isExisting: false,
      isSubmetering: !isArrivee,
      calibrationDueDate: '2028-10-12',
      status: 'ONLINE' as const,
      lastCommunication: 'Il y a 3 sec',
      dataQualityCompleteness: 99.7,
    };
  }),

  // ================= PT Z : 8 POINTS NEUFS (4 Cl. 0.5S + 4 Cl. 0.2S) =================
  ...Array.from({ length: 8 }, (_, i) => {
    const idx = i + 1;
    const isArrivee = idx <= 2;
    const is05S = idx <= 4;
    return {
      id: `m-ptz-${idx}`,
      code: `M-PTZ-${String(idx).padStart(2, '0')}`,
      name: isArrivee 
        ? `TGBT Arrivée T${idx} (PT Z)` 
        : (idx === 3 ? 'Départ Éclairage Voieries & Rond-point' : (idx === 4 ? 'Départ Bâtiment Capitainerie' : `Niche Multiprise Quai Capitainerie ${idx - 4}`)),
      substationId: 'sub-pt-z',
      feederCode: isArrivee ? `ARR-T${idx}` : `DEP-Z${idx - 2}`,
      usageCategory: (isArrivee ? 'TGBT_INCOMER' : (idx === 3 ? 'LIGHTING' : (idx === 4 ? 'BUILDING_HVAC' : 'CONTAINER_REEFER'))) as any,
      precisionClass: (is05S ? '0.5S' : '0.2S') as PrecisionClass,
      ipAddress: `192.168.40.${100 + idx}`,
      port: 502,
      unitId: 1,
      ctRatioPrimary: isArrivee ? 1250 : (is05S ? 250 : 125),
      ctRatioSecondary: 5,
      ctCaliber: isArrivee ? '1250/5A' : (is05S ? '250/5A' : '125/5A'),
      isExisting: false,
      isSubmetering: !isArrivee,
      calibrationDueDate: '2028-10-15',
      status: (idx === 4 ? 'WARNING' : 'ONLINE') as MeterStatus, // Scénario démo : Cos phi bas sur Bât Capitainerie
      lastCommunication: 'Il y a 2 sec',
      dataQualityCompleteness: 99.6,
    };
  }),

  // ================= PT 4 : 9 POINTS NEUFS (4 Cl. 0.5S + 5 Cl. 0.2S) =================
  ...Array.from({ length: 9 }, (_, i) => {
    const idx = i + 1;
    const isArrivee = idx <= 2;
    const is05S = idx <= 4;
    return {
      id: `m-pt4-${idx}`,
      code: `M-PT4-${String(idx).padStart(2, '0')}`,
      name: isArrivee 
        ? `TGBT Arrivée T${idx} (PT 4)` 
        : (idx === 3 ? 'Départ Portique Quai 1' : (idx === 4 ? 'Départ Portique Quai 2' : `Niche Multiprise Frigorifique ${idx - 4}`)),
      substationId: 'sub-pt-4',
      feederCode: isArrivee ? `ARR-T${idx}` : `DEP-4${idx - 2}`,
      usageCategory: (isArrivee ? 'TGBT_INCOMER' : (idx <= 4 ? 'QUAY_CRANE' : 'CONTAINER_REEFER')) as any,
      precisionClass: (is05S ? '0.5S' : '0.2S') as PrecisionClass,
      ipAddress: `192.168.50.${100 + idx}`,
      port: 502,
      unitId: 1,
      ctRatioPrimary: isArrivee ? 2000 : (is05S ? 1000 : 400),
      ctRatioSecondary: 5,
      ctCaliber: isArrivee ? '2000/5A' : (is05S ? '1000/5A' : '400/5A'),
      isExisting: false,
      isSubmetering: !isArrivee,
      calibrationDueDate: '2028-10-20',
      status: 'ONLINE' as const,
      lastCommunication: 'Il y a 1 sec',
      dataQualityCompleteness: 99.9,
    };
  }),

  // ================= PT 7 : 10 POINTS NEUFS (4 Cl. 0.5S + 6 Cl. 0.2S) =================
  ...Array.from({ length: 10 }, (_, i) => {
    const idx = i + 1;
    const isArrivee = idx <= 2;
    const is05S = idx <= 4;
    return {
      id: `m-pt7-${idx}`,
      code: `M-PT7-${String(idx).padStart(2, '0')}`,
      name: isArrivee 
        ? `TGBT Arrivée T${idx} (PT 7)` 
        : (idx === 3 ? 'Départ Éclairage Mât Phare & Enceinte' : (idx === 4 ? 'Départ Station de Pompage Eaux' : `Niche Terre-plein Industriel ${idx - 4}`)),
      substationId: 'sub-pt-7',
      feederCode: isArrivee ? `ARR-T${idx}` : `DEP-7${idx - 2}`,
      usageCategory: (isArrivee ? 'TGBT_INCOMER' : (idx === 3 ? 'LIGHTING' : (idx === 4 ? 'WORKSHOP_PUMP' : 'CONTAINER_REEFER'))) as any,
      precisionClass: (is05S ? '0.5S' : '0.2S') as PrecisionClass,
      ipAddress: `192.168.60.${100 + idx}`,
      port: 502,
      unitId: 1,
      ctRatioPrimary: isArrivee ? 2000 : (is05S ? 400 : 250),
      ctRatioSecondary: 5,
      ctCaliber: isArrivee ? '2000/5A' : (is05S ? '400/5A' : '250/5A'),
      isExisting: false,
      isSubmetering: !isArrivee,
      calibrationDueDate: '2028-10-25',
      status: 'ONLINE' as const,
      lastCommunication: 'Il y a 2 sec',
      dataQualityCompleteness: 99.8,
    };
  }),
];

// Alertes initiales (Histoire de démo réaliste)
export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-01',
    code: 'ALT_COMM_LOSS',
    title: 'Perte de communication Modbus TCP',
    description: 'Absence de réponse du compteur existant MEIER CMM61 après 5 tentatives consécutives.',
    severity: 'WARNING',
    status: 'NEW',
    substationId: 'sub-pt-1',
    meterId: 'm-pt1-5',
    substationName: 'Poste PT 1 (Quai Ro-Ro & Pêche)',
    meterName: 'M-PT1-05 (Halle Poisson)',
    timestamp: '2026-10-24 12:48:15',
    valueRecorded: 'Timeout 1500 ms',
    threshold: 'Max 3 essais / 1000 ms',
    comments: [
      {
        id: 'c-1',
        author: 'Système PortWatt',
        text: 'Déconnexion détectée automatiquement par le service d’acquisition Modbus.',
        timestamp: '2026-10-24 12:48:15',
      }
    ],
  },
  {
    id: 'alt-02',
    code: 'ALT_LOW_PF',
    title: 'Facteur de puissance (cos φ) dégradé',
    description: 'Cos φ mesuré à 0.79 sur le départ Bâtiment Capitainerie, inférieur au seuil contractuel ONEE (0.85).',
    severity: 'WARNING',
    status: 'ACKNOWLEDGED',
    substationId: 'sub-pt-z',
    meterId: 'm-ptz-4',
    substationName: 'Poste PT Z (Capitainerie)',
    meterName: 'M-PTZ-04 (Départ Bâtiment Capitainerie)',
    timestamp: '2026-10-24 11:15:30',
    valueRecorded: 'cos φ = 0.79',
    threshold: 'cos φ min = 0.85',
    acknowledgedBy: 'Youssef El Mansouri (Responsable Énergie)',
    acknowledgedAt: '2026-10-24 11:32:00',
    comments: [
      {
        id: 'c-2',
        author: 'Youssef El Mansouri',
        text: 'Vérification de la batterie de condensateurs locale demandée à l’équipe de maintenance.',
        timestamp: '2026-10-24 11:32:00',
      }
    ],
  },
  {
    id: 'alt-03',
    code: 'ALT_POWER_PEAK',
    title: 'Pic de puissance sur déchargement navire',
    description: 'Dépassement de la puissance souscrite estimée au PT 4 lié à la cadence simultanée des portiques 1 et 2.',
    severity: 'INFO',
    status: 'RESOLVED',
    substationId: 'sub-pt-4',
    meterId: 'm-pt4-3',
    substationName: 'Poste PT 4 (Terminal Conteneurs)',
    meterName: 'M-PT4-03 (Portique Quai 1)',
    timestamp: '2026-10-24 09:10:00',
    valueRecorded: 'P = 620 kW',
    threshold: 'P max = 550 kW',
    acknowledgedBy: 'Karim Tazi (Exploitant)',
    acknowledgedAt: '2026-10-24 09:15:00',
    resolvedAt: '2026-10-24 10:45:00',
    comments: [
      {
        id: 'c-3',
        author: 'Karim Tazi',
        text: 'Arrivée du navire CMA CGM Agadir. Cycle de levage haute cadence achevé.',
        timestamp: '2026-10-24 10:45:00',
      }
    ],
  },
];

// Creux de tension enregistrés (Voltage Sags)
export const INITIAL_SAGS: VoltageSagEvent[] = [
  {
    id: 'sag-1',
    meterId: 'm-pt4-1',
    meterCode: 'M-PT4-01',
    substationCode: 'PT 4',
    timestamp: '2026-10-24 06:14:22',
    durationMs: 120,
    depthPercent: 32, // Tension résiduelle 68%
    residualVoltageV: 272,
    classification: 'ITIC_ACCEPTABLE',
  },
  {
    id: 'sag-2',
    meterId: 'm-pty-2',
    meterCode: 'M-PTY-02',
    substationCode: 'PT Y',
    timestamp: '2026-10-23 18:42:05',
    durationMs: 250,
    depthPercent: 44, // Tension résiduelle 56%
    residualVoltageV: 224,
    classification: 'SEMI_F47',
  },
  {
    id: 'sag-3',
    meterId: 'm-ptx-1',
    meterCode: 'M-PTX-01',
    substationCode: 'PT X',
    timestamp: '2026-10-22 02:11:50',
    durationMs: 80,
    depthPercent: 25,
    residualVoltageV: 300,
    classification: 'ITIC_ACCEPTABLE',
  },
];

// Indicateurs de performance ISO 50001 (IPE)
export const INITIAL_ENPI: EnPI[] = [
  {
    id: 'enpi-1',
    code: 'IPE-01',
    name: 'Consommation Spécifique Manutention Conteneurs',
    formula: 'Total Énergie Portiques & Niches Frigo (kWh) / Nombre EVP manipulés',
    target: 14.2,
    unit: 'kWh / EVP',
    currentValue: 13.85,
    previousValue: 14.60,
    trend: 'DOWN',
    isGoodDirectionDown: true,
    category: 'PORT_CARGO',
    isDemoToValidate: true,
  },
  {
    id: 'enpi-2',
    code: 'IPE-02',
    name: 'Consommation Spécifique Vrac & Marchandises',
    formula: 'Énergie Grues & Engins PT Y (kWh) / Tonnes déchargées',
    target: 1.15,
    unit: 'kWh / tonne',
    currentValue: 1.09,
    previousValue: 1.18,
    trend: 'DOWN',
    isGoodDirectionDown: true,
    category: 'PORT_CARGO',
    isDemoToValidate: true,
  },
  {
    id: 'enpi-3',
    code: 'IPE-03',
    name: 'Alimentation Quai Navires (Cold Ironing)',
    formula: 'Énergie Niches Quai PT 4 & PT 1 (kWh) / Nombre d’escales',
    target: 450,
    unit: 'kWh / escale',
    currentValue: 462,
    previousValue: 440,
    trend: 'UP',
    isGoodDirectionDown: true,
    category: 'COLD_IRONING',
    isDemoToValidate: true,
  },
  {
    id: 'enpi-4',
    code: 'IPE-04',
    name: 'Efficacité Énergétique Éclairage Terre-pleins',
    formula: 'Énergie Éclairage (kWh) / (Heures d’obscurité × Surface ha)',
    target: 0.85,
    unit: 'kWh / (h × ha)',
    currentValue: 0.78,
    previousValue: 0.82,
    trend: 'DOWN',
    isGoodDirectionDown: true,
    category: 'INFRASTRUCTURE',
    isDemoToValidate: true,
  },
];

// Situation Énergétique de Référence (SER)
export const INITIAL_SER: SERModel = {
  id: 'ser-2025-baseline',
  title: 'SER Port d’Agadir — Modèle de Normalisation Annuel (ISO 50006)',
  periodRef: 'Année 2025 (12 mois consolidés)',
  rSquared: 0.912,
  formula: 'E_est (MWh) = 0.048 × Tonnes + 1.25 × Navires + 0.82 × DJF + 285.4',
  variables: [
    { name: 'Tonnage brut manutentionné', unit: 'kTonnes', weight: 0.048 },
    { name: 'Escales de navires', unit: 'Escales', weight: 1.25 },
    { name: 'Degrés Jours de Froid (DJF)', unit: '°C-jour', weight: 0.82 },
  ],
  baselineKwh: 4250000,
  actualKwh: 3985000,
  varianceKwh: -265000, // Économie d'énergie
  variancePercent: -6.23, // 6.23% d'économie réalisée
  status: 'OPTIMAL',
};

// 4 Visites préventives contractuelles (Garantie 24 mois)
export const INITIAL_PREVENTIVE_VISITS: PreventiveVisit[] = [
  {
    id: 'v-q1-2026',
    code: 'PREV-2026-T1',
    quarter: 'T1',
    year: 2026,
    dateScheduled: '2026-03-18',
    status: 'COMPLETED',
    inspector: 'Bureau Veritas / Prestataire Titulaire',
    tasks: [
      { id: 't1', label: 'Contrôle visuel des armoires et fixations centrales', cpsReference: 'Art. 8.2', done: true },
      { id: 't2', label: 'Vérification thermographique infrarouge des raccordements TC', cpsReference: 'Art. 8.2', done: true },
      { id: 't3', label: 'Vérification communication Modbus TCP/IP sur tous les postes', cpsReference: 'Art. 8.3', done: true },
      { id: 't4', label: 'Sauvegarde des configurations et bases de données', cpsReference: 'Art. 8.4', done: true },
    ],
  },
  {
    id: 'v-q2-2026',
    code: 'PREV-2026-T2',
    quarter: 'T2',
    year: 2026,
    dateScheduled: '2026-06-20',
    status: 'COMPLETED',
    inspector: 'Ingénieur Maintenance Titulaire',
    tasks: [
      { id: 't5', label: 'Contrôle d’isolement et étalonnage métrologique annuel', cpsReference: 'Art. 8.2', done: true },
      { id: 't6', label: 'Nettoyage des filtres de ventilation armoires électriques', cpsReference: 'Art. 8.2', done: true },
      { id: 't7', label: 'Test de basculement secours et synchronisation horloge NTP', cpsReference: 'Art. 8.3', done: true },
      { id: 't8', label: 'Audit de complétude des données stockées', cpsReference: 'Art. 8.4', done: true },
    ],
  },
  {
    id: 'v-q3-2026',
    code: 'PREV-2026-T3',
    quarter: 'T3',
    year: 2026,
    dateScheduled: '2026-09-24',
    status: 'COMPLETED',
    inspector: 'Bureau Veritas & Équipe DEPA',
    tasks: [
      { id: 't9', label: 'Thermographie des 138 TC split-core sous charge maximale', cpsReference: 'Art. 8.2', done: true },
      { id: 't10', label: 'Contrôle intégrité bus Ethernet cuivre et fibre optique', cpsReference: 'Art. 8.3', done: true },
      { id: 't11', label: 'Revue des alertes de qualité d’énergie (THD, sags)', cpsReference: 'Art. 8.4', done: true },
      { id: 't12', label: 'Émission du procès-verbal trimestriel contractuel', cpsReference: 'Art. 8.5', done: true },
    ],
  },
  {
    id: 'v-q4-2026',
    code: 'PREV-2026-T4',
    quarter: 'T4',
    year: 2026,
    dateScheduled: '2026-12-15',
    status: 'PLANNED',
    inspector: 'Responsable Énergie DEPA & Prestataire',
    tasks: [
      { id: 't13', label: 'Audit métrologique complet et vérification des certificats', cpsReference: 'Art. 8.2', done: false },
      { id: 't14', label: 'Contrôle des alimentations secourues 24V DC des centrales', cpsReference: 'Art. 8.2', done: false },
      { id: 't15', label: 'Rapport annuel ISO 50001 et bilan de disponibilité', cpsReference: 'Art. 8.5', done: false },
    ],
  },
];

// Tickets de maintenance corrective (SLA 48h bloquant / 7j non bloquant)
export const INITIAL_CORRECTIVE_TICKETS: CorrectiveTicket[] = [
  {
    id: 'tick-01',
    ticketNumber: 'TK-2026-0042',
    title: 'Défaut de réponse Modbus CMM61 Halle Poisson',
    substationCode: 'PT 1',
    meterCode: 'M-PT1-05',
    severity: 'NON_BLOCKING_7D',
    createdAt: '2026-10-24 12:49:00',
    slaLimit: '2026-10-31 18:00:00 (7 jours)',
    status: 'IN_PROGRESS',
    technician: 'Mehdi Bennani',
    resolutionSummary: 'Diagnostic en cours : switch d’étage Quai Ro-Ro à vérifier.',
  },
  {
    id: 'tick-02',
    ticketNumber: 'TK-2026-0038',
    title: 'Remplacement TC split-core 400A Niche Frigo 2 (dérive de mesure)',
    substationCode: 'PT 4',
    meterCode: 'M-PT4-06',
    severity: 'NON_BLOCKING_7D',
    createdAt: '2026-10-20 08:30:00',
    slaLimit: '2026-10-27 18:00:00',
    status: 'RESOLVED',
    technician: 'Hassan Amrani',
    resolutionSummary: 'TC de rechange issu du stock pièces critiques remplacé. Étalonnage validé classe 0.2S.',
  },
];

// Les 15 Tests de Recette T01 à T15 (Conformes au CPS)
export const INITIAL_RECETTE_TESTS: RecetteTest[] = [
  {
    id: 'rec-t01',
    code: 'T01',
    title: 'Connectivité Modbus TCP/IP sur 58 points',
    category: 'Communication',
    description: 'Vérification du ping réseau et de la réponse aux trames Modbus fonction 03/04 sur tous les postes.',
    expectedResult: '100% des 58 adresses IP répondent sans perte de paquet.',
    evidence: 'Log d’interrogation Modbus validé (57/58 en ligne, 1 en cours de diagnostic simulateur).',
    status: 'SUCCESS',
    executedBy: 'Audit Recette DEPA',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t02',
    code: 'T02',
    title: 'Cartographie des Registres & Facteurs d’échelle',
    category: 'Métrologie',
    description: 'Contrôle de conformité de l’affectation des registres Float32 / Int32 et ratios TC.',
    expectedResult: 'Tensions à 400V +/- 5%, cohérence des courants primaires/secondaires.',
    evidence: 'Table de mappage certifiée conforme au dossier technique d’exécution.',
    status: 'SUCCESS',
    executedBy: 'Bureau de Contrôle',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t03',
    code: 'T03',
    title: 'Horodatage et Synchronisation NTP',
    category: 'Système',
    description: 'Vérification de la synchronisation de l’horloge centrale avec le serveur NTP Port d’Agadir.',
    expectedResult: 'Écart d’horloge inférieur à 50 millisecondes sur tous les équipements.',
    evidence: 'Serveur NTP 192.168.1.10 synchronisé, gigue < 2 ms.',
    status: 'SUCCESS',
    executedBy: 'Administrateur Réseau',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t04',
    code: 'T04',
    title: 'Comportement sur Perte de Communication',
    category: 'Résilience',
    description: 'Simulation de déconnexion d’un poste et vérification de la détection d’alerte.',
    expectedResult: 'Génération immédiate d’une alerte visuelle et horodatage du dernier état connu.',
    evidence: 'Alerte générée en moins de 3 secondes avec badge « Hors ligne » sans freeze UI.',
    status: 'SUCCESS',
    executedBy: 'Audit Recette DEPA',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t05',
    code: 'T05',
    title: 'Reprise après Coupure Réseau sans Perte ni Doublon',
    category: 'Résilience',
    description: 'Rétablissement du lien après 30 minutes de coupure et réconciliation d’index.',
    expectedResult: 'Aucune donnée dupliquée, continuité d’énergie garantie.',
    evidence: 'Index d’énergie cumulée réaligné sur la valeur hardware de la centrale.',
    status: 'SUCCESS',
    executedBy: 'Prestataire & DEPA',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t06',
    code: 'T06',
    title: 'Tableau de Bord Multisites & Temps Réel',
    category: 'IHM',
    description: 'Affichage des 6 postes sur carte portuaire avec KPIs et sparklines.',
    expectedResult: 'Temps de rafraîchissement < 2 secondes, navigation fluide.',
    evidence: 'Test ergonomique validé sur écrans de supervision et tablettes.',
    status: 'SUCCESS',
    executedBy: 'Exploitation DEPA',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t07',
    code: 'T07',
    title: 'Synoptiques Unifilaires & Dynamique des Flux',
    category: 'IHM',
    description: 'Animation interactive des flux d’énergie selon la charge mesurée.',
    expectedResult: 'Visualisation claire TGBT T1/T2 vers les départs secondaires.',
    evidence: 'Synoptique interactif testé avec succès sur les 6 postes.',
    status: 'SUCCESS',
    executedBy: 'Service Électrique',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t08',
    code: 'T08',
    title: 'Spectre Harmonique et Creux de Tension',
    category: 'Qualité Énergie',
    description: 'Enregistrement des harmoniques rang 1 à 40 et détection creux EN 50160.',
    expectedResult: 'Spectre lisible avec seuils CEI et journalisation des événements transitoires.',
    evidence: 'Graphique harmonique et courbe ITIC opérationnels.',
    status: 'SUCCESS',
    executedBy: 'Expert Métrologie',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t09',
    code: 'T09',
    title: 'Indicateurs de Performance Énergétique (IPE)',
    category: 'ISO 50001',
    description: 'Calcul automatique des kWh/EVP, kWh/tonne et cold ironing.',
    expectedResult: 'Formules configurables et traçables avec avertissement démo.',
    evidence: 'Moteur de calcul validé sur données simulées et historiques.',
    status: 'SUCCESS',
    executedBy: 'Responsable Énergie',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t10',
    code: 'T10',
    title: 'Situation Énergétique de Référence (SER / EnB)',
    category: 'ISO 50001',
    description: 'Modèle de régression multivariable et calcul des écarts réels vs baseline.',
    expectedResult: 'Coefficient R² > 0.85 et note de calcul exportable.',
    evidence: 'Modèle validé avec R² = 0.912.',
    status: 'SUCCESS',
    executedBy: 'Auditeur ISO 50001',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t11',
    code: 'T11',
    title: 'Moteur d’Alertes & Gestion du Cycle de Vie',
    category: 'Alertes',
    description: 'Création, prise en charge et clôture d’alertes avec journalisation.',
    expectedResult: 'Traçabilité complète des acquittements et commentaires horodatés.',
    evidence: 'Workflow complet Nouvelle -> Prise en charge -> Clôturée testé.',
    status: 'SUCCESS',
    executedBy: 'Exploitation DEPA',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t12',
    code: 'T12',
    title: 'Génération & Export des Rapports ISO 50001',
    category: 'Reporting',
    description: 'Exportation de bilans au format PDF, CSV et Excel sans serveur.',
    expectedResult: 'Fichiers exploitables générés instantanément côté client.',
    evidence: 'Téléchargement validé des formats PDF, CSV et Excel.',
    status: 'SUCCESS',
    executedBy: 'Responsable Énergie',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t13',
    code: 'T13',
    title: 'Intégration sans Duplication du Poste PT 1',
    category: 'Intégration',
    description: 'Contrôle anti-double comptage entre les arrivées T1/T2 et les 10 départs CMM61.',
    expectedResult: 'Drapeau submetering actif, aucun cumul erroné dans le bilan portuaire.',
    evidence: 'Équilibre de puissance testé : Somme départs <= Arrivées T1+T2.',
    status: 'SUCCESS',
    executedBy: 'Chef de Projet SI',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t14',
    code: 'T14',
    title: 'Gestion des Habilitations (RBAC)',
    category: 'Sécurité',
    description: 'Vérification du filtrage des fonctionnalités selon le profil utilisateur.',
    expectedResult: 'Lecteur en consultation seule, Administrateur autorisé aux réglages critiques.',
    evidence: 'Matrice des droits vérifiée pour les 4 profils du sélecteur.',
    status: 'SUCCESS',
    executedBy: 'Responsable Sécurité SI',
    executedAt: '2026-10-24',
  },
  {
    id: 'rec-t15',
    code: 'T15',
    title: 'Mode Formation & Visite Guidée Utilisateurs',
    category: 'Accompagnement',
    description: 'Vérification du parcours guidé interactif pour exploitants et administrateurs.',
    expectedResult: 'Visite étape par étape fonctionnelle avec explication claire de chaque module.',
    evidence: 'Parcours guidé 10 étapes opérationnel sur l’application.',
    status: 'SUCCESS',
    executedBy: 'Formateur & Équipe DEPA',
    executedAt: '2026-10-24',
  },
];
