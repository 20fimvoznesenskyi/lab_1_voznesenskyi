# 1) Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL приходить як ARG (див. compose)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# 2) Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# базовий nginx уже слухає 80 порт
