/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from 'react-router-dom';
import {
  Package, Truck, ClipboardCheck, AlertTriangle, Archive,
  LayoutDashboard, BarChart2, History as HistoryIcon,
  Menu, X, Calendar, LogOut,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Receiving from './pages/Receiving';
import Conference from './pages/Conference';
import PCL from './pages/PCL';
import Stock from './pages/Stock';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Schedule from './pages/Schedule';
import AuthPage from './pages/AuthPage';
import ChatBot from './components/ChatBot';

// ─── ROTA PROTEGIDA ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── SIDEBAR COM RBAC ────────────────────────────────────────────────────────
function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const allNavItems = [
    { path: '/',           name: 'Dashboard',      icon: LayoutDashboard, adminOnly: true  },
    { path: '/analytics',  name: 'Analytics',      icon: BarChart2,       adminOnly: true  },
    { path: '/schedule',   name: 'Agenda',         icon: Calendar,        adminOnly: false },
    { path: '/purchases',  name: 'Compras',        icon: Package,         adminOnly: false },
    { path: '/receiving',  name: 'Recebimento',    icon: Truck,           adminOnly: false },
    { path: '/conference', name: 'Conferência',    icon: ClipboardCheck,  adminOnly: false },
    { path: '/pcl',        name: 'Gestor',   icon: AlertTriangle,   adminOnly: true  },
    { path: '/stock',      name: 'Estoque',        icon: Archive,         adminOnly: false },
    { path: '/history',    name: 'Histórico',      icon: HistoryIcon,     adminOnly: true  },
  ];

  const navItems = allNavItems.filter(item => !(item.adminOnly && user?.role !== 'admin'));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-[#0a0a0a] border-r border-zinc-800 text-white min-h-screen flex flex-col`}>
        {/* Mobile close */}
        <div className="h-16 flex items-center justify-between px-4 lg:hidden border-b border-zinc-800">
          <span className="font-bold text-kingstar-cyan">Menu</span>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <p className="text-sm text-white truncate">{user?.email}</p>
          <p className="text-xs text-gray-400">
            {user?.role === 'admin' ? 'Gestor' : 'Funcionário'} · {user?.department}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-kingstar-cyan text-black font-semibold' : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon size={20} /><span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full px-4 py-2 rounded-lg hover:bg-zinc-800"
          >
            <LogOut size={20} /><span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const getFallbackRoute = () => {
    if (user?.role === 'admin') return '/';
    switch (user?.department) {
      case 'Recebimento':  return '/receiving';
      case 'Conferência':  return '/conference';
      case 'Estoque':      return '/stock';
      case 'Compras':      return '/purchases';
      default:             return '/schedule';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-kingstar-bg font-sans text-gray-200">
    <header className="h-16 bg-[#0a0a0a] border-b border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-10 relative">
  
  {/* ESQUERDA */}
  <div className="flex items-center z-10">
    <button
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      className="p-2 text-gray-400 hover:text-white lg:hidden"
    >
      <Menu size={24} />
    </button>

    <img
      className="h-15 w-18 ml-2"
      src="data:image/png;base64,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"
      alt="logo"
    />
  </div>

  {/* CENTRO (ABSOLUTO) */}
  <div className="absolute left-1/2 transform -translate-x-1/2">
    <h1 className="text-xl font-bold text-kingstar-cyan tracking-wider">
      KINGSTAR-INTELLIGENCE
    </h1>
  </div>

  {/* DIREITA (opcional - pode colocar user, logout, etc) */}
  <div className="z-10">
    {/* espaço reservado */}
  </div>

</header>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-8 overflow-auto w-full">
          <Routes>
            {user?.role === 'admin' && (
              <>
                <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/pcl"       element={<ProtectedRoute><PCL /></ProtectedRoute>} />
                <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
              </>
            )}
            <Route path="/schedule"   element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/purchases"  element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
            <Route path="/receiving"  element={<ProtectedRoute><Receiving /></ProtectedRoute>} />
            <Route path="/conference" element={<ProtectedRoute><Conference /></ProtectedRoute>} />
            <Route path="/stock"      element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="*"           element={<Navigate to={getFallbackRoute()} />} />
          </Routes>
        </main>
      </div>

      <ChatBot />
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' },
            success: { iconTheme: { primary: '#0ea5e9', secondary: '#fff' } },
          }}
        />
        <MainApp />
      </Router>
    </AuthProvider>
  );
}
