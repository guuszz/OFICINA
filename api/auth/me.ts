import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { authenticate, setCors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const payload = authenticate(req, res);
  if (!payload) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    return res.status(200).json({ user });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
}
