import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { prisma } from '../../_lib/prisma';
import { authenticate, setCors } from '../../_lib/auth';

const schema = z.object({
  status: z.enum(['Aberta', 'EmAndamento', 'Concluida', 'Cancelada']),
});

// Mapeia status visíveis no frontend (com espaço/acento) pro enum interno
const statusMap: Record<string, 'Aberta' | 'EmAndamento' | 'Concluida' | 'Cancelada'> = {
  'Aberta': 'Aberta',
  'Em Andamento': 'EmAndamento',
  'EmAndamento': 'EmAndamento',
  'Concluída': 'Concluida',
  'Concluida': 'Concluida',
  'Cancelada': 'Cancelada',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });

  const payload = authenticate(req, res);
  if (!payload) return;

  const ordemId = req.query.id as string;
  if (!ordemId) return res.status(400).json({ message: 'ID da ordem obrigatório' });

  const incomingStatus = req.body?.status as string | undefined;
  const normalized = incomingStatus ? statusMap[incomingStatus] : undefined;

  const parsed = schema.safeParse({ status: normalized });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Status inválido' });
  }

  try {
    // Verifica que a ordem pertence a um veículo de um cliente do user
    const ordem = await prisma.ordem.findFirst({
      where: {
        id: ordemId,
        veiculo: { cliente: { userId: payload.userId } },
      },
    });
    if (!ordem) {
      return res.status(404).json({ message: 'Ordem não encontrada' });
    }

    const updated = await prisma.ordem.update({
      where: { id: ordemId },
      data: { status: parsed.data.status },
    });

    return res.status(200).json({ message: 'Status atualizado', ordem: updated });
  } catch (err) {
    console.error('update status error:', err);
    return res.status(500).json({ message: 'Erro ao atualizar status' });
  }
}
