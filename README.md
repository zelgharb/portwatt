# PortWatt SME — Système de Monitoring Énergétique ISO 50001:2018
**Direction d'Exploitation du Port d'Agadir (DEPA) — Marsa Maroc**  
*Démonstrateur Fonctionnel & Livrable Contractuel (Appel d'Offres N° 12/DEPA/2026)*  

---

## ⚡ 1. Présentation Générale

**PortWatt SME** est la plateforme industrielle de gestion et de monitoring énergétique développée pour superviser les **6 postes électriques** et les **58 points de comptage actifs** du Port d'Agadir (DEPA), en stricte conformité avec les exigences de la norme **ISO 50001:2018** et du guide de mesure et vérification **ISO 50006**.

L'application a été conçue selon une architecture **Dual-Mode** unique :
1. **Mode DÉMO PUBLIC (`VITE_DEMO_MODE=true`)** : Application **100 % statique sans backend à héberger**.
   - Le moteur d'acquisition Modbus tourne directement dans un **Web Worker** dédié en arrière-plan du navigateur.
   - Données et réglages isolés par visiteur dans le stockage local (**IndexedDB / localStorage**).
   - Exports automatisés (**PDF, Excel multi-onglets .xlsx, CSV**) exécutés côté client.
   - **Aucune API distante requise, aucun serveur qui s'endort, coût d'hébergement = 0 €**.
2. **Mode PROD / On-Premise (Contractuel)** : Stack conteneurisée complète (`docker-compose.yml`) prête pour déploiement sur VM VMware / Hyper-V locale au Port d'Agadir :
   - Base de données séries temporelles **TimescaleDB / PostgreSQL 16**.
   - Backend **Node.js** avec couche d'acquisition modulaire (`ModbusTcpAdapter` vs `SimulatedAdapter`).
   - Abstraction d'authentification pour annuaire d'entreprise **Active Directory / LDAP**.
   - Flux temps réel par **Server-Sent Events (SSE)**.

---

## 🌐 2. Accès Public en Ligne & Démonstration

- **Lien de Démonstration Public HTTPS** : [https://portwatt-depa.surge.sh](https://portwatt-depa.surge.sh)  
  *(Accessible immédiatement sans inscription, sur mobile, tablette et desktop)*
- **Profils Utilisateurs Simulés (RBAC sans mot de passe)** :
  - **Administrateur Technique** : Contrôle total, cartographie Modbus, seuils et maintenance.
  - **Responsable Énergie** : Pilotage ISO 50001, indicateurs IPE, modèle SER et bilans.
  - **Exploitant Portuaire** : Synoptiques unifilaires, surveillance temps réel et acquittement alertes.
  - **Lecteur / Auditeur** : Consultation seule et audit de conformité.
- **Bouton « Réinitialiser la démo »** : Permet à tout moment de remettre à zéro les modifications locales d'un visiteur.

---

## 🏗️ 3. Périmètre Technique & Métier

| Poste Électrique | Emplacement Portuaire | Puissance Transfo | Arrivées TGBT | Départs Secondaires | Compteurs Actifs | Spécificités & Raccordement |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Poste PT Y** | Terminal Polyvalent & Vracs | 2 500 kVA | T1 + T2 | 7 départs | **9 points** | 4 centrales Cl. 0.5S + 5 Cl. 0.2S (Niches) |
| **Poste PT X** | Ateliers & Quai Nord | 2 000 kVA | T1 + T2 | 8 départs | **10 points** | 4 centrales Cl. 0.5S + 6 Cl. 0.2S (Niches) |
| **Poste PT Z** | Capitainerie & Administratif | 1 600 kVA | T1 + T2 | 6 départs | **8 points** | 4 centrales Cl. 0.5S + 4 Cl. 0.2S (Départ Bâtiment) |
| **Poste PT 4** | Terminal Conteneurs & Portiques | 3 200 kVA | T1 + T2 | 8 départs (+1 rés.) | **9 points** | Portiques 1 & 2 + Niches Frigo (+ 1 réserve identifiée) |
| **Poste PT 1** | Quai Ro-Ro & Pêche | 2 000 kVA | T1 + T2 | 10 départs | **12 points** | **12 compteurs existants MEIER CMM61 (Modbus TCP)** |
| **Poste PT 7** | Zone Est & Terre-plein Industriel | 2 500 kVA | T1 + T2 | 8 départs | **10 points** | Éclairage Mât Phare + Station Pompage |
| **TOTAL** | **Plateforme Port d'Agadir** | **13 800 kVA** | **12 arrivées** | **47 départs** | **58 points** | **20 Cl. 0.5S + 26 Cl. 0.2S + 12 MEIER CMM61** |

---

## 📊 4. Ce qui est Simulé vs Ce qui est Prêt pour de Vrais Compteurs

| Fonctionnalité | Mode Démo Public | Prêt pour Vrais Compteurs (PROD) |
| :--- | :--- | :--- |
| **Génération des grandeurs U, I, P, Q, cos φ, F** | Web Worker continu (fluctuations réalistes 1,5s) | Connexion Modbus TCP/IP réelle sur port 502 |
| **Intégration PT 1 MEIER CMM61** | Registres et adresses IP 192.168.10.x simulés | Table de registres Float32 prête (Registres 30001+) |
| **Harmoniques rangs 1 à 40 & THD** | Génération spectrale Fourier et harmoniques impairs | Registres d'analyseur de réseau CEI 61000-4-7 |
| **Surveillance des Creux de Tension (Sags)** | Détection et classification gabarit ITIC / CBEMA | Capture hardware sur événement U &lt; 90% Un |
| **Stockage des séries temporelles** | IndexedDB / LocalStorage par navigateur | Hypertable TimescaleDB / PostgreSQL 16 |
| **Calculs ISO 50001 (Sankey, Pareto, SER, IPE)** | 100% réel (algorithmes de calcul rigoureux) | 100% identique (même logique mathématique) |
| **Exports PDF, CSV, Excel** | 100% fonctionnels côté client en 1 clic | 100% fonctionnels côté client ou via cron serveur |
| **Authentification & Droits** | Sélecteur instantané de profil sans mot de passe | Abstraction JWT et protocole LDAP / Active Directory |

---

## 🚀 5. Commandes de Build & Déploiement

### Déploiement Automatique sur Surge
```bash
# 1. Installation des dépendances
npm install

# 2. Compilation de l'application statique
npm run build

# 3. Préparation du fallback SPA pour les routes profondes
cp dist/index.html dist/200.html

# 4. Publication en ligne immédiate
npx -y surge ./dist https://portwatt-depa.surge.sh
```

### Déploiement sur Vercel
```bash
# Via le CLI Vercel (utilise le vercel.json préconfiguré)
npx vercel --prod
```

### Déploiement sur Netlify
```bash
# Via le CLI Netlify (utilise le netlify.toml préconfiguré)
npx netlify deploy --prod --dir=dist
```

### Déploiement On-Premise (Docker Compose)
```bash
docker-compose up -d --build
```
L'application est alors accessible sur `https://localhost` avec son backend Fastify sur le port 4000 et TimescaleDB sur le port 5432.

---

## 🔒 6. Sécurité & Confidentialité de la Version Publique
- **Aucune donnée réelle ni adresse IP confidentielle** : Toutes les adresses IP (192.168.x.x) sont des adresses RFC 1918 d'exemple.
- **Aucun secret dans le code source** : Aucun token ni mot de passe en dur.
- **Logo Neutre** : Remplacement du logo officiel Marsa Maroc par un pictogramme industriel maritime neutre.
- **En-têtes HTTP de Sécurité** : `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Protection Anti-Référencement** : Fichier `robots.txt` interdisant l'indexation (`Disallow: /`) et balise `<meta name="robots" content="noindex, nofollow" />`.

---

## 🌐 7. Brancher un Nom de Domaine Personnalisé
Pour associer votre propre domaine (ex : `energie.portagadir.ma` ou `sme.mondomaine.com`) :
1. **Sur Surge** :
   Ajouter un enregistrement DNS `CNAME` pointant vers `na-sfo1.surge.sh` et exécuter :
   ```bash
   npx surge ./dist energie.portagadir.ma
   ```
2. **Sur Vercel / Netlify** :
   Dans les paramètres *Domains*, ajouter votre nom de domaine puis configurer les entrées DNS `A` ou `CNAME` fournies par la plateforme. Le certificat SSL/TLS Let's Encrypt est provisionné automatiquement en HTTPS.
