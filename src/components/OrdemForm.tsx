import React, { useState, useEffect } from 'react';
import { ClipboardList, Car, FileText, DollarSign, AlertCircle, Plus, Loader2 } from 'lucide-react';

interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  cliente: {
    nome: string;
  };
}

interface OrdemFormProps {
  onSuccess?: () => void;
}

const OrdemForm: React.FC<OrdemFormProps> = ({ onSuccess }) => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [formData, setFormData] = useState({
    veiculoId: '',
    descricao: '',
    valor: '',
    status: 'Aberta'
  });
  const [loading, setLoading] = useState(false);
  const [loadingVeiculos, setLoadingVeiculos] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const statusOptions = [
    { value: 'Aberta', label: '🔴 Aberta', color: 'text-red-600' },
    { value: 'Em Andamento', label: '🟡 Em Andamento', color: 'text-yellow-600' },
    { value: 'Concluída', label: '🟢 Concluída', color: 'text-green-600' },
    { value: 'Cancelada', label: '⚫ Cancelada', color: 'text-gray-600' }
  ];

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
      setLoadingVeiculos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:3001/ordens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ veiculoId: '', descricao: '', valor: '', status: 'Aberta' });
        onSuccess?.();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao criar ordem de serviço' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loadingVeiculos) {
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
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Plus className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Criar Nova Ordem de Serviço</h2>
      </div>

      {veiculos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum veículo encontrado.</p>
          <p className="text-sm">Cadastre um veículo primeiro para poder criar ordens de serviço.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="w-4 h-4 inline mr-2" />
                Veículo
              </label>
              <select
                name="veiculoId"
                value={formData.veiculoId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              >
                <option value="">Selecione um veículo</option>
                {veiculos.map(veiculo => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {veiculo.placa} - {veiculo.marca} {veiculo.modelo} ({veiculo.cliente.nome})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Descrição do Serviço
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              placeholder="Descreva detalhadamente o serviço a ser realizado..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Valor (R$)
            </label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              placeholder="0,00"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Criar Ordem de Serviço</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default OrdemForm;