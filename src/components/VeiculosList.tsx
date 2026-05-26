import React, { useState, useEffect } from 'react';
import { Car, Hash, Building, User, Calendar, Search, Loader2, Plus } from 'lucide-react';
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
  cliente: {
    id: string;
    nome: string;
    telefone: string;
  };
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
      // já mostrado em fetchVeiculos
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

  const filtered = veiculos.filter((v) =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando veículos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Car className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Lista de Veículos</h2>
          <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
            {veiculos.length}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:flex-initial justify-end">
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar veículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 text-sm"
            />
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Veículo</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
                <DialogDescription>
                  Vincule o veículo a um cliente existente.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="clienteId">
                    <User className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Cliente
                  </Label>
                  <select
                    id="clienteId"
                    required
                    value={formData.clienteId}
                    onChange={(e) => setFormData((p) => ({ ...p, clienteId: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="placa">
                      <Hash className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Placa
                    </Label>
                    <Input
                      id="placa"
                      type="text"
                      required
                      placeholder="ABC1234"
                      value={formData.placa}
                      onChange={(e) => setFormData((p) => ({ ...p, placa: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marca">
                      <Building className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Marca
                    </Label>
                    <Input
                      id="marca"
                      type="text"
                      required
                      placeholder="Honda"
                      value={formData.marca}
                      onChange={(e) => setFormData((p) => ({ ...p, marca: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    type="text"
                    required
                    placeholder="Civic 2020"
                    value={formData.modelo}
                    onChange={(e) => setFormData((p) => ({ ...p, modelo: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting || !clientes.length}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Cadastrar
                      </>
                    )}
                  </Button>
                </div>
                {!clientes.length && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                    Você precisa cadastrar um cliente primeiro.
                  </p>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </p>
          <p className="text-sm">
            {searchTerm ? 'Tente buscar com outros termos.' : 'Cadastre o primeiro veículo.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <div
              key={v.id}
              className="bg-white/60 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-white/80"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {v.marca} {v.modelo}
                  </h3>
                  <p className="text-sm font-mono text-gray-500">{v.placa}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{v.cliente?.nome || '—'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Desde {formatDate(v.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VeiculosList;
