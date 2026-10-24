import { ElectricalMeasurement } from '../types';

interface WorkerState {
  running: boolean;
  intervalMs: number;
  tickCount: number;
  accumulators: Record<string, { ea: number; er: number }>;
}

const state: WorkerState = {
  running: true,
  intervalMs: 1500,
  tickCount: 0,
  accumulators: {},
};

// Seed initial energy accumulators
const METER_IDS = [
  ...Array.from({ length: 12 }, (_, i) => `m-pt1-${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `m-pty-${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `m-ptx-${i + 1}`),
  ...Array.from({ length: 8 }, (_, i) => `m-ptz-${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `m-pt4-${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `m-pt7-${i + 1}`),
];

METER_IDS.forEach((id) => {
  state.accumulators[id] = {
    ea: 125000 + Math.random() * 500000,
    er: 25000 + Math.random() * 90000,
  };
});

function generateHarmonics(baseThd: number): number[] {
  const harmonics: number[] = [100]; // Rang 1 = 100%
  for (let r = 2; r <= 40; r++) {
    if (r % 2 === 0) {
      // Pairs très faibles
      harmonics.push(parseFloat((Math.random() * 0.3).toFixed(2)));
    } else {
      // Impairs (3, 5, 7, 11, 13...) caractéristiques des redresseurs
      const factor = r === 3 ? 3.2 : r === 5 ? 5.8 : r === 7 ? 4.1 : r === 11 ? 2.5 : 12 / r;
      const val = (factor * (baseThd / 10)) * (0.8 + Math.random() * 0.4);
      harmonics.push(parseFloat(Math.max(0.1, val).toFixed(2)));
    }
  }
  return harmonics;
}

function generateMeasurements(): ElectricalMeasurement[] {
  state.tickCount++;
  const now = new Date().toISOString();
  const timeSec = Date.now() / 1000;
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;

  return METER_IDS.map((meterId) => {
    const isPt1 = meterId.startsWith('m-pt1');
    const isPt4 = meterId.startsWith('m-pt4');
    const isPtZ = meterId.startsWith('m-ptz');
    const isPty = meterId.startsWith('m-pty');
    const isPtx = meterId.startsWith('m-ptx');
    const isPt7 = meterId.startsWith('m-pt7');

    let substationId = 'sub-pt-y';
    if (isPt1) substationId = 'sub-pt-1';
    else if (isPt4) substationId = 'sub-pt-4';
    else if (isPtZ) substationId = 'sub-pt-z';
    else if (isPtx) substationId = 'sub-pt-x';
    else if (isPt7) substationId = 'sub-pt-7';

    // Scénario démo : Meter 5 de PT 1 (Halle Poisson) a une perte de com simulée
    if (meterId === 'm-pt1-5') {
      const isOfflineCycle = state.tickCount % 20 < 14; // Décroche régulièrement
      if (isOfflineCycle) {
        return {
          timestamp: now,
          meterId,
          substationId,
          voltagePhPh: 0,
          voltagePhN: 0,
          currentL1: 0,
          currentL2: 0,
          currentL3: 0,
          currentAvg: 0,
          activePowerKw: 0,
          reactivePowerKvar: 0,
          apparentPowerKva: 0,
          powerFactor: 0,
          activeEnergyKwh: state.accumulators[meterId]?.ea || 184500,
          reactiveEnergyKvarh: state.accumulators[meterId]?.er || 32000,
          thdU: 0,
          thdI: 0,
          frequency: 0,
          harmonics: new Array(40).fill(0),
          freshness: 'OFFLINE',
          isInvalid: true,
        };
      }
    }

    // Tension normale avec bruit blanc
    const vPhPh = 400 + (Math.sin(timeSec / 15) * 2.5) + (Math.random() * 1.2 - 0.6);
    const vPhN = vPhPh / Math.sqrt(3);
    const freq = 50 + (Math.sin(timeSec / 40) * 0.04) + (Math.random() * 0.02 - 0.01);

    // Puissance active P selon usage et profil
    let baseP = 45; // kW
    let cosPhi = 0.93 + (Math.random() * 0.04 - 0.02);

    if (meterId.endsWith('-1') || meterId.endsWith('-2')) {
      // Arrivées TGBT T1 / T2
      baseP = isPt4 ? 380 : (isPt1 ? 140 : 200);
      baseP += Math.sin(timeSec / 30) * 40;
    } else if (isPt4 && (meterId.endsWith('-3') || meterId.endsWith('-4'))) {
      // Portiques de quai PT 4 : cycle de levage dynamique
      const craneCycle = Math.abs(Math.sin(timeSec / 8)) * 180 + Math.random() * 25;
      baseP = 60 + craneCycle;
    } else if (meterId.includes('ecl') || meterId.endsWith('-3')) {
      // Éclairage (plus fort la nuit)
      baseP = isNight ? 45 + Math.random() * 5 : 2 + Math.random() * 1;
    } else if (isPtZ && meterId === 'm-ptz-4') {
      // Bâtiment Capitainerie : Cos phi dégradé (scénario démo)
      cosPhi = 0.79 + (Math.random() * 0.02 - 0.01);
      baseP = 35 + Math.random() * 10;
    } else {
      // Niches multiprises / groupes froids
      baseP = 15 + Math.sin(timeSec / 20 + parseInt(meterId.slice(-1) || '1')) * 12 + Math.random() * 6;
    }

    const activeKw = Math.max(1, parseFloat(baseP.toFixed(2)));
    const apparentKva = activeKw / cosPhi;
    const reactiveKvar = Math.sqrt(Math.max(0, apparentKva ** 2 - activeKw ** 2));
    const currentAvg = (apparentKva * 1000) / (Math.sqrt(3) * vPhPh);

    // Accumulation d'énergie
    const deltaHours = state.intervalMs / (1000 * 3600);
    state.accumulators[meterId].ea += activeKw * deltaHours;
    state.accumulators[meterId].er += reactiveKvar * deltaHours;

    const baseThdI = isPt4 ? 11.5 : (isPtZ ? 4.2 : 6.8);
    const thdU = 2.1 + (Math.random() * 0.4 - 0.2);
    const thdI = baseThdI + (Math.random() * 1.5 - 0.75);

    return {
      timestamp: now,
      meterId,
      substationId,
      voltagePhPh: parseFloat(vPhPh.toFixed(1)),
      voltagePhN: parseFloat(vPhN.toFixed(1)),
      currentL1: parseFloat((currentAvg * (0.98 + Math.random() * 0.04)).toFixed(1)),
      currentL2: parseFloat((currentAvg * (0.97 + Math.random() * 0.05)).toFixed(1)),
      currentL3: parseFloat((currentAvg * (0.99 + Math.random() * 0.03)).toFixed(1)),
      currentAvg: parseFloat(currentAvg.toFixed(1)),
      activePowerKw: activeKw,
      reactivePowerKvar: parseFloat(reactiveKvar.toFixed(2)),
      apparentPowerKva: parseFloat(apparentKva.toFixed(2)),
      powerFactor: parseFloat(cosPhi.toFixed(2)),
      activeEnergyKwh: parseFloat(state.accumulators[meterId].ea.toFixed(1)),
      reactiveEnergyKvarh: parseFloat(state.accumulators[meterId].er.toFixed(1)),
      thdU: parseFloat(thdU.toFixed(1)),
      thdI: parseFloat(thdI.toFixed(1)),
      frequency: parseFloat(freq.toFixed(2)),
      harmonics: generateHarmonics(thdU),
      freshness: 'LIVE',
      isInvalid: false,
    };
  });
}

let timer: any = null;

function loop() {
  if (!state.running) return;
  const measurements = generateMeasurements();
  postMessage({ type: 'MEASUREMENTS_UPDATE', payload: measurements, tick: state.tickCount });
  timer = setTimeout(loop, state.intervalMs);
}

// Initial start
loop();

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;
  if (type === 'START') {
    if (!state.running) {
      state.running = true;
      loop();
    }
  } else if (type === 'PAUSE') {
    state.running = false;
    if (timer) clearTimeout(timer);
  } else if (type === 'SET_SPEED') {
    state.intervalMs = Math.max(500, Math.min(10000, payload || 1500));
  } else if (type === 'RESET_DATA') {
    METER_IDS.forEach((id) => {
      state.accumulators[id] = {
        ea: 125000 + Math.random() * 500000,
        er: 25000 + Math.random() * 90000,
      };
    });
    state.tickCount = 0;
  }
};
