import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CarSilhouette from '../CarSilhouette';

describe('CarSilhouette', () => {
  it('renderiza um SVG com role=img', () => {
    const { container } = render(<CarSilhouette tipo="Sedan" cor="#FF0000" />);
    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeTruthy();
  });

  it('aceita cor hex válida e aplica no fill', () => {
    const { container } = render(<CarSilhouette tipo="Sedan" cor="#3366CC" />);
    const path = container.querySelector('path[fill]');
    expect(path?.getAttribute('fill')).toBe('#3366CC');
  });

  it('usa cor default (slate) quando cor é null ou inválida', () => {
    const { container: c1 } = render(<CarSilhouette tipo="Sedan" cor={null} />);
    const { container: c2 } = render(<CarSilhouette tipo="Sedan" cor="not-a-color" />);

    const fill1 = c1.querySelector('path[fill]')?.getAttribute('fill');
    const fill2 = c2.querySelector('path[fill]')?.getAttribute('fill');

    // Slate default = #64748B
    expect(fill1).toBe('#64748B');
    expect(fill2).toBe('#64748B');
  });

  it('aceita todos os tipos válidos sem erro', () => {
    const tipos = ['Sedan', 'Hatch', 'SUV', 'Picape', 'Esportivo', 'Moto', 'Outro'] as const;
    tipos.forEach((tipo) => {
      const { container, unmount } = render(<CarSilhouette tipo={tipo} cor="#FFFFFF" />);
      expect(container.querySelector('svg')).toBeTruthy();
      unmount();
    });
  });

  it('aplica aria-label customizado quando alt é passado', () => {
    const { container } = render(
      <CarSilhouette tipo="Sedan" cor="#FF0000" alt="Civic vermelho 2020" />,
    );
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe(
      'Civic vermelho 2020',
    );
  });

  it('aria-label default inclui tipo e cor', () => {
    const { container } = render(<CarSilhouette tipo="Hatch" cor="#FFFFFF" />);
    const label = container.querySelector('svg')?.getAttribute('aria-label');
    expect(label).toMatch(/hatch/i);
    expect(label).toMatch(/#FFFFFF/);
  });

  it('renderiza rodas (circles) pros tipos motorizados', () => {
    const { container } = render(<CarSilhouette tipo="Sedan" cor="#FF0000" />);
    const circles = container.querySelectorAll('circle');
    // Sedan tem 4 circles (2 rodas externas + 2 internas)
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });
});
