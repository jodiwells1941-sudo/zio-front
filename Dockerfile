# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
RUN pnpm build

# Run stage: full app for next start
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=builder /app .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "start"]