// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(), react()],
//   server: {
//     allowedHosts: true, // allow all hosts
//     cors: true,
//     host: true,   // allow external access
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5020',
//         changeOrigin: true,
//       }
//     }
//   },
// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true,              // allow external access (needed for ngrok)
    port: 5173,              // explicit port (recommended for ngrok)
    cors: true,
    allowedHosts: true,

    headers: {
      // helps avoid some ngrok iframe / browser issues
      'Access-Control-Allow-Origin': '*',
    },

    proxy: {
      '/api': {
        target: 'http://localhost:5020',
        //target:'https://untagged-deplored-sadness.ngrok-free.dev',
        changeOrigin: true,

        // 🔑 IMPORTANT: bypass ngrok browser warning
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },

        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
        }
      }
    }
  }
})