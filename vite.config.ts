import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Cast process to any to avoid TS error about cwd missing on type Process in some environments
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This maps the Netlify 'API_KEY' variable to 'process.env.API_KEY'
      // allowing your existing code to work without modification.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});