import express from 'express';
import database from '../storage/database.js';

const router = express.Router();

// GET /veiculos - Listar todos os veículos
router.get('/', (req, res) => {
  try {
    const veiculos = database.getAllVeiculos();
    
    // Enriquecer com dados do cliente
    const veiculosEnriquecidos = veiculos.map(veiculo => {
      const cliente = database.getClienteById(veiculo.clienteId);
      return {
        ...veiculo,
        cliente: cliente ? {
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone
        } : null
      };
    });

    res.json(veiculosEnriquecidos);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível listar os veículos'
    });
  }
});

// POST /veiculos - Cadastrar novo veículo
router.post('/', (req, res) => {
  try {
    const { clienteId, placa, marca, modelo } = req.body;
    
    // Validação básica
    if (!clienteId || !placa || !marca || !modelo) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'ClienteId, placa, marca e modelo são obrigatórios'
      });
    }

    // Verificar se cliente existe
    const cliente = database.getClienteById(clienteId);
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        message: `Cliente com ID ${clienteId} não encontrado`
      });
    }

    // Validar formato da placa (formato brasileiro)
    const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    const placaFormatada = placa.toUpperCase().trim();
    
    if (!placaRegex.test(placaFormatada)) {
      return res.status(400).json({
        error: 'Placa inválida',
        message: 'Placa deve estar no formato ABC1234 ou ABC1D23'
      });
    }

    // Verificar se placa já existe
    const veiculos = database.getAllVeiculos();
    const placaExists = veiculos.some(veiculo => veiculo.placa === placaFormatada);
    
    if (placaExists) {
      return res.status(409).json({
        error: 'Placa já cadastrada',
        message: 'Já existe um veículo com esta placa'
      });
    }

    // Criar veículo
    const novoVeiculo = database.createVeiculo({
      clienteId,
      placa: placaFormatada,
      marca: marca.trim(),
      modelo: modelo.trim()
    });

    res.status(201).json({
      message: 'Veículo cadastrado com sucesso',
      veiculoId: novoVeiculo.id,
      veiculo: {
        ...novoVeiculo,
        cliente: {
          id: cliente.id,
          nome: cliente.nome
        }
      }
    });

  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível cadastrar o veículo'
    });
  }
});

// GET /veiculos/:id - Buscar veículo por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const veiculo = database.getVeiculoById(id);
    
    if (!veiculo) {
      return res.status(404).json({
        error: 'Veículo não encontrado',
        message: `Não foi possível encontrar veículo com ID ${id}`
      });
    }

    // Buscar dados do cliente
    const cliente = database.getClienteById(veiculo.clienteId);
    
    res.json({
      ...veiculo,
      cliente
    });
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o veículo'
    });
  }
});

export default router;