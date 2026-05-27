import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { ClipboardList, Loader2, Plus, Car, User, Calendar, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import PageHeader from './PageHeader';
import StatusBadge, { type OrdemStatus } from './StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

// Lazy: @react-pdf/renderer pesa ~1.4MB minificado. Só carrega quando o
// usuário realmente abre a aba Ordens (e mesmo assim, sob demanda do chunk).
const OrdemPdfDownload = lazy(() =>
  import('./OrdemPdf').then((mod) => ({ default: mod.OrdemPdfDownload })),
);

interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  cliente: { nome: string };
}

interface Ordem {
  id: string;
  veiculoId: string;
  descricao: string;
  valor: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  veiculo: { placa: string; marca: string; modelo: string };
  cliente: { nome: string };
}

const STATUS_VALUES: OrdemStatus[] = ['Aberta', 'Em Andamento', 'Concluída', 'Cancelada'];

const OrdensList: React.FC = () => {
  const { user } = useAuth();
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    veiculoId: '',
    descricao: '',
    valor: '',
    status: 'Aberta',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchOrdens();
    void fetchVeiculos();
  }, []);

  const fetchOrdens = async () => {
    try {
      const response = await fetch('/api/ordens');
      if (response.ok) setOrdens(await response.json());
      else toast.error('Não foi possível carregar as ordens');
    } catch {
      toast.error('Erro de conexão ao buscar ordens');
    } finally {
      setLoading(false);
    }
  };

  const fetchVeiculos = async () => {
    try {
      const response = await fetch('/api/veiculos');
      if (response.ok) setVeiculos(await response.json());
    } catch {
      // já reportado
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/ordens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, valor: parseFloat(formData.valor) }),
      });
      const data = await response.json();
      if (response.ok) {
        setFormData({ veiculoId: '', descricao: '', valor: '', status: 'Aberta' });
        setDialogOpen(false);
        await fetchOrdens();
        toast.success('Ordem de serviço criada!');
      } else {
        toast.error(data.message || 'Erro ao criar ordem');
      }
    } catch {
      toast.error('Erro de conexão com o servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (ordemId: string, novoStatus: string) => {
    setUpdatingStatus(ordemId);
    try {
      const response = await fetch(`/api/ordens/${ordemId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (response.ok) {
        await fetchOrdens();
        toast.success(`Status atualizado para "${novoStatus}"`);
      } else {
        toast.error('Não foi possível atualizar o status');
      }
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return ordens.filter((o) => {
      const matchSearch =
        !q ||
        o.descricao.toLowerCase().includes(q) ||
        o.veiculo?.placa?.toLowerCase().includes(q) ||
        o.cliente?.nome?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [ordens, searchTerm, statusFilter]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatMoney = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <PageHeader
        count={filtered.length}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar descrição, placa ou cliente..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por status"
            className={cn(
              'h-10 rounded-md border border-border bg-card px-3 text-sm text-fg',
              'transition-colors duration-150',
              'hover:border-primary/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
            )}
          >
            <option value="all">Todos status</option>
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Nova ordem</span>
              </Button>
            </DialogTrigger>
            <OrdemFormDialog
              formData={formData}
              setFormData={setFormData}
              veiculos={veiculos}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => setDialogOpen(false)}
            />
          </Dialog>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          searching={!!searchTerm || statusFilter !== 'all'}
          onClearFilters={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}
          onCreate={() => setDialogOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <article
              key={o.id}
              className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
            >
              {/* Linha 1: status badge + valor à direita */}
              <div className="mb-2 flex items-start justify-between gap-3">
                <StatusBadge status={o.status} />
                <span className="text-base font-semibold tracking-tight text-fg tabular-nums">
                  {formatMoney(o.valor)}
                </span>
              </div>

              {/* Linha 2: descrição */}
              <h3 className="mb-2 text-sm font-medium leading-snug text-fg line-clamp-2">
                {o.descricao}
              </h3>

              {/* Linha 3: metadados (veículo + cliente + data) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-fg">
                    {o.veiculo?.placa}
                  </span>
                  <span className="truncate">
                    {o.veiculo?.marca} {o.veiculo?.modelo}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="truncate">{o.cliente?.nome}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(o.createdAt)}
                </span>
              </div>

              {/* Linha 4: status selector + PDF download */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`status-${o.id}`} className="text-xs text-muted-foreground">
                    Status:
                  </Label>
                  <select
                    id={`status-${o.id}`}
                    value={o.status}
                    disabled={updatingStatus === o.id}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={cn(
                      'h-8 rounded-md border border-border bg-card px-2 text-xs text-fg',
                      'transition-colors duration-150',
                      'hover:border-primary/40 disabled:opacity-50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
                    )}
                  >
                    {STATUS_VALUES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {updatingStatus === o.id && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
                  )}
                </div>

                <Suspense
                  fallback={
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground opacity-50"
                    >
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      <span>Carregando PDF...</span>
                    </button>
                  }
                >
                  <OrdemPdfDownload
                    ordem={{
                      id: o.id,
                      descricao: o.descricao,
                      valor: o.valor,
                      status: o.status,
                      createdAt: o.createdAt,
                      veiculo: {
                        placa: o.veiculo.placa,
                        marca: o.veiculo.marca,
                        modelo: o.veiculo.modelo,
                      },
                      cliente: {
                        nome: o.cliente.nome,
                      },
                    }}
                    oficina={{
                      nome: user?.name || 'OFICINA',
                      email: user?.email,
                    }}
                  >
                    {({ loading, error }) => (
                      <button
                        type="button"
                        disabled={loading || !!error}
                        className={cn(
                          'inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-fg',
                          'transition-all duration-150',
                          'hover:border-accent/50 hover:bg-accent/5 hover:text-accent',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
                        )}
                        aria-label="Baixar PDF da ordem de serviço"
                      >
                        {loading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>{loading ? 'Gerando...' : error ? 'Erro' : 'Baixar PDF'}</span>
                      </button>
                    )}
                  </OrdemPdfDownload>
                </Suspense>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------

interface OrdemFormDialogProps {
  formData: { veiculoId: string; descricao: string; valor: string; status: string };
  setFormData: React.Dispatch<
    React.SetStateAction<{ veiculoId: string; descricao: string; valor: string; status: string }>
  >;
  veiculos: Veiculo[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const OrdemFormDialog: React.FC<OrdemFormDialogProps> = ({
  formData,
  setFormData,
  veiculos,
  submitting,
  onSubmit,
  onCancel,
}) => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Nova ordem de serviço</DialogTitle>
      <DialogDescription>
        Selecione o veículo e descreva o serviço a ser executado.
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={onSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="ordem-veiculo">Veículo</Label>
        <select
          id="ordem-veiculo"
          required
          value={formData.veiculoId}
          onChange={(e) => setFormData((p) => ({ ...p, veiculoId: e.target.value }))}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-fg',
            'transition-colors duration-150',
            'hover:border-primary/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
          )}
        >
          <option value="">Selecione um veículo...</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.marca} {v.modelo} ({v.cliente?.nome})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ordem-descricao">Descrição do serviço</Label>
        <textarea
          id="ordem-descricao"
          required
          rows={3}
          placeholder="Ex: Troca de óleo e filtros, revisão geral..."
          value={formData.descricao}
          onChange={(e) => setFormData((p) => ({ ...p, descricao: e.target.value }))}
          className={cn(
            'flex w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm text-fg',
            'placeholder:text-muted-foreground',
            'transition-colors duration-150',
            'hover:border-primary/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ordem-valor">Valor (R$)</Label>
        <Input
          id="ordem-valor"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          placeholder="350,00"
          className="tabular-nums"
          value={formData.valor}
          onChange={(e) => setFormData((p) => ({ ...p, valor: e.target.value }))}
        />
      </div>

      {!veiculos.length && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          Cadastre um veículo antes de abrir uma ordem de serviço.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting || !veiculos.length}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Criando...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Criar OS</span>
            </>
          )}
        </Button>
      </div>
    </form>
  </DialogContent>
);

const EmptyState: React.FC<{
  searching: boolean;
  onClearFilters: () => void;
  onCreate: () => void;
}> = ({ searching, onClearFilters, onCreate }) => (
  <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center">
    <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
    <p className="text-sm font-medium text-fg">
      {searching ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem aberta ainda'}
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
      {searching ? 'Ajuste os filtros pra ver mais.' : 'Crie a primeira ordem de serviço.'}
    </p>
    <Button
      variant="outline"
      size="sm"
      className="mt-4"
      onClick={searching ? onClearFilters : onCreate}
    >
      {searching ? 'Limpar filtros' : (
        <>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Nova ordem</span>
        </>
      )}
    </Button>
  </div>
);

const ListSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="mb-6 flex items-center justify-between">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="flex gap-3">
        <div className="h-10 w-40 rounded-md bg-muted" />
        <div className="h-10 w-64 rounded-md bg-muted" />
        <div className="h-10 w-32 rounded-md bg-muted" />
      </div>
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="mt-3 flex gap-4">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default OrdensList;
