import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  server: {
    port: 3334,
  },
  plugins: [dts({ tsConfigFilePath: path.relative(__dirname, './tsconfig.json'), exclude: ['test/**'] }), excludeOutDir('gallery')],
  build: {
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ImageCropper',
      fileName: (format) => `icropper.${format}.js`,
      formats: ['es', 'umd'],
    },
  },
});

function excludeOutDir(fileDir: string) {
  return {
    name: 'exclude-out-dir',
    resolveId(source) {
      return source === 'virtual-module' ? source : null;
    },
    renderStart(outputOptions, inputOptions) {
      const outDir = outputOptions.dir;
      const dir = path.resolve(outDir, fileDir);
      fs.rmdir(dir, { recursive: true }, () => console.log(`Deleted ${dir}`));
    },
  };
}
