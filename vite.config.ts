import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { handleTinyFishProxy } from './server/tinyfishProxy.ts'

function tinyfishProxyPlugin(): Plugin {
  return {
    name: 'tinyfish-proxy',
    configureServer(server) {
      server.middlewares.use(handleTinyFishProxy);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleTinyFishProxy);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tinyfishProxyPlugin()],
})
