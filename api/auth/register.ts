import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { prisma } from '../_lib/prisma.js';
import { hashPassword, signToken, setCors } from '../_lib/auth.js';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome obrigatório').optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { email, password, name } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        name: name || null,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = signToken({ userId: user.id, email: user.email });

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Erro ao criar conta' });
  }
}
