FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:latest
RUN apk add --no-cache coreutils

WORKDIR /app
COPY --from=build-stage /app/dist /app/

CMD ["sh", "-c", "echo 'Sync complete' && tail -f /dev/null"]