import React from 'react';
import { Wrench, Users, Car, ClipboardList, Activity, LogOut, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export type ActiveTab = 'dashboard' | 'clientes' | 'veiculos' | 'ordens';

interface SidebarProps {
  active: ActiveTab;
  onChange: (tab: ActiveTab) => void;
  onLogout: () => void;
  userEmail?: string;
  userName?: string;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'veiculos', label: 'Veículos', icon: Car },
  { id: 'ordens', label: 'Ordens de Serviço', icon: ClipboardList },
];

const Sidebar: React.FC<SidebarProps> = ({ active, onChange, onLogout, userEmail, userName }) => {
  const initials = (userName || userEmail || '?').slice(0, 2).toUpperCase();
  const displayName = userName || userEmail?.split('@')[0] || 'Conta';

  return (
    <aside
      className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-fg md:flex"
      aria-label="Navegação principal"
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Wrench className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-fg-active">OFICINA</p>
          <p className="truncate text-[11px] text-sidebar-fg-muted">Gestão completa</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Seções">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                    isActive
                      ? 'bg-sidebar-hover text-sidebar-fg-active'
                      : 'text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active'
                  )}
                >
                  {/* Indicador vertical à esquerda quando ativo */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                    />
                  )}
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer com user + logout */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-md px-3 py-2">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-hover text-xs font-semibold text-sidebar-fg-active"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-fg-active">{displayName}</p>
            {userEmail && (
              <p className="truncate text-[11px] text-sidebar-fg-muted">{userEmail}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
            'text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar'
          )}
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

// Versão mobile: barra inferior fixa (touch-friendly, 44px+ targets)
export const MobileBottomNav: React.FC<Pick<SidebarProps, 'active' | 'onChange'>> = ({
  active,
  onChange,
}) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card shadow-lg md:hidden"
    aria-label="Navegação principal mobile"
  >
    {NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const isActive = active === item.id;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            isActive ? 'text-accent' : 'text-muted-foreground hover:text-fg'
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className="truncate">{item.label.split(' ')[0]}</span>
        </button>
      );
    })}
  </nav>
);

export default Sidebar;
