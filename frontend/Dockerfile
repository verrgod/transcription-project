# Stage 1: build
FROM node:18-alpine AS build
WORKDIR /app
COPY audio_uploader/ ./

RUN npm install
RUN npm run build

# Stage 2: serve
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
