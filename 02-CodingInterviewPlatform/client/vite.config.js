import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            },
            '/ws': {
                target: 'ws://localhost:3000',
                ws: true
            }
        }
    },
    resolve: {
        alias: {
            // Prevent Vite from trying to resolve Node.js built-in modules
            'node-fetch': '/src/utils/stub.js',
            'fs': '/src/utils/stub.js',
            'path': '/src/utils/stub.js',
            'url': '/src/utils/stub.js',
            'vm': '/src/utils/stub.js',
            'crypto': '/src/utils/stub.js',
            'ws': '/src/utils/stub.js',
            'child_process': '/src/utils/stub.js',
            'fs/promises': '/src/utils/stub.js'
        }
    },
    optimizeDeps: {
        exclude: ['pyodide']
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
});
