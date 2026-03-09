FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/orchestrator/src/main.js"]
