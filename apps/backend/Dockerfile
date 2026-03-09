FROM node:24-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY apps/backend ./apps/backend

RUN pnpm --filter backend build

EXPOSE 5000

USER node

WORKDIR /app/apps/backend
CMD ["node", "dist/index.js"]