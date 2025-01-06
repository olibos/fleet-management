import { defineConfig, envField } from 'astro/config';
import react from "@astrojs/react";

import node from "@astrojs/node";
import { configurationWrapper } from './src/integration/configuration';

// https://astro.build/config
export default defineConfig({
  integrations: [configurationWrapper(), react()],
  output: 'server',
  env:{
    schema:{
      MSAL__APPLICATION_ID: envField.string({ context: "server", access: "secret" }),
      MSAL__APPLICATION_TENANT_ID: envField.string({ context: "server", access: "secret" }),
      MSAL__APPLICATION_SECRET: envField.string({ context: "server", access: "secret" }),
      MSAL__REQUIRED_GROUP: envField.string({ context: "server", access: "secret", optional: true }),
      SITE: envField.string({ context: "server", access: "secret" }),
      JWT__SECRET: envField.string({ context: "server", access:"secret" }),
      JWT__ALGORITHM: envField.enum({ context: "server", access:"secret", default: "HS256", values:['HS256', 'HS384', 'HS512'] }),
      JWT__EXPIRES: envField.number({ context: "server", access:"secret", default: 30 * 60 }),
      JWT__COOKIE_NAME: envField.string({ context: "server", access:"secret", default: ".auth" }),
      WALLBOX__USERNAME: envField.string({ context: "server", access: "secret" }),
      WALLBOX__PASSWORD: envField.string({ context: "server", access: "secret" }),
      DB__CONNECTION_STRING: envField.string({ context: "server", access: "secret", optional: true }),
      DB__SERVER: envField.string({ context: "server", access: "secret", optional: true }),
      DB__NAME: envField.string({ context: "server", access: "secret", optional: true }),
    }
  },
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