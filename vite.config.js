import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [sveltekit()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem'))
    },
    port: 5000,
    hmr: {
      protocol: 'wss',
    },
    http2: false,
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
    }
  }
});
