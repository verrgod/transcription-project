# Stage 1: build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./

RUN apk add --no-cache bash git python3 make g++
RUN npm install

COPY . . 

RUN npm run build

# Stage 2: serve
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
