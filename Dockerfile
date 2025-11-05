FROM nikolaik/python-nodejs:python3.14-nodejs24-slim AS python-node-base

RUN corepack enable

FROM python-node-base AS builder

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

FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable

RUN apt update && apt install --no-install-recommends -y \
  ffmpeg

WORKDIR /app

FROM base AS development

COPY --from=builder /app/node_modules ./node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .

FROM base AS production

COPY --from=builder /app/dist ./dist
COPY --from=builder /prod/node_modules ./node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

CMD [ "pnpm", "start" ]
