import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' — чтобы сайт работал в подпапке USERNAME.github.io/lash-booking/
export default defineConfig({ base: './', plugins: [react(), tailwindcss()] })
