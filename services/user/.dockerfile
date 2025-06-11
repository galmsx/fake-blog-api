ARG PROJECT_NAME

FROM node:20.12.0-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat
RUN apk add g++ make py3-pip 

FROM alpine AS base

RUN npm install -g nx@20.4.6
RUN npm install pnpm@9.7.0 -g
RUN pnpm config set store-dir ~/.pnpm-store

FROM base AS builder
ARG PROJECT_NAME
WORKDIR /app
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY services/${PROJECT_NAME}/package.json ./services/${PROJECT_NAME}/
COPY packages ./packages
RUN pnpm install
COPY . .
RUN nx build ${PROJECT_NAME} --configuration=production
RUN cp -r ./services/${PROJECT_NAME}/dist ./services/${PROJECT_NAME}-pruned
RUN pnpm deploy --filter=./services/${PROJECT_NAME}-pruned ./deploy


FROM alpine AS runner
WORKDIR /app
COPY --from=builder /app/deploy ./builded
COPY --from=builder /app/packages/grpc-lib/src /app/packages/grpc-lib/src 

CMD ["sh", "-c", "npm run migrate:gen && npm run migrate:run && node builded/main.js"]