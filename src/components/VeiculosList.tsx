import React, { useState, useEffect, useMemo } from 'react';
import { Car, Loader2, Plus, User, Calendar } from 'lucide-react';
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
import { cn } from '../lib/utils';

interface Cliente {
  id: string;
  nome: string;
}

interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  clienteId: string;
  createdAt: string;
  cliente: { id: string; nome: string; telefone: string };
}

const VeiculosList: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({ clienteId: '', placa: '', marca: '', modelo: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchVeiculos();
    void fetchClientes();
  }, []);

  const fetchVeiculos = async () => {
    try {
      const response = await fetch('/api/veiculos');
      if (response.ok) setVeiculos(await response.json());
      else toast.error('Não foi possível carregar a lista de veículos');
    } catch {
      toast.error('Erro de conexão ao buscar veículos');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      if (response.ok) setClientes(await response.json());
    } catch {
      // já reportado em fetchVeiculos
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/veiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        const placa = formData.placa;
        setFormData({ clienteId: '', placa: '', marca: '', modelo: '' });
        setDialogOpen(false);
        await fetchVeiculos();
        toast.success(`Veículo ${placa} cadastrado!`);
      } else {
        toast.error(data.message || 'Erro ao cadastrar veículo');
      }
    } catch {
      toast.error('Erro de conexão com o servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return veiculos;
    return veiculos.filter(
      (v) =>
        v.placa.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        v.cliente?.nome?.toLowerCase().includes(q)
    );
  }, [veiculos, searchTerm]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <PageHeader
        count={filtered.length}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por placa, marca, modelo ou cliente..."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Novo veículo</span>
              </Button>
            </DialogTrigger>
            <VeiculoFormDialog
              formData={formData}
              setFormData={setFormData}
              clientes={clientes}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => setDialogOpen(false)}
            />
          </Dialog>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          searching={!!searchTerm}
          onClearSearch={() => setSearchTerm('')}
          onCreate={() => setDialogOpen(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Desktop: tabela */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Placa
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Marca
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Modelo
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cliente
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cadastrado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v) => (
                  <tr key={v.id} className="group transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <span className="inline-block rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-fg">
                        {v.placa}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-fg">{v.marca}</td>
                    <td className="px-4 py-3 text-fg">{v.modelo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.cliente?.nome || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {formatDate(v.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <ul className="divide-y divide-border md:hidden">
            {filtered.map((v) => (
              <li key={v.id} className="space-y-2 p-4 transition-colors hover:bg-muted/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-fg">
                      {v.marca} {v.modelo}
                    </p>
                    <p className="mt-1 inline-block rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs text-fg">
                      {v.placa}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{v.cliente?.nome || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  <span>Desde {formatDate(v.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------

interface VeiculoFormDialogProps {
  formData: { clienteId: string; placa: string; marca: string; modelo: string };
  setFormData: React.Dispatch<
    React.SetStateAction<{ clienteId: string; placa: string; marca: string; modelo: string }>
  >;
  clientes: Cliente[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const VeiculoFormDialog: React.FC<VeiculoFormDialogProps> = ({
  formData,
  setFormData,
  clientes,
  submitting,
  onSubmit,
  onCancel,
}) => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Cadastrar novo veículo</DialogTitle>
      <DialogDescription>Vincule o veículo a um cliente existente.</DialogDescription>
    </DialogHeader>

    <form onSubmit={onSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="veiculo-cliente">Cliente</Label>
        <select
          id="veiculo-cliente"
          required
          value={formData.clienteId}
          onChange={(e) => setFormData((p) => ({ ...p, clienteId: e.target.value }))}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-fg',
            'transition-colors duration-150',
            'hover:border-primary/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
          )}
        >
          <option value="">Selecione um cliente...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="veiculo-placa">Placa</Label>
          <Input
            id="veiculo-placa"
            type="text"
            required
            placeholder="ABC1234"
            className="font-mono uppercase"
            value={formData.placa}
            onChange={(e) =>
              setFormData((p) => ({ ...p, placa: e.target.value.toUpperCase() }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="veiculo-marca">Marca</Label>
          <Input
            id="veiculo-marca"
            type="text"
            required
            placeholder="Honda"
            value={formData.marca}
            onChange={(e) => setFormData((p) => ({ ...p, marca: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="veiculo-modelo">Modelo</Label>
        <Input
          id="veiculo-modelo"
          type="text"
          required
          placeholder="Civic 2020"
          value={formData.modelo}
          onChange={(e) => setFormData((p) => ({ ...p, modelo: e.target.value }))}
        />
      </div>

      {!clientes.length && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          Você precisa cadastrar um cliente antes de adicionar veículos.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting || !clientes.length}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Cadastrando...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Cadastrar</span>
            </>
          )}
        </Button>
      </div>
    </form>
  </DialogContent>
);

const EmptyState: React.FC<{
  searching: boolean;
  onClearSearch: () => void;
  onCreate: () => void;
}> = ({ searching, onClearSearch, onCreate }) => (
  <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center">
    <Car className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
    <p className="text-sm font-medium text-fg">
      {searching ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado ainda'}
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
      {searching ? 'Tente buscar com outros termos.' : 'Cadastre o primeiro veículo.'}
    </p>
    <Button
      variant="outline"
      size="sm"
      className="mt-4"
      onClick={searching ? onClearSearch : onCreate}
    >
      {searching ? 'Limpar busca' : (
        <>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Novo veículo</span>
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
        <div className="h-10 w-64 rounded-md bg-muted" />
        <div className="h-10 w-32 rounded-md bg-muted" />
      </div>
    </div>
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <div className="h-3 w-full max-w-md rounded bg-muted" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-border px-4 py-4 last:border-b-0">
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  </div>
);

export default VeiculosList;
