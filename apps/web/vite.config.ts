import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Resolve symlinks so the content/ symlink in public/ works correctly
  resolve: {
    preserveSymlinks: true,
  },
});
