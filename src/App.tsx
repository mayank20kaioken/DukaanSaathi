import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { ToastContainer } from './components/common/ToastContainer';

// Feature Views
import { DashboardView } from './views/DashboardView';
import { KhataBookView } from './views/KhataBookView';
import { InventoryView } from './views/InventoryView';
import { ProfitTrackerView } from './views/ProfitTrackerView';
import { ExpenseManagerView } from './views/ExpenseManagerView';
import { MarketScoutView } from './views/MarketScoutView';
import { VoiceAssistantView } from './views/VoiceAssistantView';
import { BillScannerView } from './views/BillScannerView';
import { AiAdvisorView } from './views/AiAdvisorView';
import { OfficerIdScannerView } from './views/OfficerIdScannerView';
import { GrowthCommunityView } from './views/GrowthCommunityView';
import { SettingsReportsView } from './views/SettingsReportsView';
import { StockReorderView } from './views/StockReorderView';
import { ExpiryDeadStockView } from './views/ExpiryDeadStockView';
import { SalesPosView } from './views/SalesPosView';

// Modals
import { VoiceAssistantModal } from './components/modals/VoiceAssistantModal';
import { BillScannerModal } from './components/modals/BillScannerModal';
import { RecordSaleModal } from './components/modals/RecordSaleModal';
import { RecordExpenseModal } from './components/modals/RecordExpenseModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { Mic, Sparkles } from 'lucide-react';

const AppShell: React.FC = () => {
  const { 
    workspaceMode, 
    activeModal, 
    openModal, 
    closeModal,
    metrics
  } = useApp();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const hasUnread = metrics.lowStockCount > 0 || metrics.expiringSoonCount > 0;

  // View Router
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onSelectView={setCurrentView} />;
      case 'profit-tracker':
        return <ProfitTrackerView />;
      case 'expenses':
        return <ExpenseManagerView />;
      case 'sales-pos':
        return <SalesPosView />;
      case 'inventory':
        return <InventoryView />;
      case 'stock-reorder':
        return <StockReorderView />;
      case 'expiry-deadstock':
        return <ExpiryDeadStockView />;
      case 'khata':
        return <KhataBookView />;
      case 'loyalty-feedback':
      case 'group-buying':
      case 'competitor-tracker':
        return <GrowthCommunityView />;
      case 'voice-assistant':
        return <VoiceAssistantView />;
      case 'bill-scanner':
        return <BillScannerView />;
      case 'ai-advisor':
      case 'festival-planner':
        return <AiAdvisorView />;
      case 'officer-scanner':
        return <OfficerIdScannerView />;
      case 'market-scout':
        return <MarketScoutView />;
      case 'suppliers':
      case 'reports-export':
      case 'risk-cashflow':
      case 'shop-profile':
        return <SettingsReportsView />;
      default:
        return <DashboardView onSelectView={setCurrentView} />;
    }
  };

  return (
    <div className={`min-h-screen flex ${workspaceMode === 'light' ? 'bg-[#F5F7F2]' : 'bg-navy-900'}`}>
      
      {/* Collapsible Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Responsive Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentView={currentView}
        onSelectView={setCurrentView}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          onSelectView={setCurrentView}
          onOpenNotifications={() => setNotificationsOpen(true)}
          hasUnreadNotifications={hasUnread}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-16">
          {renderCurrentView()}
        </main>
      </div>

      {/* Floating AI Voice Assistant Launcher Button in Bottom Right */}
      {currentView !== 'voice-assistant' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => openModal('VOICE_ASSISTANT')}
            className="group relative flex items-center gap-2 p-2.5 sm:px-3.5 sm:py-2.5 rounded-full bg-navy-950/95 hover:bg-navy-900 border border-lime-accent/50 text-white font-extrabold text-xs shadow-2xl shadow-lime-accent/20 hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
            title="DukaanSaathi Hindi Voice AI"
          >
            <div className="relative w-7 h-7 rounded-full bg-lime-accent text-navy-950 flex items-center justify-center shrink-0 shadow-lime-glow">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span className="absolute inset-0 rounded-full bg-lime-accent/40 animate-ping" />
            </div>
            <span className="hidden md:inline font-hindi font-semibold text-lime-accent text-xs">
              बोलिए साथी
            </span>
          </button>
        </div>
      )}

      {/* Global Modals */}
      <VoiceAssistantModal
        isOpen={activeModal === 'VOICE_ASSISTANT'}
        onClose={closeModal}
        onNavigateToView={(view) => {
          closeModal();
          setCurrentView(view);
        }}
      />

      <BillScannerModal
        isOpen={activeModal === 'BILL_SCANNER'}
        onClose={closeModal}
      />

      <RecordSaleModal
        isOpen={activeModal === 'RECORD_SALE'}
        onClose={closeModal}
      />

      <RecordExpenseModal
        isOpen={activeModal === 'RECORD_EXPENSE'}
        onClose={closeModal}
      />

      <AddProductModal
        isOpen={activeModal === 'ADD_PRODUCT'}
        onClose={closeModal}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectView={(view) => {
          setNotificationsOpen(false);
          setCurrentView(view);
        }}
      />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
