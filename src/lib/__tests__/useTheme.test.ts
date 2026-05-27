import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

const STORAGE_KEY = 'oficina-theme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    // Default: SO retorna light
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: window.matchMedia,
    });
  });

  it('default theme é "system"', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
  });

  it('persiste theme no localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('dark'));

    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(result.current.theme).toBe('dark');
  });

  it('aplica .dark class no <html> quando theme=dark', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('dark'));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('remove .dark class quando theme=light', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('light'));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('resolvedTheme reflete preferência do SO quando theme=system', () => {
    // Simula SO em dark mode
    window.matchMedia = ((query: string) => ({
      matches: query.includes('dark'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('lê theme persistido do localStorage no mount', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('ignora valor inválido no localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
  });
});
