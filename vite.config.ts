import { defineConfig } from 'vite';

const path = require('path');

export default defineConfig({
  server: {
    port: 3334,
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'FbImageCropper',
      fileName: (format) => `fabric-icropper.js`,
      formats: ['es'],
    },
  },
});
