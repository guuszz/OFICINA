import React, { useState, useEffect } from 'react';
import { ClipboardList, Car, User, DollarSign, Calendar, Search, Loader2, Edit3 } from 'lucide-react';

interface Ordem {
  id: string;
  veiculoId: string;
  descricao: string;
  valor: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  veiculo: {
    placa: string;
    marca: string;
    modelo: string;
  };
  cliente: {
    nome: string;
  };
}

const OrdensList: React.FC = () => {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const statusOptions = [
    { value: 'Aberta', label: '🔴 Aberta', color: 'bg-red-100 text-red-800' },
    { value: 'Em Andamento', label: '🟡 Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Concluída', label: '🟢 Concluída', color: 'bg-green-100 text-green-800' },
    { value: 'Cancelada', label: '⚫ Cancelada', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchOrdens();
  }, []);

  const fetchOrdens = async () => {
    try {
      const response = await fetch('http://localhost:3001/ordens');
      if (response.ok) {
        const data = await response.json();
        setOrdens(data);
      }
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ordemId: string, newStatus: string) => {
    setUpdatingStatus(ordemId);
    try {
      const response = await fetch(`http://localhost:3001/ordens/${ordemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Atualizar a ordem na lista local
        setOrdens(prev => prev.map(ordem => 
          ordem.id === ordemId 
            ? { ...ordem, status: newStatus, updatedAt: new Date().toISOString() }
            : ordem
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrdens = ordens.filter(ordem =>
    ordem.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.veiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Carregando ordens de serviço...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Ordens de Serviço</h2>
          <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2 py-1 rounded-full">
            {ordens.length}
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ordens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50"
          />
        </div>
      </div>

      {filteredOrdens.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            {searchTerm ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço cadastrada'}
          </p>
          <p className="text-sm">
            {searchTerm 
              ? 'Tente buscar com outros termos.' 
              : 'Crie sua primeira ordem de serviço para começar.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrdens.map((ordem) => {
            const statusConfig = getStatusConfig(ordem.status);
            const isUpdating = updatingStatus === ordem.id;
            
            return (
              <div
                key={ordem.id}
                className="bg-white/60 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:bg-white/80"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Ordem #{ordem.id}</h3>
                      <p className="text-sm text-gray-600">{ordem.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <div className="relative">
                      <select
                        value={ordem.status}
                        onChange={(e) => updateStatus(ordem.id, e.target.value)}
                        disabled={isUpdating}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer disabled:opacity-50"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-2 text-gray-400" />
                      ) : (
                        <Edit3 className="w-3 h-3 absolute right-2 top-2 text-gray-400 pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Car className="w-4 h-4" />
                    <span>
                      {ordem.veiculo?.placa} - {ordem.veiculo?.marca} {ordem.veiculo?.modelo}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{ordem.cliente?.nome}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-green-600">
                      {formatCurrency(ordem.valor)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(ordem.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdensList;