import React from 'react';
import { cn } from '../lib/utils';

export type VeiculoTipo = 'Sedan' | 'Hatch' | 'SUV' | 'Picape' | 'Esportivo' | 'Moto' | 'Outro';

interface CarSilhouetteProps {
  tipo?: VeiculoTipo;
  /** Hex color #RRGGBB. Default: slate. */
  cor?: string | null;
  className?: string;
  /** Texto alternativo. Default descreve tipo + cor. */
  alt?: string;
}

/**
 * Silhueta SVG estilizada por tipo de veículo, colorível.
 * Side-profile minimalista, similar a iconografia automotiva moderna.
 * A cor preenche a carroceria; janelas, rodas e detalhes ficam neutros pra contraste.
 */
const CarSilhouette: React.FC<CarSilhouetteProps> = ({
  tipo = 'Outro',
  cor,
  className,
  alt,
}) => {
  const fillColor = isValidHex(cor) ? (cor as string) : '#64748B'; // slate-500 default
  const isLight = isValidHex(cor) ? isColorLight(cor as string) : false;
  const strokeColor = isLight ? '#1E293B' : 'rgba(255,255,255,0.25)';
  const windowColor = isLight ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.35)';

  const ariaLabel = alt || `Silhueta de ${tipo.toLowerCase()}${cor ? ' cor ' + cor : ''}`;

  // Cada path foi simplificado pra cerca de uma linha; SVGs maiores tornariam tudo
  // muito grande pra inline. O viewBox é 240×120 pra todos — uniforme.
  return (
    <svg
      viewBox="0 0 240 120"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={ariaLabel}
    >
      {tipo === 'Sedan' && <Sedan fill={fillColor} stroke={strokeColor} windowFill={windowColor} />}
      {tipo === 'Hatch' && <Hatch fill={fillColor} stroke={strokeColor} windowFill={windowColor} />}
      {tipo === 'SUV' && <SUV fill={fillColor} stroke={strokeColor} windowFill={windowColor} />}
      {tipo === 'Picape' && <Picape fill={fillColor} stroke={strokeColor} windowFill={windowColor} />}
      {tipo === 'Esportivo' && (
        <Esportivo fill={fillColor} stroke={strokeColor} windowFill={windowColor} />
      )}
      {tipo === 'Moto' && <Moto fill={fillColor} stroke={strokeColor} />}
      {(tipo === 'Outro' || !tipo) && (
        <Sedan fill={fillColor} stroke={strokeColor} windowFill={windowColor} />
      )}
    </svg>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────

function isValidHex(c?: string | null): boolean {
  return !!c && /^#[0-9A-Fa-f]{6}$/.test(c);
}

/** WCAG-ish luminância. Cores claras = retorna true. */
function isColorLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // perceptual brightness (ITU-R BT.601)
  const lum = (r * 299 + g * 587 + b * 114) / 1000;
  return lum > 160;
}

// ─── Silhuetas ──────────────────────────────────────────────────────
// Todas em viewBox 240×120, alinhadas pelo chão (y≈100).
// Rodas são <circle> separadas pra ficarem sempre pretas.

interface BodyProps {
  fill: string;
  stroke: string;
  windowFill: string;
}

const Sedan: React.FC<BodyProps> = ({ fill, stroke, windowFill }) => (
  <g>
    {/* Carroceria principal */}
    <path
      d="M 20 95 L 30 75 Q 38 60 60 55 L 95 50 Q 115 40 145 42 L 185 50 Q 205 55 215 70 L 220 95 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Janelas (greenhouse) */}
    <path
      d="M 70 58 L 100 50 Q 117 45 142 47 L 170 52 L 178 70 L 65 70 Z"
      fill={windowFill}
      opacity="0.7"
    />
    {/* Divisão entre portas */}
    <line x1="118" y1="48" x2="118" y2="70" stroke={stroke} strokeWidth="1" opacity="0.4" />
    {/* Faróis */}
    <ellipse cx="212" cy="78" rx="6" ry="3" fill={windowFill} opacity="0.6" />
    {/* Sombra inferior */}
    <ellipse cx="120" cy="105" rx="100" ry="3" fill="rgba(0,0,0,0.15)" />
    {/* Rodas */}
    <circle cx="65" cy="98" r="13" fill="#1E293B" />
    <circle cx="65" cy="98" r="7" fill="#475569" />
    <circle cx="180" cy="98" r="13" fill="#1E293B" />
    <circle cx="180" cy="98" r="7" fill="#475569" />
  </g>
);

