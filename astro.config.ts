import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: node({
    mode: "standalone"
  }),
  site: process.env.SITE,
  vite:{
    build:{
      assetsInlineLimit(filePath, _content) {
        if (filePath.endsWith('.webmanifest')) return false;
      },
    },
  }
});