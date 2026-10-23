import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Las pruebas e2e usan OTRA base de datos, que se borra y se vuelve a llenar
    // con los datos de ejemplo cada vez. Así nunca tocan tus datos reales.
    env: {
      DB_NOMBRE: 'nexo_university_test',
      DB_REINICIAR: 'true',
    },
    hookTimeout: 30000,
  },
});
