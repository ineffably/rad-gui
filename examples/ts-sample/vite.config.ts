import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: false,
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        radgui: './rad-gui-example.html',
        home: './examples-home.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      'rad-gui': '../../src/index.ts'
    }
  }
}); 