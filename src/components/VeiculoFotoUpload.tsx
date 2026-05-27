import React, { useRef, useState } from 'react';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface VeiculoFotoUploadProps {
  veiculoId: string;
  fotoAtual?: string | null;
  onUploaded: (novaUrl: string | null) => void;
  /** Variante compacta — só botão circular pra usar em cima da silhueta. */
  compact?: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic';

const VeiculoFotoUpload: React.FC<VeiculoFotoUploadProps> = ({
  veiculoId,
  fotoAtual,
  onUploaded,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (file.size > MAX_BYTES) {
      toast.error('Foto muito grande', {
        description: `Máximo ${MAX_BYTES / 1024 / 1024}MB. Tente reduzir antes.`,
      });
      return;
    }
    if (!ACCEPT.split(',').some((t) => file.type === t)) {
      toast.error('Formato não suportado', {
        description: 'Use JPEG, PNG, WebP ou HEIC.',
      });
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`/api/veiculos/${veiculoId}/foto`, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Foto enviada!');
        onUploaded(data.fotoUrl);
      } else {
        toast.error(data.message || 'Erro ao enviar foto');
      }
    } catch {
      toast.error('Erro de conexão durante upload');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!fotoAtual) return;
    if (!confirm('Remover a foto do veículo?')) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/veiculos/${veiculoId}/foto`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Foto removida');
        onUploaded(null);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Erro ao remover');
      }
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setDeleting(false);
    }
  };

  if (compact) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-fg shadow-md backdrop-blur transition-all duration-150 hover:bg-card hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          aria-label={fotoAtual ? 'Trocar foto' : 'Adicionar foto'}
          title={fotoAtual ? 'Trocar foto' : 'Adicionar foto'}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || deleting}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>{fotoAtual ? 'Trocar foto' : 'Adicionar foto'}</span>
          </>
        )}
      </Button>
      {fotoAtual && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={uploading || deleting}
          aria-label="Remover foto"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
          )}
        </Button>
      )}
    </div>
  );
};

export default VeiculoFotoUpload;
