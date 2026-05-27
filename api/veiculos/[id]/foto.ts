import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, del } from '@vercel/blob';
import { prisma } from '../../_lib/prisma.js';
import { authenticate, setCors } from '../../_lib/auth.js';

// Vercel functions têm corpo max 4.5MB no body padrão; configuro pra aceitar 5MB.
export const config = {
  api: {
    bodyParser: false, // Lidamos com binary direto
  },
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = authenticate(req, res);
  if (!payload) return;

  const veiculoId = req.query.id as string;
  if (!veiculoId) {
    return res.status(400).json({ message: 'ID do veículo obrigatório' });
  }

  // Verifica que o veículo pertence ao user
  const veiculo = await prisma.veiculo.findFirst({
    where: {
      id: veiculoId,
      cliente: { userId: payload.userId },
    },
  });
  if (!veiculo) {
    return res.status(404).json({ message: 'Veículo não encontrado' });
  }

  try {
    // ─── POST: upload nova foto ───────────────────────────────────────
    if (req.method === 'POST') {
      const contentType = req.headers['content-type']?.toLowerCase() || '';
      if (!ALLOWED_TYPES.some((t) => contentType.includes(t.split('/')[1]))) {
        return res.status(400).json({
          message: 'Formato não suportado. Use JPEG, PNG, WebP ou HEIC.',
        });
      }

      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > MAX_BYTES) {
        return res.status(413).json({
          message: `Foto muito grande (máximo ${MAX_BYTES / 1024 / 1024}MB).`,
        });
      }

      // Lê o body como buffer
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk as Buffer);
        if (chunks.reduce((acc, c) => acc + c.length, 0) > MAX_BYTES) {
          return res.status(413).json({ message: 'Foto muito grande' });
        }
      }
      const buffer = Buffer.concat(chunks);

      // Apaga foto anterior se existir (evita órfãs no Blob)
      if (veiculo.fotoUrl) {
        try {
          await del(veiculo.fotoUrl);
        } catch (e) {
          console.warn('[foto] erro ao deletar foto anterior:', e);
        }
      }

      // Extensão a partir do content-type
      const ext = contentType.includes('png')
        ? 'png'
        : contentType.includes('webp')
        ? 'webp'
        : contentType.includes('heic')
        ? 'heic'
        : 'jpg';

      // Nome único: veiculoId-timestamp.ext
      const filename = `veiculos/${veiculoId}-${Date.now()}.${ext}`;

      const blob = await put(filename, buffer, {
        access: 'public',
        contentType,
        addRandomSuffix: false,
      });

      // Atualiza o veiculo com a nova URL
      const updated = await prisma.veiculo.update({
        where: { id: veiculoId },
        data: { fotoUrl: blob.url },
      });

      return res.status(200).json({
        message: 'Foto enviada com sucesso',
        fotoUrl: blob.url,
        veiculo: updated,
      });
    }

    // ─── DELETE: remove a foto atual ──────────────────────────────────
    if (req.method === 'DELETE') {
      if (veiculo.fotoUrl) {
        try {
          await del(veiculo.fotoUrl);
        } catch (e) {
          console.warn('[foto] erro ao deletar do Blob:', e);
        }
      }
      const updated = await prisma.veiculo.update({
        where: { id: veiculoId },
        data: { fotoUrl: null },
      });
      return res.status(200).json({ message: 'Foto removida', veiculo: updated });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('[foto] erro:', err);
    return res.status(500).json({ message: 'Erro ao processar foto' });
  }
}
