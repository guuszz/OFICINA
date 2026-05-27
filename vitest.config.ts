import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.vercel/**',
        'api/**', // funções serverless — testaria com supertest se valesse a pena
        'prisma/**',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        'src/main.tsx', // bootstrap
        'src/vite-env.d.ts',
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        // Cobertura focada — lib/ + componentes utilitários (todos a 100%).
        // CRUDs grandes (OrdensList, VeiculosList, ClientesList, Stats) ainda
        // não têm testes — esses contam linhas mas reduzem o % global.
        // Vamos subir esses números à medida que adicionamos testes E2E
        // com Playwright pros fluxos completos. Por agora travamos no chão:
        lines: 15,
        functions: 40,
        branches: 60,
        statements: 15,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
