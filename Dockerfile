FROM node:22-alpine as dependencies

WORKDIR /src

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/

RUN yarn install --immutable

FROM node:22-alpine as builder

WORKDIR /src

COPY package.json yarn.lock .yarnrc.yml astro.config.ts tsconfig.json ./
COPY ./src/ ./src/
COPY --from=dependencies /src/.yarn ./.yarn/
COPY --from=dependencies /src/node_modules ./node_modules/

RUN yarn build

FROM node:22-alpine as runner

RUN addgroup -S app \
    && adduser -S app -G app

USER app

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY --from=builder /src/node_modules ./node_modules/
COPY --from=builder /src/dist/server ./server/
COPY --from=builder /src/dist/client ./client/

CMD ["node", "./server/entry.mjs"]
