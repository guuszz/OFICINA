import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import ClientesList from './components/ClientesList';
import VeiculosList from './components/VeiculosList';
import OrdensList from './components/OrdensList';
import Stats from './components/Stats';
import AuthScreen from './components/AuthScreen';
import Sidebar, { MobileBottomNav, type ActiveTab } from './components/Sidebar';
import { useAuth } from './contexts/AuthContext';

const PAGE_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Visão geral da sua oficina',
  },
  clientes: {
    title: 'Clientes',
    subtitle: 'Gerencie os clientes cadastrados',
  },
  veiculos: {
    title: 'Veículos',
    subtitle: 'Veículos associados aos seus clientes',
  },
  ordens: {
    title: 'Ordens de Serviço',
    subtitle: 'Acompanhe os atendimentos em andamento',
  },
};

function App() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Scroll-to-top ao trocar de seção — evita usuário ficar perdido em meio scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    toast.success('Você saiu da sua conta');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden="true" />
          <span className="text-sm">Carregando...</span>
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

  const page = PAGE_TITLES[activeTab];

  return (
    <div className="min-h-screen bg-bg">
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ style: { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' } }}
      />

      {/* Sidebar fixa desktop */}
      <Sidebar
        active={activeTab}
        onChange={setActiveTab}
        onLogout={handleLogout}
        userEmail={user.email}
        userName={user.name}
      />

      {/* Conteúdo principal — desloca pra direita 240px em desktop */}
      <div className="md:pl-60">
        {/* Top bar (mobile + título da página em desktop) */}
        <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight text-fg sm:text-xl">
                {page.title}
              </h1>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {page.subtitle}
              </p>
            </div>
            {/* Em mobile mostra email do user (sidebar não aparece) */}
            <div className="hidden text-right md:hidden">
              <p className="truncate text-sm font-medium text-fg">{user.name || user.email}</p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pb-8 lg:px-8 lg:pt-8">
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && <Stats />}
            {activeTab === 'clientes' && <ClientesList />}
            {activeTab === 'veiculos' && <VeiculosList />}
            {activeTab === 'ordens' && <OrdensList />}
          </div>
        </main>
      </div>

      {/* Bottom nav mobile */}
      <MobileBottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
