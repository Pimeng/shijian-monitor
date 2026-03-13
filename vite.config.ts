import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import ttf2woff2 from "ttf2woff2"
import fs from "fs"

function ttfToWoff2Plugin(): Plugin {
  return {
    name: 'vite-plugin-ttf2woff2',
    enforce: 'post',
    writeBundle() {
      const fontsDir = './public/assets/fonts'
      
      if (!fs.existsSync(fontsDir)) return

      function processDir(dir: string) {
        fs.readdirSync(dir).forEach(file => {
          const fullPath = path.join(dir, file)
          const stat = fs.statSync(fullPath)

          if (stat.isDirectory()) {
            processDir(fullPath) // 递归处理子目录
          } else if (file.endsWith('.ttf')) {
            const woff2Path = fullPath.replace('.ttf', '.woff2')
            
            try {
              const ttfBuffer = fs.readFileSync(fullPath)
              const woff2Buffer = ttf2woff2(ttfBuffer)
              fs.writeFileSync(woff2Path, woff2Buffer)
              console.log(`✓ Converted: ${file} → ${path.basename(woff2Path)}`)
            } catch (err) {
              console.error(`✗ Failed: ${file}`, err)
            }
          }
        })
      }

      processDir(fontsDir)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(), ttfToWoff2Plugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
