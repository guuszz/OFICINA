import React, { useState, useEffect } from 'react';
import {
  Users,
  Car,
  ClipboardList,
  Activity,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { useNumberTicker } from '../lib/useNumberTicker';
import { useAuth } from '../contexts/AuthContext';

interface StatsData {
  totalClientes: number;
  totalVeiculos: number;
  totalOrdens: number;
  ordensAbertas: number;
  ordensAndamento: number;
  ordensConcluidas: number;
}

interface Ordem {
  id?: number | string;
  status: string;
  descricao?: string;
  cliente?: { nome?: string };
  veiculo?: { marca?: string; modelo?: string; placa?: string };
  createdAt?: string;
}

const greeting = (name?: string): string => {
  const h = new Date().getHours();
  const period = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const who = name ? name.split(' ')[0] : '';
  return who ? `${period}, ${who}` : period;
};

const formatDate = (): string => {
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
  const txt = fmt.format(new Date());
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

const Stats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const [clientesRes, veiculosRes, ordensRes] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/veiculos'),
        fetch('/api/ordens'),
      ]);
      const [clientes, veiculos, ordensData] = await Promise.all([
        clientesRes.json(),
        veiculosRes.json(),
        ordensRes.json(),
      ]);

      setStats({
        totalClientes: clientes.length,
        totalVeiculos: veiculos.length,
        totalOrdens: ordensData.length,
        ordensAbertas: ordensData.filter((o: Ordem) => o.status === 'Aberta').length,
        ordensAndamento: ordensData.filter((o: Ordem) => o.status === 'Em Andamento').length,
        ordensConcluidas: ordensData.filter((o: Ordem) => o.status === 'Concluída').length,
      });
      setOrdens(ordensData);
    } catch (e) {
      console.error('[stats] erro ao buscar', e);
      setError('Não foi possível carregar o dashboard. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" aria-hidden="true" />
        <p className="text-sm font-medium text-destructive">{error || 'Erro ao carregar'}</p>
      </div>
    );
  }

  const ordensAtivas = ordens
    .filter((o) => o.status === 'Aberta' || o.status === 'Em Andamento')
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Greeting hero */}
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {formatDate()}
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-fg">
          {greeting(user?.name)} 👋
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {stats.ordensAbertas + stats.ordensAndamento === 0
            ? 'Nenhuma ordem em aberto no momento. Tudo em dia.'
            : `Você tem ${stats.ordensAbertas + stats.ordensAndamento} ${
                stats.ordensAbertas + stats.ordensAndamento === 1 ? 'ordem' : 'ordens'
              } pra acompanhar hoje.`}
        </p>
      </header>

      {/* KPI cards — 4 cards (não 6, evita overload) */}
      <section aria-label="Indicadores principais">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard
            label="Clientes"
            value={stats.totalClientes}
            icon={Users}
            tone="neutral"
          />
          <KpiCard
            label="Veículos"
            value={stats.totalVeiculos}
            icon={Car}
            tone="neutral"
          />
          <KpiCard
            label="OS em aberto"
            value={stats.ordensAbertas}
            icon={Activity}
            tone={stats.ordensAbertas > 0 ? 'warning' : 'neutral'}
          />
          <KpiCard
            label="Em andamento"
            value={stats.ordensAndamento}
            icon={TrendingUp}
            tone={stats.ordensAndamento > 0 ? 'accent' : 'neutral'}
          />
        </div>
      </section>

      {/* Status segmentado + lista de ordens em paralelo */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Status overview */}
        <section
          className="rounded-lg border border-border bg-card p-6 lg:col-span-2"
          aria-label="Status das ordens"
        >
          <h3 className="mb-1 text-base font-semibold text-fg">Status das OS</h3>
          <p className="mb-6 text-xs text-muted-foreground">
            Distribuição entre {stats.totalOrdens} {stats.totalOrdens === 1 ? 'ordem' : 'ordens'}
          </p>

          {stats.totalOrdens > 0 ? (
            <>
              {/* Segmented bar */}
              <div
                className="mb-5 flex h-3 w-full overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${stats.ordensAbertas} abertas, ${stats.ordensAndamento} em andamento, ${stats.ordensConcluidas} concluídas`}
              >
                {stats.ordensAbertas > 0 && (
                  <div
                    className="bg-amber-500 transition-all duration-500"
                    style={{ width: `${(stats.ordensAbertas / stats.totalOrdens) * 100}%` }}
                  />
                )}
                {stats.ordensAndamento > 0 && (
                  <div
                    className="bg-accent transition-all duration-500"
                    style={{ width: `${(stats.ordensAndamento / stats.totalOrdens) * 100}%` }}
                  />
                )}
                {stats.ordensConcluidas > 0 && (
                  <div
                    className="bg-primary transition-all duration-500"
                    style={{ width: `${(stats.ordensConcluidas / stats.totalOrdens) * 100}%` }}
                  />
                )}
              </div>

              <ul className="space-y-2.5 text-sm">
                <StatusRow
                  color="bg-amber-500"
                  label="Abertas"
                  value={stats.ordensAbertas}
                  total={stats.totalOrdens}
                />
                <StatusRow
                  color="bg-accent"
                  label="Em andamento"
                  value={stats.ordensAndamento}
                  total={stats.totalOrdens}
                />
                <StatusRow
                  color="bg-primary"
                  label="Concluídas"
                  value={stats.ordensConcluidas}
                  total={stats.totalOrdens}
                />
              </ul>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma ordem cadastrada ainda.
            </p>
          )}
        </section>

        {/* Ordens recentes */}
        <section
          className="rounded-lg border border-border bg-card p-6 lg:col-span-3"
          aria-label="Ordens em aberto"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-fg">Ordens em aberto</h3>
              <p className="text-xs text-muted-foreground">
                Atendimentos que precisam da sua atenção
              </p>
            </div>
            <ClipboardList className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>

          {ordensAtivas.length > 0 ? (
            <ul className="divide-y divide-border">
              {ordensAtivas.map((ordem, idx) => (
                <li
                  key={ordem.id || idx}
                  className="group flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          ordem.status === 'Aberta'
                            ? 'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900'
                            : 'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900'
                        }
                      >
                        {ordem.status}
                      </span>
                      {ordem.cliente?.nome && (
                        <span className="truncate text-sm font-medium text-fg">
                          {ordem.cliente.nome}
                        </span>
                      )}
                    </div>
                    {(ordem.veiculo?.marca || ordem.veiculo?.modelo) && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {[ordem.veiculo?.marca, ordem.veiculo?.modelo, ordem.veiculo?.placa]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    {ordem.descricao && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {ordem.descricao}
                      </p>
                    )}
                  </div>
                  <ArrowRight
                    className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma ordem em aberto. Tudo em dia! 🎉
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// -- Subcomponentes ---------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'neutral' | 'accent' | 'warning';
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon: Icon, tone }) => {
  const display = useNumberTicker(value, 600);

  const toneStyles = {
    neutral: 'bg-muted text-muted-foreground',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-amber-100 text-amber-900',
  };

  return (
    <div className="group relative rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-fg tabular-nums">
            {display}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${toneStyles[tone]}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

interface StatusRowProps {
  color: string;
  label: string;
  value: number;
  total: number;
}

const StatusRow: React.FC<StatusRowProps> = ({ color, label, value, total }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${color}`} aria-hidden="true" />
        <span className="text-fg">{label}</span>
      </div>
      <div className="flex items-center gap-2 tabular-nums">
        <span className="font-semibold text-fg">{value}</span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
    </li>
  );
};

const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-8">
    {/* Greeting skeleton */}
    <div className="space-y-2">
      <div className="h-3 w-32 rounded bg-muted" />
      <div className="h-8 w-64 rounded bg-muted" />
      <div className="h-4 w-80 rounded bg-muted" />
    </div>

    {/* KPI skeleton */}
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 h-3 w-20 rounded bg-muted" />
          <div className="h-8 w-12 rounded bg-muted" />
        </div>
      ))}
    </div>

    {/* Cards skeleton */}
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
        <div className="space-y-3">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-3 w-full rounded-full bg-muted" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 lg:col-span-3">
        <div className="space-y-3">
          <div className="h-5 w-40 rounded bg-muted" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5 py-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Stats;
