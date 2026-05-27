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
import CarSilhouette, { type VeiculoTipo } from './CarSilhouette';
import VeiculoFotoUpload from './VeiculoFotoUpload';
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
  cor: string | null;
  tipo: VeiculoTipo;
  fotoUrl: string | null;
  clienteId: string;
  createdAt: string;
  cliente: { id: string; nome: string; telefone: string };
}

const TIPOS: VeiculoTipo[] = ['Sedan', 'Hatch', 'SUV', 'Picape', 'Esportivo', 'Moto', 'Outro'];

// Presets de cor pra acesso rápido (cobre ~85% dos carros brasileiros)
const COLOR_PRESETS = [
  { hex: '#FFFFFF', nome: 'Branco' },
  { hex: '#1E293B', nome: 'Preto' },
  { hex: '#94A3B8', nome: 'Prata' },
  { hex: '#52525B', nome: 'Cinza' },
  { hex: '#DC2626', nome: 'Vermelho' },
  { hex: '#1E40AF', nome: 'Azul' },
  { hex: '#065F46', nome: 'Verde' },
  { hex: '#78350F', nome: 'Marrom' },
];

interface FormData {
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  cor: string;
  tipo: VeiculoTipo;
}

const EMPTY_FORM: FormData = {
  clienteId: '',
  placa: '',
  marca: '',
  modelo: '',
  cor: '#94A3B8', // prata default — cor mais comum
  tipo: 'Sedan',
};

const VeiculosList: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
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
        setFormData(EMPTY_FORM);
        setDialogOpen(false);
        await fetchVeiculos();
        toast.success(`Veículo ${placa} cadastrado!`, {
          description: 'Adicione uma foto real clicando no ícone de câmera no card.',
        });
      } else {
        toast.error(data.message || 'Erro ao cadastrar veículo');
      }
    } catch {
      toast.error('Erro de conexão com o servidor');
    } finally {
      setSubmitting(false);
    }
  };

  // Atualiza fotoUrl localmente após upload (sem refetch desnecessário)
  const handleFotoUpdated = (veiculoId: string, novaUrl: string | null) => {
    setVeiculos((prev) =>
      prev.map((v) => (v.id === veiculoId ? { ...v, fotoUrl: novaUrl } : v))
    );
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => (
            <VeiculoCard
              key={v.id}
              veiculo={v}
              formatDate={formatDate}
              onFotoUpdated={(url) => handleFotoUpdated(v.id, url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Card ────────────────────────────────────────────────────────────

interface VeiculoCardProps {
  veiculo: Veiculo;
  formatDate: (s: string) => string;
  onFotoUpdated: (url: string | null) => void;
}

const VeiculoCard: React.FC<VeiculoCardProps> = ({ veiculo: v, formatDate, onFotoUpdated }) => (
  <article className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-md">
    {/* Imagem area — silhueta colorida OU foto real */}
    <div className="relative aspect-[5/3] overflow-hidden bg-gradient-to-br from-muted to-muted/60">
      {v.fotoUrl ? (
        <img
          src={v.fotoUrl}
          alt={`Foto do ${v.marca} ${v.modelo}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-6">
          <CarSilhouette
            tipo={v.tipo}
            cor={v.cor}
            alt={`${v.marca} ${v.modelo}${v.cor ? ' (cor ' + v.cor + ')' : ''}`}
          />
        </div>
      )}

      {/* Botão de upload flutuante no canto superior direito */}
      <div className="absolute right-2 top-2">
        <VeiculoFotoUpload
          veiculoId={v.id}
          fotoAtual={v.fotoUrl}
          onUploaded={onFotoUpdated}
          compact
        />
      </div>

      {/* Badge da placa no canto inferior esquerdo */}
      <div className="absolute bottom-2 left-2">
        <span className="inline-block rounded border border-fg/10 bg-card/95 px-2 py-0.5 font-mono text-xs font-semibold text-fg shadow-sm backdrop-blur-sm">
          {v.placa}
        </span>
      </div>
    </div>

    {/* Info abaixo da imagem */}
    <div className="space-y-2 p-4">
      <div>
        <h3 className="truncate font-semibold leading-tight text-fg">
          {v.marca} {v.modelo}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{v.tipo}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">{v.cliente?.nome || '—'}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
        <span>Cadastrado em {formatDate(v.createdAt)}</span>
      </div>
    </div>
  </article>
);

// ─── Form Dialog ─────────────────────────────────────────────────────

interface VeiculoFormDialogProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
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
}) => {
  const selectStyles = cn(
    'flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-fg',
    'transition-colors duration-150',
    'hover:border-primary/40',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cadastrar novo veículo</DialogTitle>
        <DialogDescription>
          Preencha os dados. Você pode adicionar uma foto real depois.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        {/* Preview da silhueta em tempo real */}
        <div className="flex items-center gap-4 rounded-md border border-border bg-muted/30 p-3">
          <div className="h-20 w-32 flex-shrink-0">
            <CarSilhouette tipo={formData.tipo} cor={formData.cor} />
          </div>
          <div className="min-w-0 flex-1 text-xs text-muted-foreground">
            <p className="font-medium text-fg">Pré-visualização</p>
            <p className="mt-0.5">
              Esta silhueta vai aparecer no card até você fazer upload de uma foto real.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="veiculo-cliente">Cliente</Label>
          <select
            id="veiculo-cliente"
            required
            value={formData.clienteId}
            onChange={(e) => setFormData((p) => ({ ...p, clienteId: e.target.value }))}
            className={selectStyles}
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
            <Label htmlFor="veiculo-tipo">Tipo</Label>
            <select
              id="veiculo-tipo"
              required
              value={formData.tipo}
              onChange={(e) =>
                setFormData((p) => ({ ...p, tipo: e.target.value as VeiculoTipo }))
              }
              className={selectStyles}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="veiculo-placa">Placa</Label>
            <Input
              id="veiculo-placa"
              type="text"
              required
              placeholder="ABC1D23"
              className="font-mono uppercase"
              value={formData.placa}
              onChange={(e) =>
                setFormData((p) => ({ ...p, placa: e.target.value.toUpperCase() }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

        <div className="space-y-2">
          <Label>Cor</Label>
          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, cor: preset.hex }))}
                title={preset.nome}
                aria-label={`Cor ${preset.nome}`}
                aria-pressed={formData.cor.toLowerCase() === preset.hex.toLowerCase()}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  formData.cor.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-primary scale-110 shadow-md'
                    : 'border-border hover:scale-105'
                )}
                style={{ backgroundColor: preset.hex }}
              />
            ))}
            {/* Color picker custom */}
            <label
              className={cn(
                'relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border bg-card text-[10px] text-muted-foreground transition-all hover:scale-105',
                !COLOR_PRESETS.some(
                  (p) => p.hex.toLowerCase() === formData.cor.toLowerCase()
                ) && 'border-primary scale-110'
              )}
              title="Cor personalizada"
            >
              +
              <input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData((p) => ({ ...p, cor: e.target.value }))}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Escolher cor personalizada"
              />
            </label>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">{formData.cor}</p>
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
};

// ─── Empty + Skeleton ───────────────────────────────────────────────

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="aspect-[5/3] bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default VeiculosList;
