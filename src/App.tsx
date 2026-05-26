import React, { useState } from 'react';
import { Wrench, Users, Car, ClipboardList, Activity, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import ClientesList from './components/ClientesList';
import VeiculosList from './components/VeiculosList';
import OrdensList from './components/OrdensList';
import Stats from './components/Stats';
import AuthScreen from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';

type ActiveTab = 'dashboard' | 'clientes' | 'veiculos' | 'ordens';

function App() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const handleLogout = () => {
    logout();
    toast.success('Você saiu da sua conta');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        <AuthScreen />
      </>
    );
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Activity },
    { id: 'clientes' as const, label: 'Clientes', icon: Users },
    { id: 'veiculos' as const, label: 'Veículos', icon: Car },
    { id: 'ordens' as const, label: 'Ordens de Serviço', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ style: { fontFamily: 'system-ui, -apple-system, sans-serif' } }}
      />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Oficina Mecânica
                </h1>
                <p className="text-gray-600 text-sm">Sistema de Gestão Completo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-800">
                  {user.name || user.email}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white/90 border border-gray-200 rounded-lg transition-all hover:shadow-md text-sm text-gray-700"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Stats />}
        {activeTab === 'clientes' && <ClientesList />}
        {activeTab === 'veiculos' && <VeiculosList />}
        {activeTab === 'ordens' && <OrdensList />}
      </main>
    </div>
  );
}

export default App;
