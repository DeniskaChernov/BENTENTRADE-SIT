
  import { defineConfig } from 'vite';
  import type { Plugin } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import path from 'path';

  /**
   * Vite по умолчанию вставляет entry script раньше link на CSS.
   * Тогда модуль React может выполниться до применения основного бандла стилей — FOUC («голый» интерфейс).
   * Ставим все stylesheet до script type="module".
   */
  function cssBeforeModuleScripts(): Plugin {
    return {
      name: 'css-before-module-scripts',
      enforce: 'post',
      transformIndexHtml(html) {
        const re =
          /(<script[^>]*type="module"[^>]*>\s*<\/script>)\s*(<link[^>]*rel="stylesheet"[^>]*\/?>)/gi;
        const out = html.replace(re, '$2\n      $1');
        return out === html ? html : out;
      },
    };
  }

  export default defineConfig({
    publicDir: 'src/public',
    plugins: [react(), tailwindcss(), cssBeforeModuleScripts()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-intersection-observer@9.13.1': 'react-intersection-observer',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });
