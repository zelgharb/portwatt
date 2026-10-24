# PortWatt SME — Document des Hypothèses & Points à Confirmer
**Projet** : Système de Monitoring Énergétique ISO 50001:2018  
**Client** : Direction d'Exploitation du Port d'Agadir (DEPA)  
**Appel d'Offres** : N° 12/DEPA/2026  
**Statut** : Document de référence contractuelle & technique  

---

## 1. Périmètre des Postes et Recensement des Points de Comptage

### 1.1. Écart d'inventaire : 58 points actifs vs 59 départs recensés
- **Constat** : Le CPS mentionne 58 points de comptage actifs au total (46 neufs + 12 existants au Poste PT 1). Cependant, l'inventaire unifilaire détaillé des départs physiques des 6 postes (PT Y, PT X, PT Z, PT 4, PT 1, PT 7) recense 59 départs physiques au niveau des tableaux TGBT.
- **Hypothèse retenue dans PortWatt SME** :
  - Les **58 points de comptage actifs** sont modélisés et dotés d'une centrale de mesure (ou compteur existant CMM61).
  - Le 59ème départ (départ « Réserve Niche Quai Ouest » au Poste PT 4) est identifié dans le synoptique comme **« Départ Réserve Non Instrumenté »** (disjoncteur présent, sans TC ni centrale).
  - **Action DEPA requise** : Confirmer en phase de recette si la réserve PT 4 doit recevoir un 59ème compteur ou rester en réserve d'extension future.

### 1.2. Répartition des Équipements Neufs et Existants
| Poste | TGBT Arrivées | Départs Secondaires | Compteurs Neufs Cl. 0.5S | Compteurs Neufs Cl. 0.2S | Compteurs Existants (MEIER CMM61) | Total Points |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **PT 1** | T1 + T2 | 10 départs | 0 (conservés) | 0 | **12** (CMM61 Modbus TCP) | **12** |
| **PT Y** | T1 + T2 | 7 départs | 4 (T1, T2, Ecl, Bât) | 5 (Niches 1-5) | 0 | **9** |
| **PT X** | T1 + T2 | 8 départs | 4 (T1, T2, GE, Ateliers) | 6 (Niches 1-6) | 0 | **10** |
| **PT Z** | T1 + T2 | 6 départs | 4 (T1, T2, Ecl, Bât Admin) | 4 (Niches 1-4) | 0 | **8** |
| **PT 4** | T1 + T2 | 8 départs (+1 rés.) | 4 (T1, T2, Portique 1, Portique 2) | 5 (Niches Frigo Quai) | 0 | **9** |
| **PT 7** | T1 + T2 | 8 départs | 4 (T1, T2, Éclairage Phare, Pompage) | 6 (Niches Terre-plein) | 0 | **10** |
| **TOTAL** | **12** | **47** | **20 (Classe 0.5S)** | **26 (Classe 0.2S)** | **12 (MEIER CMM61)** | **58** |

---

## 2. Intégration des Compteurs Existants MEIER CMM61 (PT 1)

- **Protocole** : Modbus TCP/IP natif sur port Ethernet 502 standard.
- **Règle anti-doublon & anti-double comptage** :
  - Les 12 compteurs existants mesurent déjà une partie des départs du PT 1.
  - La logique du bilan d'énergie au PT 1 applique la règle :
    $$\Delta E_{\text{pertes/non-mesuré}} = E_{\text{Arrivées (T1 + T2)}} - \sum_{i=1}^{10} E_{\text{départs CMM61}}$$
  - Si un départ est mesuré à la fois en amont et en sous-comptage, un marqueur de tag `is_submetering=true` est attribué pour empêcher l'addition dans le bilan global du port.
- **Cartographie de Registres CMM61** :
  - Adresses de registres configurables via l'interface d'administration (Registres 30001 à 30040 pour U, I, P, Q, cos φ, F, Ea, Er).

---

## 3. Spécifications des Transformateurs de Courant (TC)

