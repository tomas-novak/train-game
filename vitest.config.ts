import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Pure functions only — no DOM, so no jsdom and no extra dependency for it.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
