import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { prisma } from '../_lib/prisma.js';
import { authenticate, setCors } from '../_lib/auth.js';

const TIPOS = ['Sedan', 'Hatch', 'SUV', 'Picape', 'Esportivo', 'Moto', 'Outro'] as const;

const createSchema = z.object({
  clienteId: z.string().min(1, 'Cliente obrigatório'),
  placa: z.string().min(6, 'Placa inválida'),
  marca: z.string().min(1, 'Marca obrigatória'),
  modelo: z.string().min(1, 'Modelo obrigatório'),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser hex #RRGGBB')
    .optional()
    .nullable(),
  tipo: z.enum(TIPOS).optional().default('Outro'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = authenticate(req, res);
  if (!payload) return;

  try {
    if (req.method === 'GET') {
      const veiculos = await prisma.veiculo.findMany({
        where: { cliente: { userId: payload.userId } },
        include: {
          cliente: { select: { id: true, nome: true, telefone: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(veiculos);
    }

    if (req.method === 'POST') {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      // Confirma que o cliente pertence ao user
      const cliente = await prisma.cliente.findFirst({
        where: { id: parsed.data.clienteId, userId: payload.userId },
      });
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      try {
        const veiculo = await prisma.veiculo.create({
          data: parsed.data,
          include: { cliente: { select: { id: true, nome: true, telefone: true } } },
        });
        return res.status(201).json({ message: 'Veículo cadastrado com sucesso', veiculo });
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
          return res.status(409).json({ message: 'Placa já cadastrada pra este cliente' });
        }
        throw err;
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('veiculos error:', err);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
}
