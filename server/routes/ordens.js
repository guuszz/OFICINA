import express from 'express';
import database from '../storage/database.js';

const router = express.Router();

// GET /ordens - Listar todas as ordens de serviço
router.get('/', (req, res) => {
  try {
    const ordens = database.getAllOrdens();
    res.json(ordens);
  } catch (error) {
    console.error('Erro ao listar ordens:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível listar as ordens de serviço'
    });
  }
});

// POST /ordens - Criar nova ordem de serviço
router.post('/', (req, res) => {
  try {
    const { veiculoId, descricao, valor, status } = req.body;
    
    // Validação básica
    if (!veiculoId || !descricao || valor === undefined) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'VeiculoId, descrição e valor são obrigatórios'
      });
    }

    // Verificar se veículo existe
    const veiculo = database.getVeiculoById(veiculoId);
    if (!veiculo) {
      return res.status(404).json({
        error: 'Veículo não encontrado',
        message: `Veículo com ID ${veiculoId} não encontrado`
      });
    }

    // Validar valor
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return res.status(400).json({
        error: 'Valor inválido',
        message: 'O valor deve ser um número maior que zero'
      });
    }

    // Validar status
    const statusValidos = ['Aberta', 'Em Andamento', 'Concluída', 'Cancelada'];
    const statusOrdem = status || 'Aberta';
    
    if (!statusValidos.includes(statusOrdem)) {
      return res.status(400).json({
        error: 'Status inválido',
        message: `Status deve ser um dos seguintes: ${statusValidos.join(', ')}`
      });
    }

    // Criar ordem
    const novaOrdem = database.createOrdem({
      veiculoId,
      descricao: descricao.trim(),
      valor: valorNumerico,
      status: statusOrdem
    });

    // Buscar dados completos para resposta
    const cliente = database.getClienteById(veiculo.clienteId);

    res.status(201).json({
      message: 'Ordem de serviço criada com sucesso',
      ordemId: novaOrdem.id,
      ordem: {
        ...novaOrdem,
        veiculo,
        cliente
      }
    });

  } catch (error) {
    console.error('Erro ao criar ordem:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar a ordem de serviço'
    });
  }
});

// PUT /ordens/:id/status - Atualizar status da ordem
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validação básica
    if (!status) {
      return res.status(400).json({
        error: 'Status não informado',
        message: 'O campo status é obrigatório'
      });
    }

    // Validar status
    const statusValidos = ['Aberta', 'Em Andamento', 'Concluída', 'Cancelada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        error: 'Status inválido',
        message: `Status deve ser um dos seguintes: ${statusValidos.join(', ')}`
      });
    }

    // Atualizar status
    const ordemAtualizada = database.updateOrdemStatus(id, status);
    
    if (!ordemAtualizada) {
      return res.status(404).json({
        error: 'Ordem não encontrada',
        message: `Não foi possível encontrar ordem com ID ${id}`
      });
    }

    res.json({
      message: 'Status da ordem atualizado com sucesso',
      ordem: ordemAtualizada
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o status da ordem'
    });
  }
});

// GET /ordens/:id - Buscar ordem por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ordem = database.getOrdemById(id);
    
    if (!ordem) {
      return res.status(404).json({
        error: 'Ordem não encontrada',
        message: `Não foi possível encontrar ordem com ID ${id}`
      });
    }

    // Buscar dados completos
    const veiculo = database.getVeiculoById(ordem.veiculoId);
    const cliente = veiculo ? database.getClienteById(veiculo.clienteId) : null;

    res.json({
      ...ordem,
      veiculo,
      cliente
    });
  } catch (error) {
    console.error('Erro ao buscar ordem:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar a ordem de serviço'
    });
  }
});

// GET /ordens/stats - Estatísticas das ordens
router.get('/stats', (req, res) => {
  try {
    const stats = database.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar as estatísticas'
    });
  }
});

export default router;