const Hatch: React.FC<BodyProps> = ({ fill, stroke, windowFill }) => (
  <g>
    {/* Carroceria — mais curto atrás */}
    <path
      d="M 25 95 L 35 75 Q 45 58 70 53 L 105 48 Q 130 42 160 48 Q 180 52 195 75 L 200 95 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Janelas — traseira vertical de hatch */}
    <path
      d="M 75 58 L 105 50 Q 128 45 155 50 L 178 65 L 178 70 L 70 70 Z"
      fill={windowFill}
      opacity="0.7"
    />
    <line x1="120" y1="46" x2="120" y2="70" stroke={stroke} strokeWidth="1" opacity="0.4" />
    <ellipse cx="194" cy="80" rx="5" ry="3" fill={windowFill} opacity="0.6" />
    <ellipse cx="120" cy="105" rx="92" ry="3" fill="rgba(0,0,0,0.15)" />
    <circle cx="70" cy="98" r="13" fill="#1E293B" />
    <circle cx="70" cy="98" r="7" fill="#475569" />
    <circle cx="165" cy="98" r="13" fill="#1E293B" />
    <circle cx="165" cy="98" r="7" fill="#475569" />
  </g>
);

const SUV: React.FC<BodyProps> = ({ fill, stroke, windowFill }) => (
  <g>
    {/* SUV — mais alto, perfil quadrado */}
    <path
      d="M 22 95 L 30 65 Q 35 45 60 42 L 105 38 Q 140 34 175 40 Q 200 44 212 60 L 218 95 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Janelas grandes — característica de SUV */}
    <path
      d="M 60 50 L 105 42 Q 138 38 170 44 L 192 60 L 60 60 Z"
      fill={windowFill}
      opacity="0.7"
    />
    {/* 2 divisões — 3 portas */}
    <line x1="100" y1="40" x2="100" y2="60" stroke={stroke} strokeWidth="1" opacity="0.4" />
    <line x1="140" y1="40" x2="140" y2="60" stroke={stroke} strokeWidth="1" opacity="0.4" />
    {/* Linha do teto */}
    <line x1="60" y1="60" x2="190" y2="60" stroke={stroke} strokeWidth="1" opacity="0.5" />
    <ellipse cx="212" cy="75" rx="6" ry="4" fill={windowFill} opacity="0.6" />
    <ellipse cx="120" cy="105" rx="100" ry="3" fill="rgba(0,0,0,0.15)" />
    <circle cx="65" cy="98" r="14" fill="#1E293B" />
    <circle cx="65" cy="98" r="8" fill="#475569" />
    <circle cx="180" cy="98" r="14" fill="#1E293B" />
    <circle cx="180" cy="98" r="8" fill="#475569" />
  </g>
);

