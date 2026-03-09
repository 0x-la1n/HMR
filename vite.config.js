import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({ jsxRuntime: 'automatic' }),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        host: true,
        watch: {
            usePolling: true,
        },
        proxy: {
            '/api': {
                target: 'http://hmr-backend:8000',
                changeOrigin: true,
            },
        },
    },
})
