FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npx esbuild orchestrator/src/main.ts \
    --bundle --platform=node --format=esm \
    --outfile=dist/main.mjs \
    --packages=external \
    --alias:@stock-advisor/shared=./shared/src/index.ts

FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY orchestrator/package.json ./orchestrator/
COPY shared/package.json ./shared/
RUN npm ci --omit=dev
COPY --from=builder /app/dist/main.mjs ./dist/
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/main.mjs"]
