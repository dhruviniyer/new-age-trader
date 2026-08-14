import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  preview: {
    allowedHosts: ['new-age-trader-production.up.railway.app']
  }
});