- **Quantité** : 138 Transformateurs de Courant split-core (ouvrants), soit 3 TC par point de comptage triphasé (46 départs neufs $\times$ 3 = 138 TC).
- **Calibres** : 63 A, 125 A, 250 A, 400 A, 630 A, 1000 A, 1600 A, 2000 A avec secondaire normalisé …/5 A.
- **Classe de précision TC** : 0.5 ou 0.2 conforme à la classe de la centrale associée.

---

## 4. Indicateurs de Performance Énergétique (IPE / EnPI)

Les 4 IPE prédéfinis dans PortWatt SME sont présentés à titre de démonstrateur et sont marqués **« Modèle à valider avec la DEPA »** :
1. **IPE 01 — Consommation Spécifique Conteneurs** :
   $$\text{IPE}_{TEU} = \frac{\text{Consommation Totale Portiques \& Niches Frigo (kWh)}}{\text{Nombre d'EVP manipulés}}$$
2. **IPE 02 — Consommation Spécifique Vrac & Marchandises Diverses** :
   $$\text{IPE}_{Tonne} = \frac{\text{Consommation Grues \& Engins de Quai (kWh)}}{\text{Tonnage brut manutentionné (tonnes)}}$$
3. **IPE 03 — Consommation Navires à Quai (Cold Ironing / Alimentation)** :
   $$\text{IPE}_{Escale} = \frac{\text{Énergie consommée par les niches à quai (kWh)}}{\text{Nombre d'escales navires}}$$
4. **IPE 04 — Performance Éclairage Terre-pleins & Voieries** :
   $$\text{IPE}_{Lux} = \frac{\text{Consommation Éclairage Nocturne (kWh)}}{\text{Heures d'obscurité} \times \text{Surface éclairée (ha)}}$$

---

## 5. Situation Énergétique de Référence (SER / EnB)

- **Période de référence par défaut** : Année N-1 (12 mois glissants consolidés).
- **Variables statiques et facteurs influents** :
  - Température extérieure moyenne mensuelle (°C) — impact sur le groupe froid des niches conteneurs réfrigérés.
  - Tonnage total mensuel manutentionné (tonnes).
  - Nombre d'escales de navires commerciaux et porte-conteneurs.
- **Modèle de régression ISO 50006** :
  $$\hat{E}_{\text{réf}} = \alpha \cdot \text{Tonnage} + \beta \cdot \text{Navires} + \gamma \cdot \text{DJF/DJC} + E_0$$
  avec coefficient de détermination $R^2 \ge 0.85$ requis pour validation.

---

## 6. Qualité de l'Énergie & Détection des Creux de Tension

- **Creux de tension (Voltage Sags)** : Conforme norme **EN 50160 / CEI 61000-4-30**.
  - Seuil de détection : chute de la tension efficace $U_{rms} < 90\%$ de $U_n$ (360 V ph-ph ou 207 V ph-N) pendant plus de 10 ms et moins de 60 secondes.
  - Classification : Courbe CBEMA / ITIC (durée ms vs profondeur %).
- **Harmoniques** : Rangs 1 à 40 enregistrés pour chaque centrale classe 0.2S et 0.5S.
  - Alerte THD-U > 5% (limite CEI 61000-2-4 classe 2).
  - Alerte THD-I > 15% sur les départs à variateurs électroniques de fréquence (grues de quai).

---

## 7. Maintenance et Garantie (24 Mois)

- **Visites préventives contractuelles** : 4 visites par an (trimestrielles), comprenant l'inspection thermographique IR des armoires et des TC, le contrôle du serrage, la vérification du bus de communication et la sauvegarde des configurations.
- **Délais d'intervention contractuels (SLA)** :
  - **Panne bloquante** (perte totale d'un poste, centrale TGBT éteinte) : Prise en charge $\le 4$ h, résolution $\le 48$ h.
  - **Anomalie non bloquante** (dérive de mesure, alerte mineure, capteur isolé) : Résolution $\le 7$ jours ouvrés.
