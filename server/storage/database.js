// Simulação de banco de dados em memória
class Database {
  constructor() {
    this.clientes = [];
    this.veiculos = [];
    this.ordens = [];
    this.counters = {
      cliente: 1,
      veiculo: 1,
      ordem: 1
    };
    
    // Dados de exemplo
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Cliente de exemplo
    this.clientes.push({
      id: "1",
      nome: "Maria Silva",
      telefone: "11999888777",
      email: "maria@email.com",
      createdAt: new Date().toISOString()
    });

    // Veículo de exemplo
    this.veiculos.push({
      id: "1",
      clienteId: "1",
      placa: "ABC1234",
      marca: "Toyota",
      modelo: "Corolla",
      createdAt: new Date().toISOString()
    });

    // Ordem de exemplo
    this.ordens.push({
      id: "1",
      veiculoId: "1",
      descricao: "Revisão completa do motor",
      valor: 450.00,
      status: "Em Andamento",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.counters = {
      cliente: 2,
      veiculo: 2,
      ordem: 2
    };
  }

  // Clientes
  createCliente(clienteData) {
    const cliente = {
      id: String(this.counters.cliente++),
      ...clienteData,
      createdAt: new Date().toISOString()
    };
    this.clientes.push(cliente);
    return cliente;
  }

  getAllClientes() {
    return this.clientes;
  }

  getClienteById(id) {
    return this.clientes.find(cliente => cliente.id === id);
  }

  // Veículos
  createVeiculo(veiculoData) {
    const veiculo = {
      id: String(this.counters.veiculo++),
      ...veiculoData,
      createdAt: new Date().toISOString()
    };
    this.veiculos.push(veiculo);
    return veiculo;
  }

  getAllVeiculos() {
    return this.veiculos;
  }

  getVeiculoById(id) {
    return this.veiculos.find(veiculo => veiculo.id === id);
  }

  getVeiculosByClienteId(clienteId) {
    return this.veiculos.filter(veiculo => veiculo.clienteId === clienteId);
  }

  // Ordens de Serviço
  createOrdem(ordemData) {
    const ordem = {
      id: String(this.counters.ordem++),
      ...ordemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.ordens.push(ordem);
    return ordem;
  }

  getAllOrdens() {
    return this.ordens.map(ordem => {
      const veiculo = this.getVeiculoById(ordem.veiculoId);
      const cliente = veiculo ? this.getClienteById(veiculo.clienteId) : null;
      
      return {
        ...ordem,
        veiculo: veiculo,
        cliente: cliente
      };
    });
  }

  getOrdemById(id) {
    return this.ordens.find(ordem => ordem.id === id);
  }

  updateOrdemStatus(id, newStatus) {
    const ordem = this.getOrdemById(id);
    if (ordem) {
      ordem.status = newStatus;
      ordem.updatedAt = new Date().toISOString();
      return ordem;
    }
    return null;
  }

  // Estatísticas
  getStats() {
    const totalClientes = this.clientes.length;
    const totalVeiculos = this.veiculos.length;
    const totalOrdens = this.ordens.length;
    const ordensAbertas = this.ordens.filter(o => o.status === 'Aberta').length;
    const ordensAndamento = this.ordens.filter(o => o.status === 'Em Andamento').length;
    const ordensConcluidas = this.ordens.filter(o => o.status === 'Concluída').length;

    return {
      totalClientes,
      totalVeiculos,
      totalOrdens,
      ordensAbertas,
      ordensAndamento,
      ordensConcluidas
    };
  }
}

// Singleton instance
const database = new Database();
export default database;