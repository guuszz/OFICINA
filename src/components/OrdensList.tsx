import React, { useState, useEffect } from 'react';
import { ClipboardList, Car, User, DollarSign, Calendar, Search, Loader2, Edit3, Plus, FileText } from 'lucide-react';
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

const statusOptions = [
  { value: 'Aberta', label: '🔴 Aberta', badge: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'Em Andamento', label: '🟡 Em Andamento', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'Concluída', label: '🟢 Concluída', badge: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'Cancelada', label: '⚫ Cancelada', badge: 'bg-gray-100 text-gray-800 border-gray-200' },
] as const;

const OrdensList: React.FC = () => {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState({ veiculoId: '', descricao: '', valor: '', status: 'Aberta' });
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

  const filtered = ordens.filter((o) => {
    const matchSearch =
      o.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.veiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatMoney = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getStatusBadge = (status: string) =>
    statusOptions.find((s) => s.value === status)?.badge || 'bg-gray-100 text-gray-800 border-gray-200';

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Carregando ordens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Ordens de Serviço</h2>
          <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2 py-1 rounded-full">
            {ordens.length}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:flex-initial justify-end flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="all">Todos status</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:flex-initial min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 text-sm"
            />
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Ordem</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Ordem de Serviço</DialogTitle>
                <DialogDescription>
                  Selecione o veículo e descreva o serviço a ser executado.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="veiculoId">
                    <Car className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Veículo
                  </Label>
                  <select
                    id="veiculoId"
                    required
                    value={formData.veiculoId}
                    onChange={(e) => setFormData((p) => ({ ...p, veiculoId: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="">Selecione um veículo...</option>
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} — {v.marca} {v.modelo} ({v.cliente?.nome})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">
                    <FileText className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Descrição do serviço
                  </Label>
                  <textarea
                    id="descricao"
                    required
                    rows={3}
                    placeholder="Ex: Troca de óleo e filtros, revisão geral..."
                    value={formData.descricao}
                    onChange={(e) => setFormData((p) => ({ ...p, descricao: e.target.value }))}
                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">
                    <DollarSign className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Valor (R$)
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="350.00"
                    value={formData.valor}
                    onChange={(e) => setFormData((p) => ({ ...p, valor: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting || !veiculos.length}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar OS
                      </>
                    )}
                  </Button>
                </div>
                {!veiculos.length && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                    Cadastre um veículo antes de abrir uma OS.
                  </p>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            {searchTerm || statusFilter !== 'all' ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem aberta'}
          </p>
          <p className="text-sm">
            {searchTerm || statusFilter !== 'all' ? 'Ajuste os filtros pra ver mais.' : 'Crie a primeira ordem de serviço.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="bg-white/60 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-white/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{o.descricao}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        <span className="font-mono">{o.veiculo?.placa}</span>
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {o.cliente?.nome}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-lg font-semibold text-gray-800">
                    {formatMoney(o.valor)}
                  </span>
                  <span
                    className={`text-xs font-medium border rounded-full px-2.5 py-1 ${getStatusBadge(o.status)}`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Aberta em {formatDate(o.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={o.status}
                    disabled={updatingStatus === o.id}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="text-xs rounded-md border border-gray-200 bg-white px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {updatingStatus === o.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdensList;
