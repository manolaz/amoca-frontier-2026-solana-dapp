import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        'process.env': {},
        global: 'globalThis',
    },
    plugins: [react()],
    optimizeDeps: {
        include: ['buffer', 'react-router-dom'],
    },
});
