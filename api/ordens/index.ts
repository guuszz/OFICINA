import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { prisma } from '../_lib/prisma';
import { authenticate, setCors } from '../_lib/auth';

const createSchema = z.object({
  veiculoId: z.string().min(1, 'Veículo obrigatório'),
  descricao: z.string().min(3, 'Descrição muito curta'),
  valor: z.number().nonnegative('Valor inválido'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = authenticate(req, res);
  if (!payload) return;

  try {
    if (req.method === 'GET') {
      const ordens = await prisma.ordem.findMany({
        where: { veiculo: { cliente: { userId: payload.userId } } },
        include: {
          veiculo: {
            select: {
              id: true,
              placa: true,
              marca: true,
              modelo: true,
              cliente: { select: { id: true, nome: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      // Achata cliente pra manter API compatível com frontend antigo
      const formatted = ordens.map((o) => ({
        ...o,
        valor: Number(o.valor),
        cliente: o.veiculo.cliente,
      }));
      return res.status(200).json(formatted);
    }

    if (req.method === 'POST') {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      // Confirma que o veículo pertence ao user
      const veiculo = await prisma.veiculo.findFirst({
        where: {
          id: parsed.data.veiculoId,
          cliente: { userId: payload.userId },
        },
      });
      if (!veiculo) {
        return res.status(404).json({ message: 'Veículo não encontrado' });
      }

      const ordem = await prisma.ordem.create({
        data: {
          veiculoId: parsed.data.veiculoId,
          descricao: parsed.data.descricao,
          valor: parsed.data.valor,
        },
      });
      return res.status(201).json({ message: 'Ordem de serviço criada', ordem });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('ordens error:', err);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
}
