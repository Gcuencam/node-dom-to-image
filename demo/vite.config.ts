import { defineConfig } from 'vite'

// The demo imports the library straight from `../src` so edits to the library
// are reflected live. `fs.allow` must therefore include the project root.
export default defineConfig({
  root: 'demo',
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
