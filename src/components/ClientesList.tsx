import React, { useState, useEffect, useMemo } from 'react';
import { Phone, Mail, Calendar, Loader2, Plus, Users } from 'lucide-react';
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

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  createdAt: string;
}

const ClientesList: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      if (response.ok) setClientes(await response.json());
      else toast.error('Não foi possível carregar a lista de clientes');
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro de conexão ao buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        const nome = formData.nome;
        setFormData({ nome: '', telefone: '', email: '' });
        setDialogOpen(false);
        await fetchClientes();
        toast.success(`Cliente ${nome} cadastrado!`, {
          description: 'Você já pode adicionar veículos pra este cliente.',
        });
      } else {
        toast.error(data.message || 'Erro ao cadastrar cliente');
      }
    } catch {
      toast.error('Erro de conexão com o servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telefone.includes(searchTerm.trim())
    );
  }, [clientes, searchTerm]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <PageHeader
        count={filtered.length}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome, email ou telefone..."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Novo cliente</span>
              </Button>
            </DialogTrigger>
            <ClienteFormDialog
              formData={formData}
              setFormData={setFormData}
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
                    Nome
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Telefone
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cliente desde
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="group transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium text-fg">{c.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{c.telefone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="divide-y divide-border md:hidden">
            {filtered.map((c) => (
              <li key={c.id} className="space-y-2 p-4 transition-colors hover:bg-muted/40">
                <p className="font-semibold text-fg">{c.nome}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">{c.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  <span>Desde {formatDate(c.createdAt)}</span>
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

interface ClienteFormDialogProps {
  formData: { nome: string; telefone: string; email: string };
  setFormData: React.Dispatch<React.SetStateAction<{ nome: string; telefone: string; email: string }>>;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ClienteFormDialog: React.FC<ClienteFormDialogProps> = ({
  formData,
  setFormData,
  submitting,
  onSubmit,
  onCancel,
}) => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Cadastrar novo cliente</DialogTitle>
      <DialogDescription>
        Preencha os dados. Você pode adicionar veículos depois.
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={onSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="cliente-nome">Nome completo</Label>
        <Input
          id="cliente-nome"
          type="text"
          required
          autoComplete="name"
          placeholder="Ex: João da Silva"
          value={formData.nome}
          onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cliente-telefone">Telefone</Label>
          <Input
            id="cliente-telefone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="(73) 99999-9999"
            value={formData.telefone}
            onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cliente-email">Email</Label>
          <Input
            id="cliente-email"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            placeholder="cliente@email.com"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
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
    <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
    <p className="text-sm font-medium text-fg">
      {searching ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
      {searching ? 'Tente buscar com outros termos.' : 'Cadastre o primeiro pra começar.'}
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
          <span>Novo cliente</span>
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

export default ClientesList;