const Picape: React.FC<BodyProps> = ({ fill, stroke, windowFill }) => (
  <g>
    {/* Picape — cabine + caçamba */}
    <path
      d="M 22 95 L 32 70 Q 40 55 65 52 L 110 50 L 115 65 L 215 65 L 220 95 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Janela cabine */}
    <path
      d="M 70 60 L 105 53 Q 110 53 113 65 L 70 65 Z"
      fill={windowFill}
      opacity="0.7"
    />
    {/* Linha caçamba */}
    <line x1="115" y1="65" x2="115" y2="95" stroke={stroke} strokeWidth="1.5" opacity="0.5" />
    <line x1="118" y1="68" x2="215" y2="68" stroke={stroke} strokeWidth="0.8" opacity="0.4" />
    {/* Vincos da caçamba */}
    <line x1="150" y1="68" x2="150" y2="92" stroke={stroke} strokeWidth="0.6" opacity="0.3" />
    <line x1="180" y1="68" x2="180" y2="92" stroke={stroke} strokeWidth="0.6" opacity="0.3" />
    <ellipse cx="212" cy="78" rx="5" ry="3" fill={windowFill} opacity="0.5" />
    <ellipse cx="120" cy="105" rx="100" ry="3" fill="rgba(0,0,0,0.15)" />
    <circle cx="60" cy="98" r="14" fill="#1E293B" />
    <circle cx="60" cy="98" r="8" fill="#475569" />
    <circle cx="190" cy="98" r="14" fill="#1E293B" />
    <circle cx="190" cy="98" r="8" fill="#475569" />
  </g>
);

const Esportivo: React.FC<BodyProps> = ({ fill, stroke, windowFill }) => (
  <g>
    {/* Esportivo — baixo, aerodinâmico */}
    <path
      d="M 18 95 L 28 80 Q 35 65 60 60 Q 100 55 140 58 Q 175 62 195 78 L 222 95 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Bolha baixa */}
    <path
      d="M 60 70 Q 90 60 130 62 Q 160 65 175 78 L 60 78 Z"
      fill={windowFill}
      opacity="0.65"
    />
    <line x1="118" y1="60" x2="118" y2="78" stroke={stroke} strokeWidth="0.8" opacity="0.3" />
    {/* Faróis afilados */}
    <ellipse cx="218" cy="85" rx="6" ry="2.5" fill={windowFill} opacity="0.7" />
    <ellipse cx="22" cy="88" rx="4" ry="1.5" fill={windowFill} opacity="0.5" />
    <ellipse cx="120" cy="105" rx="105" ry="3" fill="rgba(0,0,0,0.15)" />
    {/* Rodas maiores */}
    <circle cx="55" cy="98" r="15" fill="#1E293B" />
    <circle cx="55" cy="98" r="8" fill="#475569" />
    <circle cx="185" cy="98" r="15" fill="#1E293B" />
    <circle cx="185" cy="98" r="8" fill="#475569" />
  </g>
);

const Moto: React.FC<{ fill: string; stroke: string }> = ({ fill, stroke }) => (
  <g>
    {/* Frame e tanque */}
    <path
      d="M 80 75 L 100 60 Q 120 55 140 60 L 155 75 Q 160 85 145 88 L 105 88 Q 80 88 80 75 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Selim */}
    <path
      d="M 90 70 Q 100 64 120 64 L 140 68 L 145 72 L 95 72 Z"
      fill="#1E293B"
      opacity="0.7"
    />
    {/* Guidão */}
    <line x1="155" y1="60" x2="170" y2="50" stroke="#1E293B" strokeWidth="2" />
    <line x1="155" y1="60" x2="148" y2="65" stroke="#1E293B" strokeWidth="2" />
    {/* Garfo dianteiro */}
    <line x1="155" y1="60" x2="180" y2="98" stroke="#1E293B" strokeWidth="2.5" />
    {/* Garfo traseiro */}
    <line x1="80" y1="75" x2="55" y2="98" stroke="#1E293B" strokeWidth="2.5" />
    <ellipse cx="120" cy="105" rx="80" ry="2.5" fill="rgba(0,0,0,0.15)" />
    {/* Rodas */}
    <circle cx="55" cy="98" r="14" fill="#1E293B" />
    <circle cx="55" cy="98" r="6" fill="#475569" />
    <circle cx="180" cy="98" r="14" fill="#1E293B" />
    <circle cx="180" cy="98" r="6" fill="#475569" />
  </g>
);

export default CarSilhouette;
