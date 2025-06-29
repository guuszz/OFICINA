import React, { useState, useEffect } from 'react';
import { Car, Hash, Building, User, Calendar, Search, Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    try {
      const response = await fetch('http://localhost:3001/veiculos');
      if (response.ok) {
        const data = await response.json();
        setVeiculos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVeiculos = veiculos.filter(veiculo =>
    veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (veiculo.cliente && veiculo.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Carregando veículos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Car className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Lista de Veículos</h2>
          <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
            {veiculos.length}
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar veículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
          />
        </div>
      </div>

      {filteredVeiculos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </p>
          <p className="text-sm">
            {searchTerm 
              ? 'Tente buscar com outros termos.' 
              : 'Cadastre seu primeiro veículo para começar.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVeiculos.map((veiculo) => (
            <div
              key={veiculo.id}
              className="bg-white/60 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:bg-white/80"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{veiculo.marca} {veiculo.modelo}</h3>
                    <p className="text-xs text-gray-500">ID: {veiculo.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Hash className="w-4 h-4" />
                  <span className="font-mono font-semibold">{veiculo.placa}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{veiculo.marca}</span>
                </div>
                {veiculo.cliente && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="truncate">{veiculo.cliente.nome}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Cadastrado em {formatDate(veiculo.createdAt)}</span>
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