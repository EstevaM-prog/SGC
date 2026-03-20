import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Toaster } from 'react-hot-toast';

// Pages – main app
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketForm from './pages/TicketForm';
import CNPJ from './pages/CNPJ';
import Trash from './pages/Trash';
import Shopping from './pages/Shopping';
import Freight from './pages/Freight';
import Procedimentos from './pages/Procedimentos';
import Suporte from './pages/Suporte';
import Ponto from './pages/Ponto';

// Pages – auth
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import ActivitiesPage from './pages/Activities';

// Hooks
import { useActivities } from './hooks/useActivities';
import { useTickets } from './hooks/useTickets';
import { useShoppingTickets } from './hooks/useShoppingTickets';
import { useFreightTickets } from './hooks/useFreightTickets';
import { usePontoTickets } from './hooks/usePontoTickets';

// ─── helpers ─────────────────────────────────────────────────────
const getSettings = () => {
  try { return JSON.parse(localStorage.getItem('chamados_settings_v1') || '{}'); }
  catch { return {}; }
};

const getSession = () => {
  try { return JSON.parse(localStorage.getItem('session_v1') || 'null'); }
  catch { return null; }
};
// ─────────────────────────────────────────────────────────────────

function App() {
  const settings = getSettings();

  // Auth state
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [currentUser, setCurrentUser] = useState(getSession);
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('user_avatar') || null);

  // App navigation
  const [currentView, setCurrentView] = useState('list');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(settings.sidebarCollapsed || false);
  const [isDark, setIsDark] = useState(settings.theme ? settings.theme === 'dark' : true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTicket, setEditingTicket] = useState(null);

  // Data hooks (separate stores!)
  const { activities, unreadCount, addActivity, markAllAsRead, clearActivities } = useActivities();
  const chamados = useTickets();         // chamados_db_v1  → Lista de Chamados (pagamentos)
  const shopping = useShoppingTickets(); // compras_db_v1   → Compras
  const freight = useFreightTickets();  // fretes_db_v1    → Fretes
  const ponto = usePontoTickets();    // ponto_db_v1     → Ponto

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Theme sync
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
  }, [isDark]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      const next = !isSidebarCollapsed;
      setIsSidebarCollapsed(next);
      const s = getSettings();
      localStorage.setItem('chamados_settings_v1', JSON.stringify({ ...s, sidebarCollapsed: next }));
    }
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const s = getSettings();
    localStorage.setItem('chamados_settings_v1', JSON.stringify({ ...s, theme: next ? 'dark' : 'light' }));
  };

  // Chamados handlers
  const handleEdit = (t) => { setEditingTicket(t); setCurrentView('form'); };
  const handleNewTicket = () => { setEditingTicket(null); setCurrentView('form'); };
  const handleSaveTicket = (data) => {
    if (editingTicket) chamados.updateTicket(data.id, data);
    else chamados.addTicket(data);
    setCurrentView('list');
  };

  // Auth handlers
  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => {
    localStorage.removeItem('session_v1');
    setCurrentUser(null);
    setAuthView('login');
  };

  // Called by Profile after saving — syncs React state so Header updates immediately
  const handleUpdateUser = ({ name, email, avatar }) => {
    setCurrentUser(prev => ({ ...prev, name, email }));
    if (avatar !== undefined) setUserAvatar(avatar);
  };

  // Navigate to sidebar view
  const navigateTo = (v) => {
    if (v === 'form') setEditingTicket(null);
    setCurrentView(v);
    if (window.innerWidth <= 768) setIsMobileSidebarOpen(false);
  };

  // ─── Auth gate ────────────────────────────────────────────────
  if (!currentUser) {
    if (authView === 'register') return <Register onNavigate={setAuthView} />;
    if (authView === 'forgot') return <ForgotPassword onNavigate={setAuthView} />;
    return <Login onLogin={handleLogin} onNavigate={setAuthView} />;
  }

  // ─── Profile overlay ─────────────────────────────────────────
  if (currentView === 'profile') return (
    <Profile
      currentUser={currentUser}
      onLogout={handleLogout}
      onNavigate={navigateTo}
      onUpdateUser={handleUpdateUser}
      addActivity={addActivity}
    />
  );

  // ─── Main app view ────────────────────────────────────────────
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard tickets={chamados.tickets} />;

      case 'list':
        return (
          <TicketList
            tickets={chamados.tickets}
            searchTerm={searchTerm}
            onNewTicket={handleNewTicket}
            onEdit={handleEdit}
            onDelete={chamados.softDeleteTicket}
          />
        );

      case 'form':
        return (
          <TicketForm
            ticket={editingTicket}
            onSave={handleSaveTicket}
            onCancel={() => setCurrentView('list')}
            addActivity={addActivity}
          />
        );

      case 'cnpj':
        return (
          <CNPJ
            tickets={chamados.tickets}
            onEdit={handleEdit}
            onAddTicket={chamados.addTicket}
            onUpdateTicket={chamados.updateTicket}
            addActivity={addActivity}
          />
        );

      case 'trash':
        return (
          <Trash
            tickets={chamados.tickets}
            onRestore={chamados.restoreTicket}
            onPermanentDelete={chamados.permanentDeleteTicket}
            shoppingTickets={shopping.tickets}
            onRestoreShopping={shopping.restoreTicket}
            onPermanentDeleteShopping={shopping.permanentDeleteTicket}
            freightTickets={freight.tickets}
            onRestoreFreight={freight.restoreTicket}
            onPermanentDeleteFreight={freight.permanentDeleteTicket}
          />
        );

      case 'shopping':
        return (
          <Shopping
            tickets={shopping.tickets}
            addTicket={shopping.addTicket}
            updateTicket={shopping.updateTicket}
            softDeleteTicket={shopping.softDeleteTicket}
            restoreTicket={shopping.restoreTicket}
            permanentDeleteTicket={shopping.permanentDeleteTicket}
            addActivity={addActivity}
          />
        );

      case 'freight':
        return (
          <Freight
            tickets={freight.tickets}
            addTicket={freight.addTicket}
            updateTicket={freight.updateTicket}
            softDeleteTicket={freight.softDeleteTicket}
            restoreTicket={freight.restoreTicket}
            permanentDeleteTicket={freight.permanentDeleteTicket}
            addActivity={addActivity}
          />
        );

      case 'procedures':
        return <Procedimentos addActivity={addActivity} />;

      case 'suporte':
        return <Suporte addActivity={addActivity} />;

      case 'ponto':
        return (
          <Ponto
            tickets={ponto.tickets}
            addTicket={ponto.addTicket}
            updateTicket={ponto.updateTicket}
            softDeleteTicket={ponto.softDeleteTicket}
            restoreTicket={ponto.restoreTicket}
            permanentDeleteTicket={ponto.permanentDeleteTicket}
            addActivity={addActivity}
          />
        );

      case 'activities':
        return <ActivitiesPage activities={activities} onClear={clearActivities} />;

      default:
        return (
          <TicketList
            tickets={chamados.tickets}
            searchTerm={searchTerm}
            onNewTicket={handleNewTicket}
            onEdit={handleEdit}
            onDelete={chamados.softDeleteTicket}
          />
        );
    }
  };

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
      <Sidebar
        currentView={currentView}
        setCurrentView={navigateTo}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {isMobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      <main className="main-content">
        <Header
          toggleSidebar={toggleSidebar}
          toggleTheme={toggleTheme}
          isDark={isDark}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileSidebarOpen={isMobileSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          userName={currentUser?.name || 'Usuário'}
          userAvatar={userAvatar}
          onProfileClick={() => setCurrentView('profile')}
          onNavigateTo={navigateTo}
          notifications={activities}
          unreadCount={unreadCount}
          onMarkRead={markAllAsRead}
        />
        <div className="content-area">
          {renderView()}
        </div>
      </main>
      
      <Toaster 
        position={windowWidth <= 768 ? "bottom-center" : "bottom-right"} 
        reverseOrder={true}
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          duration: 4000,
          // Custom animation via CSS classes if needed, but react-hot-toast 
          // has built-in smooth entry/exit.
        }}
      />
    </div>
  );
}

export default App;
