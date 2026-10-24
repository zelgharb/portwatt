import React, { useState, useEffect } from 'react';
import { useLiveData } from './context/LiveDataContext';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { GuidedTour } from './components/GuidedTour';
import { MeterDetailModal } from './components/MeterDetailModal';
import { Meter } from './types';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { SubstationsPage } from './pages/SubstationsPage';
import { MetersPage } from './pages/MetersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EnpiPage } from './pages/EnpiPage';
import { SerPage } from './pages/SerPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportingPage } from './pages/ReportingPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { RecettePage } from './pages/RecettePage';
import { HypothesesPage } from './pages/HypothesesPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  const { substations, meters, measurements, resetAllData } = useLiveData();
  const { toggleTheme } = useTheme();

  const [activePage, setActivePage] = useState<string>('overview');
  const [selectedSubstationId, setSelectedSubstationId] = useState<string | undefined>(undefined);
  const [inspectingMeter, setInspectingMeter] = useState<Meter | null>(null);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [guidedTourOpen, setGuidedTourOpen] = useState(false);

  // Routage par hash (#/page) : fonctionne sur GitHub Pages, Vercel, Netlify sans règle de réécriture
  useEffect(() => {
    const readHash = () => {
      const page = window.location.hash.replace(/^#\/?/, '') || 'overview';
      setActivePage(page);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const navigateTo = (page: string, param?: string) => {
    setActivePage(page);
    if (page === 'substations' && param) {
      setSelectedSubstationId(param);
    }
    window.history.pushState({}, '', page === 'overview' ? '#/' : `#/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* En-tête globale avec bandeau démo et sélecteur de rôle */}
      <Header
        activePage={activePage}
        onNavigate={navigateTo}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenGuidedTour={() => setGuidedTourOpen(true)}
      />

      {/* Contenu principal */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        {activePage === 'overview' && (
          <OverviewPage
            onNavigate={navigateTo}
            onSelectMeter={(m) => setInspectingMeter(m)}
          />
        )}

        {activePage === 'substations' && (
          <SubstationsPage initialSubstationId={selectedSubstationId} />
        )}

        {activePage === 'meters' && (
          <MetersPage />
        )}

        {activePage === 'analytics' && (
          <AnalyticsPage />
        )}

        {activePage === 'enpi' && (
          <EnpiPage />
        )}

        {activePage === 'ser' && (
          <SerPage />
        )}

        {activePage === 'alerts' && (
          <AlertsPage />
        )}

        {activePage === 'reporting' && (
          <ReportingPage />
        )}

        {activePage === 'data_quality' && (
          <DataQualityPage />
        )}

        {activePage === 'maintenance' && (
          <MaintenancePage />
        )}

        {activePage === 'recette' && (
          <RecettePage />
        )}

        {activePage === 'hypotheses' && (
          <HypothesesPage />
        )}

        {activePage === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Pied de page sobre */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 sm:px-6 py-4 text-center text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PortWatt SME</span>
            <span>•</span>
            <span>Système de Monitoring Énergétique ISO 50001:2018</span>
            <span>•</span>
            <span className="font-mono text-cyan-400">DEPA Port d’Agadir</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Mode Statique Public • Simulateur Web Worker • Hébergement Cloud Sécurisé
          </div>
        </div>
      </footer>

      {/* Palette de commande globale (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        substations={substations}
        meters={meters}
        onNavigate={navigateTo}
        onResetDemo={resetAllData}
        onToggleTheme={toggleTheme}
      />

      {/* Mode Formation : Visite Guidée Interactive */}
      <GuidedTour
        isOpen={guidedTourOpen}
        onClose={() => setGuidedTourOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Modal d'inspection détaillée de compteur */}
      {inspectingMeter && (
        <MeterDetailModal
          meter={inspectingMeter}
          measurement={measurements[inspectingMeter.id]}
          onClose={() => setInspectingMeter(null)}
        />
      )}
    </div>
  );
};
