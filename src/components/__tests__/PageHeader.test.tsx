import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('renderiza count com plural correto', () => {
    render(<PageHeader count={5} />);
    expect(screen.getByText('5 registros')).toBeInTheDocument();
  });

  it('renderiza count com singular', () => {
    render(<PageHeader count={1} />);
    expect(screen.getByText('1 registro')).toBeInTheDocument();
  });

  it('renderiza zero corretamente', () => {
    render(<PageHeader count={0} />);
    expect(screen.getByText('0 registros')).toBeInTheDocument();
  });

  it('não renderiza count quando undefined', () => {
    const { container } = render(<PageHeader />);
    expect(container.textContent).not.toMatch(/registro/);
  });

  it('renderiza search input quando onSearchChange é fornecido', () => {
    const onSearchChange = vi.fn();
    render(<PageHeader onSearchChange={onSearchChange} searchPlaceholder="Buscar tudo..." />);

    const input = screen.getByPlaceholderText('Buscar tudo...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'search');
  });

  it('dispara onSearchChange ao digitar', () => {
    const onSearchChange = vi.fn();
    render(<PageHeader onSearchChange={onSearchChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'Joao' } });

    expect(onSearchChange).toHaveBeenCalledWith('Joao');
  });

  it('não renderiza search quando onSearchChange é undefined', () => {
    render(<PageHeader count={3} />);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('renderiza filters e actions slots', () => {
    render(
      <PageHeader
        filters={<span data-testid="filters">F</span>}
        actions={<span data-testid="actions">A</span>}
      />,
    );
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByTestId('actions')).toBeInTheDocument();
  });
});
