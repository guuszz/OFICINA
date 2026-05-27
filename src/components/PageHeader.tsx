import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  count?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Header padrão de páginas de lista (Clientes/Veículos/Ordens).
 * Padrão: contador à esquerda · busca + filtros + CTA à direita.
 *
 * O título principal da página fica na top bar do App.tsx — esse header
 * é só pra controles secundários (busca, filtros, novo).
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  count,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  actions,
  className,
}) => (
  <div
    className={cn(
      'mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
      className
    )}
  >
    {/* Esquerda: contador */}
    {typeof count === 'number' && (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {count} {count === 1 ? 'registro' : 'registros'}
        </span>
      </div>
    )}

    {/* Direita: search + filters + actions */}
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      {onSearchChange && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={cn(
              'h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm text-fg',
              'placeholder:text-muted-foreground',
              'transition-colors duration-150',
              'hover:border-primary/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              'sm:w-64'
            )}
          />
        </div>
      )}
      {filters}
      {actions}
    </div>
  </div>
);

export default PageHeader;
