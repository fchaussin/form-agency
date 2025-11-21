import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    return {
        server: {
            allowedHosts: [env.VITE_PROJECT_HOST],
            proxy: {
                '/api': {
                    target: env.VITE_CONTAINER_BASEURL,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        plugins: [
            react(),
            tailwindcss(),
            {
                name: 'ddev-url-display',
                configureServer(server) {
                    server.httpServer?.on('listening', () => {
                        console.log('\x1b[32m%s\x1b[0m', `Frontend DDEV Project URL: ${process.env.DDEV_PRIMARY_URL}:9999`)
                    })
                },
            },
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
    }
})
