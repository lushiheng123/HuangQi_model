import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 添加 React 插件
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/HuangQi_model/',
  plugins: [
    react(), // 添加这一行
    tailwindcss(),
  ],
})