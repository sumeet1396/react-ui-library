import { defineConfig, loadEnv } from 'vite'
import { extname, relative, resolve } from 'path'
import {libInjectCss} from 'vite-plugin-lib-inject-css';
import {fileURLToPath} from 'node:url';
import {glob} from 'glob';
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts';
import {visualizer} from 'rollup-plugin-visualizer';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({mode}): any => {
  const env = loadEnv(mode, process.cwd(), '');
  const status = env.STATUS ? JSON.parse(env.STATUS) : true;
  
  return {
    plugins: [react(), libInjectCss(), dts({include: ['lib']}), peerDepsExternal(), viteCompression(), visualizer({
      template: 'treemap',
      open: status,
      gzipSize: true,
      brotliSize: true,
      filename: 'analyse.html'
    })],
    build: {
      copyPublicDir: false,
      lib: {
        entry: resolve(__dirname, 'lib/main.ts'),
        formats: ['es']
      },
      rollupOptions: {
        external: ['react', 'react/jsx-runtime'],
        input: Object.fromEntries(
          glob.sync('lib/**/*.{js,jsx,ts,tsx}').map(file => [
            relative('lib',file.slice(0,file.length - extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url))
          ])
        ),
        output: {
          assetFileNames: 'assets/[name][extname]',
          entryFileNames: '[name].js',
        }
      }
    }
  }
})
