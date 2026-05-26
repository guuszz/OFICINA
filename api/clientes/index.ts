import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { prisma } from '../_lib/prisma';
import { authenticate, setCors } from '../_lib/auth';

const createSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  telefone: z.string().min(8, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = authenticate(req, res);
  if (!payload) return;

  try {
    if (req.method === 'GET') {
      const clientes = await prisma.cliente.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(clientes);
    }

    if (req.method === 'POST') {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      try {
        const cliente = await prisma.cliente.create({
          data: { ...parsed.data, userId: payload.userId },
        });
        return res.status(201).json({ message: 'Cliente cadastrado com sucesso', cliente });
      } catch (err: unknown) {
        // P2002 = unique constraint violation (email já cadastrado pra esse user)
        if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
          return res.status(409).json({ message: 'Email já cadastrado pra outro cliente seu' });
        }
        throw err;
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('clientes error:', err);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
}
