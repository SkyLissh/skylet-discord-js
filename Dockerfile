FROM nikolaik/python-nodejs:python3.14-nodejs24-slim as python-node-base

RUN corepack enable

FROM python-node-base as builder

RUN apt update && apt upgrade -y && apt install --no-install-recommends -y \
  build-essential \
  ffmpeg

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

WORKDIR /prod

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile --prod

FROM node:24-slim as base

RUN corepack enable

COPY --from=builder /usr/bin/ffmpeg /usr/bin/ffmpeg

WORKDIR /app

FROM base as development

COPY --from=builder /app/node_modules ./node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .

CMD ["pnpm", "run", "dev"]

FROM base as production

COPY --from=builder /app/dist ./dist
COPY --from=builder /prod/node_modules ./node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN node dist/update-cmds.js

CMD ["node", "dist/index.js"]
