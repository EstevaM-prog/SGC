import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Toaster } from 'react-hot-toast';
import api from './Axios/conect.js';

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
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import ActivitiesPage from './pages/Activities';
import Docs from './pages/Docs';

// Error Pages
import NotFound from './pages/Error/NotFound';
import Forbidden from './pages/Error/Forbidden';
import Unauthenticated from './pages/Error/Unauthenticated';
import ServerError from './pages/Error/ServerError';
import Maintenance from './pages/Error/Maintenance';
import TokenError from './pages/Error/TokenError';

// Hooks
import { useActivities } from './hooks/useActivities';
import { useTickets } from './hooks/useTickets';
import { useShoppingTickets } from './hooks/useShoppingTickets';
import { useFreightTickets } from './hooks/useFreightTickets';
import { usePontoTickets } from './hooks/usePontoTickets';

// ─── helpers ─────────────────────────────────────────────────────
const getSettings = () => {
  try { 
    const s = localStorage.getItem('chamados_settings_v1');
    return s ? JSON.parse(s) : {}; 
  } catch { return {}; }
};

const getSession = () => {
  try { 
    const s = localStorage.getItem('session_v1');
    return s ? JSON.parse(s) : null; 
  } catch { 
    localStorage.removeItem('session_v1'); // Limpa se estiver corrompido
    return null; 
  }
};
// ─────────────────────────────────────────────────────────────────

function App() {
  const settings = getSettings();

  // Auth state
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register' | 'forgot' | 'docs'
  const [currentUser, setCurrentUser] = useState(getSession);
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('user_avatar') || null);
  const [userTeams, setUserTeams] = useState([]);
  const [activePermissions, setActivePermissions] = useState(null);

  useEffect(() => {
    if (currentUser?.id) {
      fetchTeams(currentUser.id);
    } else {
      setUserTeams([]);
      setActivePermissions(null);
    }
  }, [currentUser]);

  const fetchTeams = async (userId) => {
    try {
      const resp = await api.get(`/teams?userId=${userId}`);
      if (resp.status === 200) {
        const teams = resp.data;
        setUserTeams(teams);
        // Combine permissions safely
        const combined = {};
        teams.forEach(t => {
          if (t && t.permissions && Array.isArray(t.permissions)) {
            t.permissions.forEach(p => {
              if (p && p.name) combined[p.name] = true;
            });
          }
        });
        setActivePermissions(Object.keys(combined).length > 0 ? combined : null);
      }
    } catch (err) {
      console.error('Erro ao buscar permissões:', err);
    }
  };

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
  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthView('app'); // Transition to app after login
  };
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

  // Navigate to sidebar view with permission checks
  const navigateTo = (v) => {
    // 403 Forbidden check (Example: Admin logic)
    const adminViews = ['teams'];
    if (adminViews.includes(v) && currentUser?.role !== 'ADMIN') {
      setCurrentView('403');
      if (window.innerWidth <= 768) setIsMobileSidebarOpen(false);
      return;
    }

    if (v === 'form') setEditingTicket(null);
    setCurrentView(v);
    if (window.innerWidth <= 768) setIsMobileSidebarOpen(false);
  };

  // ─── Auth gate ────────────────────────────────────────────────
  if (authView === 'landing') {
    return (
      <LandingPage
        onStart={() => {
          if (currentUser) {
            setCurrentView('dashboard');
            setAuthView('app'); // Internal state to clear the landing gate
          } else {
            setAuthView('register');
          }
        }}
        onLogin={() => setAuthView('login')}
        onDocs={() => setAuthView('docs')}
        isAuthenticated={!!currentUser}
      />
    );
  }

  if (!currentUser) {
    if (authView === 'docs') return <Docs onBack={() => setAuthView('landing')} />;
    if (authView === 'register') return <Register onNavigate={setAuthView} />;
    if (authView === 'forgot') return <ForgotPassword onNavigate={setAuthView} />;
    if (authView === '401') return <Unauthenticated onLogin={() => setAuthView('login')} />;
    if (authView === 'maintenance') return <Maintenance />;
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
        const allTickets = [
          ...(Array.isArray(chamados.tickets) ? chamados.tickets.map(t => ({ ...t, source: 'chamado' })) : []),
          ...(Array.isArray(shopping.tickets) ? shopping.tickets.map(t => ({ ...t, source: 'shopping' })) : []),
          ...(Array.isArray(freight.tickets) ? freight.tickets.map(t => ({ ...t, source: 'freight' })) : [])
        ];
        return <Dashboard tickets={allTickets} />;

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

      case 'docs':
        return <Docs onBack={() => setCurrentView('dashboard')} />;

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
        permissions={activePermissions}
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
