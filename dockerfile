FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:latest
WORKDIR /var/www/frontend

COPY --from=build-stage /app/dist .

CMD ["sh", "-c", "echo 'Files served on /var/www/frontend' && tail -f /dev/null"]