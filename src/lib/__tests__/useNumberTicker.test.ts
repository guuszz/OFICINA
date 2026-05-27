import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNumberTicker } from '../useNumberTicker';

describe('useNumberTicker', () => {
  let rafCallbacks: Array<(t: number) => void> = [];
  let frameId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    frameId = 0;
    // Mock requestAnimationFrame pra controlar o tempo determinístico
    vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
      rafCallbacks.push(cb);
      return ++frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.stubGlobal('performance', { now: () => 0 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  /** Aciona o RAF chain simulando o tempo passando até `targetMs`. */
  function tickTo(targetMs: number) {
    let elapsed = 0;
    const step = 16; // ~60fps
    while (rafCallbacks.length > 0 && elapsed <= targetMs + 100) {
      const cb = rafCallbacks.shift();
      elapsed += step;
      vi.stubGlobal('performance', { now: () => elapsed });
      if (cb) cb(elapsed);
    }
  }

  it('inicia em 0 e converge pro valor final', async () => {
    const { result } = renderHook(() => useNumberTicker(100, 200));

    expect(result.current).toBe(0);

    act(() => tickTo(300));

    await waitFor(() => {
      expect(result.current).toBe(100);
    });
  });

  it('retorna o valor imediatamente quando prefers-reduced-motion ativo', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        matches: true, // prefers-reduced-motion: reduce
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });

    const { result } = renderHook(() => useNumberTicker(50, 600));
    expect(result.current).toBe(50);
  });

  it('lida com value=0 sem animar', () => {
    const { result } = renderHook(() => useNumberTicker(0, 600));
    expect(result.current).toBe(0);
  });
});
