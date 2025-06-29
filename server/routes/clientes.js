import express from 'express';
import database from '../storage/database.js';

const router = express.Router();

// GET /clientes - Listar todos os clientes
router.get('/', (req, res) => {
  try {
    const clientes = database.getAllClientes();
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível listar os clientes'
    });
  }
});

// POST /clientes - Criar novo cliente
router.post('/', (req, res) => {
  try {
    const { nome, telefone, email } = req.body;
    
    // Validação básica
    if (!nome || !telefone || !email) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'Nome, telefone e email são obrigatórios'
      });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        message: 'Por favor, forneça um email válido'
      });
    }

    // Verificar se email já existe
    const clientes = database.getAllClientes();
    const emailExists = clientes.some(cliente => cliente.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        message: 'Já existe um cliente com este email'
      });
    }

    // Criar cliente
    const novoCliente = database.createCliente({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.toLowerCase().trim()
    });

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso',
      clienteId: novoCliente.id,
      cliente: novoCliente
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível cadastrar o cliente'
    });
  }
});

// GET /clientes/:id - Buscar cliente por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const cliente = database.getClienteById(id);
    
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        message: `Não foi possível encontrar cliente com ID ${id}`
      });
    }

    // Buscar veículos do cliente
    const veiculos = database.getVeiculosByClienteId(id);
    
    res.json({
      ...cliente,
      veiculos
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o cliente'
    });
  }
});

export default router;