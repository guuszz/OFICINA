import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn (className merger)', () => {
  it('combina classes simples', () => {
    expect(cn('px-2', 'py-4')).toBe('px-2 py-4');
  });

  it('mescla conflitos do Tailwind preservando a última', () => {
    // tailwind-merge resolve conflitos: a última utility ganha
    expect(cn('px-2 px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('ignora valores falsy', () => {
    expect(cn('base', null, undefined, false, '')).toBe('base');
  });

  it('aceita objetos condicionais (clsx pattern)', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('aceita arrays aninhados', () => {
    expect(cn(['a', 'b'], ['c'])).toBe('a b c');
  });

  it('retorna string vazia quando nada é passado', () => {
    expect(cn()).toBe('');
  });
});
