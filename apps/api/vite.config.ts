/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node';


export default defineConfig({
  plugins: [VitePluginNode({
    adapter: 'hono',
    
  })],
  server: {
    port: 3030
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage'
    },
    include: ['**/*.test.ts']
  }
}) 