import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Substation, Meter, Alert, EnPI, ElectricalMeasurement } from '../types';

export class ExportService {
  /**
   * Export complet vers classeur Excel multi-feuilles (.xlsx)
   */
  public static exportFullExcel(
    substations: Substation[],
    meters: Meter[],
    alerts: Alert[],
    enpiList: EnPI[],
    measurementsMap: Record<string, ElectricalMeasurement>
  ) {
    const wb = XLSX.utils.book_new();

    // Feuille 1: Synthèse des 6 Postes
    const substationsData = substations.map(s => ({
      'Code Poste': s.code,
      'Nom du Poste': s.name,
      'Emplacement': s.locationLabel,
      'Nombre de Départs': s.feederCount,
      'Puissance Transfo (kVA)': s.installedCapacityKva,
      'Puissance Live (kW)': s.livePowerKw,
      'Énergie du Jour (kWh)': s.todayEnergyKwh,
      'Cos φ Moyen': s.powerFactor,
      'Statut Communication': s.status,
    }));
    const wsSubstations = XLSX.utils.json_to_sheet(substationsData);
    XLSX.utils.book_append_sheet(wb, wsSubstations, 'Postes Électriques');

    // Feuille 2: Les 58 Points de Comptage
    const metersData = meters.map(m => {
      const live = measurementsMap[m.id];
      return {
        'Code Compteur': m.code,
        'Désignation Départ': m.name,
        'Poste': m.substationId,
        'Catégorie': m.usageCategory,
        'Classe Précision': m.precisionClass,
        'Type Équipement': m.isExisting ? 'Existant MEIER CMM61' : 'Neuf Cl. 0.5S/0.2S',
        'Adresse IP': m.ipAddress,
        'Port': m.port,
        'Ratio TC': m.ctCaliber,
        'Puissance Active (kW)': live?.activePowerKw ?? '-',
        'Courant Moyen (A)': live?.currentAvg ?? '-',
        'Tension Ph-Ph (V)': live?.voltagePhPh ?? '-',
        'Cos φ': live?.powerFactor ?? '-',
        'Énergie Active (kWh)': live?.activeEnergyKwh ?? '-',
        'THD-I (%)': live?.thdI ?? '-',
        'Qualité / Complétude (%)': `${m.dataQualityCompleteness}%`,
        'Statut': m.status,
      };
    });
    const wsMeters = XLSX.utils.json_to_sheet(metersData);
    XLSX.utils.book_append_sheet(wb, wsMeters, '58 Points de Comptage');

    // Feuille 3: Indicateurs IPE (ISO 50001)
    const enpiData = enpiList.map(e => ({
      'Code': e.code,
      'Indicateur de Performance': e.name,
      'Formule': e.formula,
      'Cible': `${e.target} ${e.unit}`,
      'Valeur Réalisée': `${e.currentValue} ${e.unit}`,
      'Tendance': e.trend === 'DOWN' ? 'Baisse' : 'Hausse',
      'Mention': e.isDemoToValidate ? 'Démo à valider avec la DEPA' : 'Validé',
    }));
    const wsEnpi = XLSX.utils.json_to_sheet(enpiData);
    XLSX.utils.book_append_sheet(wb, wsEnpi, 'Indicateurs IPE');

    // Feuille 4: Alertes
    const alertsData = alerts.map(a => ({
      'ID': a.id,
      'Code Alerte': a.code,
      'Titre': a.title,
      'Poste': a.substationName,
      'Compteur': a.meterName || 'Général',
      'Gravité': a.severity,
      'Statut': a.status,
      'Date & Heure': a.timestamp,
      'Valeur Mesurée': a.valueRecorded || '-',
      'Seuil Dépassé': a.threshold || '-',
      'Acquitté par': a.acknowledgedBy || 'Non acquitté',
    }));
    const wsAlerts = XLSX.utils.json_to_sheet(alertsData);
    XLSX.utils.book_append_sheet(wb, wsAlerts, 'Journal des Alertes');

    // Téléchargement du fichier
    const fileName = `PortWatt_DEPA_Synthese_Energetique_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Export d'un tableau spécifique au format CSV standard (UTF-8 avec BOM)
   */
  public static exportToCsv(filename: string, rows: Record<string, any>[]) {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => {
        let val = r[h] === null || r[h] === undefined ? '' : String(r[h]);
        if (val.includes(';') || val.includes('\n') || val.includes('"')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(';'))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export d'un rapport exécutif au format PDF
   */
  public static exportPdfReport(
    substations: Substation[],
    totalPowerKw: number,
    todayTotalKwh: number,
    activeAlertsCount: number
  ) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // En-tête maritime industriel
    doc.setFillColor(10, 25, 47); // Navy foncé
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(0, 242, 254); // Cyan
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PORTWATT SME — RAPPORT ÉNERGÉTIQUE ISO 50001', 14, 16);

    doc.setTextColor(200, 220, 240);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Direction d’Exploitation du Port d’Agadir (DEPA) — Démonstrateur Fonctionnel', 14, 25);
    doc.text(`Édité le : ${dateStr}`, 14, 31);

    // Badge données simulées
    doc.setFillColor(244, 63, 94);
    doc.rect(14, 42, 182, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('AVERTISSEMENT : Données simulées par Web Worker - Démonstrateur non contractuel', 18, 48);

    // Synthèse Chiffres Clés
    doc.setTextColor(20, 30, 50);
    doc.setFontSize(13);
    doc.text('1. Indicateurs Globaux de la Plateforme Portuaire', 14, 62);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Puissance Instantanée Totale : ${totalPowerKw.toFixed(1)} kW`, 18, 72);
    doc.text(`• Consommation Active Cumulée du Jour : ${todayTotalKwh.toLocaleString('fr-FR')} kWh`, 18, 80);
    doc.text(`• Nombre de Postes Électriques Opérationnels : ${substations.length} / 6`, 18, 88);
    doc.text(`• Nombre de Points de Comptage Actifs : 58 points (46 neufs + 12 MEIER CMM61)`, 18, 96);
    doc.text(`• Alertes Actives en Cours : ${activeAlertsCount}`, 18, 104);

    // Tableau des 6 postes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('2. Répartition par Poste Électrique (TGBT)', 14, 120);

    let y = 132;
    doc.setFillColor(240, 245, 250);
    doc.rect(14, y - 6, 182, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(50, 70, 90);
    doc.text('Poste', 18, y);
    doc.text('Emplacement', 45, y);
    doc.text('Points', 105, y);
    doc.text('Live (kW)', 130, y);
    doc.text('Jour (kWh)', 158, y);
    doc.text('Statut', 185, y);

    doc.setFont('helvetica', 'normal');
    substations.forEach((s) => {
      y += 10;
      doc.setTextColor(30, 40, 60);
      doc.text(s.code, 18, y);
      doc.text(s.locationLabel.substring(0, 26), 45, y);
      doc.text(`${s.feederCount}`, 108, y);
      doc.text(`${s.livePowerKw.toFixed(1)}`, 132, y);
      doc.text(`${s.todayEnergyKwh}`, 160, y);
      doc.text(s.status, 185, y);
      doc.setDrawColor(230, 235, 245);
      doc.line(14, y + 3, 196, y + 3);
    });

    // Note de bas de page
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 160);
    doc.text('PortWatt SME — Conforme ISO 50001:2018 & Appel d’offres 12/DEPA/2026 — Hébergement Statique', 14, 285);

    doc.save(`PortWatt_Rapport_Executive_${new Date().toISOString().substring(0, 10)}.pdf`);
  }
}
