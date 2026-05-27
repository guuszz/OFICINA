import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renderiza o texto do status', () => {
    render(<StatusBadge status="Aberta" />);
    expect(screen.getByText('Aberta')).toBeInTheDocument();
  });

  it('aplica estilo de status conhecido (amber para Aberta)', () => {
    const { container } = render(<StatusBadge status="Aberta" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/amber/);
  });

  it('aplica estilo accent para Em Andamento', () => {
    const { container } = render(<StatusBadge status="Em Andamento" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/accent/);
  });

  it('aplica estilo primary para Concluída', () => {
    const { container } = render(<StatusBadge status="Concluída" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/primary/);
  });

  it('cai pra estilo muted (cancelada) para status desconhecido', () => {
    const { container } = render(<StatusBadge status="XPTO" />);
    const badge = container.firstChild as HTMLElement;
    // Cancelada usa bg-muted
    expect(badge.className).toMatch(/muted/);
  });

  it('renderiza variante dot quando dot=true', () => {
    const { container } = render(<StatusBadge status="Aberta" dot />);
    // Variante dot não tem o bg-* fill; tem só um dot colorido + texto
    expect(container.querySelector('span[aria-hidden="true"]')).toBeTruthy();
    expect(screen.getByText('Aberta')).toBeInTheDocument();
  });

  it('aceita className adicional', () => {
    const { container } = render(<StatusBadge status="Aberta" className="extra-class" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/extra-class/);
  });
});
