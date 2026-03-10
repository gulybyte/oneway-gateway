import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://user:pass@host:port/db',
    },
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
      reportsDirectory: 'coverage/unit',
      reporter: ['text', 'html', 'json'],
    },
    testTimeout: 5000,
  },
})
