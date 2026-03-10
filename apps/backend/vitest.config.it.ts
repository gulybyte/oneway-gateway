import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
    environment: 'node',
    globals: true,
    include: ['src/**/*.it-spec.ts'],
    globalSetup: 'test/global-setup.ts',
    setupFiles: 'test/setup.ts',
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
      reportsDirectory: 'coverage/it',
      reporter: ['text', 'html', 'json'],
    },
    testTimeout: 15000,
    teardownTimeout: 2000,
  },
})
