import React, { useState, useEffect } from 'react';
import { Activity, Users, Car, ClipboardList, DollarSign, TrendingUp, Loader2 } from 'lucide-react';

interface StatsData {
  totalClientes: number;
  totalVeiculos: number;
  totalOrdens: number;
  ordensAbertas: number;
  ordensAndamento: number;
  ordensConcluidas: number;
}

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Buscar dados de múltiplos endpoints
      const [clientesRes, veiculosRes, ordensRes] = await Promise.all([
        fetch('http://localhost:3001/clientes'),
        fetch('http://localhost:3001/veiculos'),
        fetch('http://localhost:3001/ordens')
      ]);

      const [clientes, veiculos, ordens] = await Promise.all([
        clientesRes.json(),
        veiculosRes.json(),
        ordensRes.json()
      ]);

      // Calcular estatísticas
      const statsData: StatsData = {
        totalClientes: clientes.length,
        totalVeiculos: veiculos.length,
        totalOrdens: ordens.length,
        ordensAbertas: ordens.filter((o: any) => o.status === 'Aberta').length,
        ordensAndamento: ordens.filter((o: any) => o.status === 'Em Andamento').length,
        ordensConcluidas: ordens.filter((o: any) => o.status === 'Concluída').length,
      };

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando estatísticas...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClientes,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Veículos Cadastrados',
      value: stats.totalVeiculos,
      icon: Car,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total de Ordens',
      value: stats.totalOrdens,
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Ordens Abertas',
      value: stats.ordensAbertas,
      icon: Activity,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Em Andamento',
      value: stats.ordensAndamento,
      icon: TrendingUp,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Concluídas',
      value: stats.ordensConcluidas,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard - Visão Geral</h2>
        </div>
        <p className="text-gray-600">Acompanhe o desempenho da sua oficina em tempo real</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            <div className="mt-4">
              <div className={`h-2 bg-gradient-to-r ${card.color} rounded-full`} />
            </div>
          </div>
        ))}
      </div>

      {/* Progress Section */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Status das Ordens de Serviço</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Ordens Abertas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{stats.ordensAbertas}</span>
              <span className="text-sm text-gray-500">
                ({stats.totalOrdens > 0 ? Math.round((stats.ordensAbertas / stats.totalOrdens) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">Em Andamento</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{stats.ordensAndamento}</span>
              <span className="text-sm text-gray-500">
                ({stats.totalOrdens > 0 ? Math.round((stats.ordensAndamento / stats.totalOrdens) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Concluídas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{stats.ordensConcluidas}</span>
              <span className="text-sm text-gray-500">
                ({stats.totalOrdens > 0 ? Math.round((stats.ordensConcluidas / stats.totalOrdens) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.totalOrdens > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
              <span className="text-sm text-gray-500">
                {Math.round((stats.ordensConcluidas / stats.totalOrdens) * 100)}% concluído
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(stats.ordensConcluidas / stats.totalOrdens) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;