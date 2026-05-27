import React from 'react';
import { cn } from '../lib/utils';

export type OrdemStatus = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';

interface StatusBadgeProps {
  status: string;
  className?: string;
  /** Mostra um ponto colorido em vez de fundo cheio (variante mais sutil). */
  dot?: boolean;
}

const STATUS_STYLES: Record<OrdemStatus, { bg: string; text: string; dot: string }> = {
  Aberta: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-900 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
  'Em Andamento': {
    bg: 'bg-accent/15',
    text: 'text-accent',
    dot: 'bg-accent',
  },
  Concluída: {
    bg: 'bg-primary/15',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  Cancelada: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, dot = false }) => {
  const style = STATUS_STYLES[status as OrdemStatus] || STATUS_STYLES.Cancelada;

  if (dot) {
    return (
      <span className={cn('inline-flex items-center gap-2 text-xs font-medium', className)}>
        <span className={cn('h-2 w-2 flex-shrink-0 rounded-full', style.dot)} aria-hidden="true" />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        style.bg,
        style.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
