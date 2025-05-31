# Stage 1: build
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN apk add --no-cache bash git python3 make g++
RUN npm install

COPY . .

CMD ["npm", "start"]

# Stage 2: serve
# FROM nginx:alpine

# COPY --from=build /app/build /usr/share/nginx/html

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
