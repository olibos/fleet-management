FROM node:22.9.0-alpine AS dependencies

WORKDIR /src

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/

RUN yarn install --immutable

FROM node:22.9.0-alpine AS builder

WORKDIR /src

COPY package.json yarn.lock .yarnrc.yml astro.config.ts tsconfig.json ./
COPY ./public/ ./public/
COPY ./src/ ./src/
COPY --from=dependencies /src/.yarn ./.yarn/
COPY --from=dependencies /src/node_modules ./node_modules/

RUN yarn build

FROM node:22.9.0-alpine AS runner

RUN addgroup -S app \
    && adduser -S app -G app

USER app

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml Roboto*.ttf ./
COPY --from=builder /src/node_modules ./node_modules/
COPY --from=builder /src/dist/server ./server/
COPY --from=builder /src/dist/client ./client/

ENV HOST=0.0.0.0
CMD ["node", "./server/entry.mjs"]
