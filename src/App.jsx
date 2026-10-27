import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CanvasArea from './components/CanvasArea';
import PropertiesPanel from './components/PropertiesPanel';
import Estimate from './components/Estimate';
import ErrorBoundary from './components/ErrorBoundary';
import FinishingCalculator from './components/calculators/index';
import ConstructionCalc from './components/ConstructionCalc';
import HomePage from './components/HomePage';
import MaterialsPage from './pages/MaterialsPage';
import WorksPage from './pages/WorksPage';
import TermsPage from './pages/TermsPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import ForumPage from './pages/ForumPage'; // 👈 Импорт форума
import WelcomeModal from './components/WelcomeModal';
import InteractiveHelper from './components/InteractiveHelper';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';
import { useThemeStore } from './storeTheme';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProperties, setShowProperties] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const getCurrentScreen = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/projects') return 'projects-list';
    if (location.pathname.startsWith('/project')) return 'projects';
    if (location.pathname.startsWith('/calc/electric')) return 'calc-electric';
    if (location.pathname.startsWith('/calc/finishing')) return 'calc-finishing';
    if (location.pathname.startsWith('/calc/construction')) return 'calc-construction';
    if (location.pathname.startsWith('/estimate')) return 'estimate';
    if (location.pathname.startsWith('/materials')) return 'materials';
    if (location.pathname.startsWith('/works')) return 'works';
    if (location.pathname.startsWith('/terms')) return 'terms';
    if (location.pathname.startsWith('/pricing')) return 'pricing';
    if (location.pathname.startsWith('/settings')) return 'settings';
    if (location.pathname.startsWith('/clients')) return 'clients';
    if (location.pathname.startsWith('/forum')) return 'forum'; // 👈 Экран форума
    return 'home';
  };

  const currentScreen = getCurrentScreen();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavigate = (screen) => {
    if (screen === 'home') navigate('/');
    else if (screen === 'projects-list') navigate('/projects');
    else if (screen === 'projects') navigate('/project');
    else if (screen === 'calc-electric') navigate('/calc/electric');
    else if (screen === 'calc-finishing') navigate('/calc/finishing');
    else if (screen === 'calc-construction') navigate('/calc/construction');
    else if (screen === 'estimate') navigate('/estimate');
    else if (screen === 'materials') navigate('/materials');
    else if (screen === 'works') navigate('/works');
    else if (screen === 'terms') navigate('/terms');
    else if (screen === 'pricing') navigate('/pricing');
    else if (screen === 'settings') navigate('/settings');
    else if (screen === 'clients') navigate('/clients');
    else if (screen === 'forum') navigate('/forum'); // 👈 Навигация на форум
  };

  const hideHelperOnMobile = location.pathname.includes('/calc/') || location.pathname.includes('/estimate');

  return (
    <div className="flex h-screen overflow-hidden relative">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        currentScreen={currentScreen} 
        onMenuClick={handleNavigate} 
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full bg-transparent pb-16 md:pb-0">
        <Header 
          currentScreen={currentScreen} 
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />

        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />

          <Route path="/project" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-hidden relative">
              <CanvasArea onShowProperties={() => setShowProperties(true)} />
              
              <div 
                className={`
                  fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300
                  ${showProperties ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `} 
                onClick={() => setShowProperties(false)} 
              />
              
              <div className={`
                fixed z-50 bg-white dark:bg-[#1e293b] shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden
                bottom-16 md:bottom-auto left-0 w-full h-[70vh] rounded-t-2xl
                md:static md:h-auto md:w-[440px] md:rounded-none md:shadow-none md:border-l md:border-gray-200 md:flex-shrink-0
                ${showProperties ? 'translate-y-0 md:translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full md:hidden'}
              `}>
                <PropertiesPanel onClose={() => setShowProperties(false)} />
              </div>
            </div>
          } />

          <Route path="/projects" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <ProjectsPage />
            </div>
          } />

          <Route path="/calc/electric" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <ErrorBoundary>
                <FinishingCalculator initialGroup="electric" isStandalone={true} />
              </ErrorBoundary>
            </div>
          } />

          <Route path="/calc/finishing" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <ErrorBoundary>
                <FinishingCalculator initialGroup="finishing" isStandalone={true} />
              </ErrorBoundary>
            </div>
          } />

          <Route path="/calc/construction" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <ErrorBoundary>
                <ConstructionCalc />
              </ErrorBoundary>
            </div>
          } />

          <Route path="/estimate" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <Estimate />
            </div>
          } />

          <Route path="/materials" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <MaterialsPage />
            </div>
          } />

          <Route path="/works" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <WorksPage />
            </div>
          } />

          <Route path="/terms" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <TermsPage />
            </div>
          } />

          <Route path="/pricing" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <PricingPage />
            </div>
          } />

          <Route path="/settings" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <SettingsPage />
            </div>
          } />

          <Route path="/clients" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <ClientsPage />
            </div>
          } />

          {/* 👇 Новый роут для форума */}
          <Route path="/forum" element={
            <div className="flex-1 p-2 md:p-4 flex gap-4 overflow-y-auto">
              <ForumPage />
            </div>
          } />

          <Route path="*" element={
            <div className="flex-1 flex items-center justify-center text-gray-500 text-xl font-medium">
              Страница не найдена
            </div>
          } />
        </Routes>
      </main>
      
      <BottomNav 
        currentScreen={currentScreen} 
        onMenuClick={handleNavigate} 
        onOpenMenu={() => setIsMobileMenuOpen(true)} 
      />
      
      <div className={hideHelperOnMobile ? 'hidden md:block' : 'block'}>
        <InteractiveHelper />
      </div>
      
      <WelcomeModal />
      <Toast /> 
    </div>
  );
}