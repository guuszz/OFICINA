import React, { useState, useEffect } from 'react';
import { Wrench, Users, Car, ClipboardList, Activity, Plus, RefreshCw } from 'lucide-react';
import ClienteForm from './components/ClienteForm';
import VeiculoForm from './components/VeiculoForm';
import OrdemForm from './components/OrdemForm';
import ClientesList from './components/ClientesList';
import VeiculosList from './components/VeiculosList';
import OrdensList from './components/OrdensList';
import Stats from './components/Stats';

type ActiveTab = 'dashboard' | 'clientes' | 'veiculos' | 'ordens';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Activity },
    { id: 'clientes' as const, label: 'Clientes', icon: Users },
    { id: 'veiculos' as const, label: 'Veículos', icon: Car },
    { id: 'ordens' as const, label: 'Ordens de Serviço', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-white/70 hover:bg-white/90 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200
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
        <div key={refreshKey}>
          {activeTab === 'dashboard' && <Stats />}
          {activeTab === 'clientes' && (
            <div className="space-y-8">
              <ClienteForm onSuccess={handleRefresh} />
              <ClientesList />
            </div>
          )}
          {activeTab === 'veiculos' && (
            <div className="space-y-8">
              <VeiculoForm onSuccess={handleRefresh} />
              <VeiculosList />
            </div>
          )}
          {activeTab === 'ordens' && (
            <div className="space-y-8">
              <OrdemForm onSuccess={handleRefresh} />
              <OrdensList />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;