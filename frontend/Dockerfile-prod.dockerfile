FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY --from=build /app/build ./build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npx", "serve", "-s", "build", "-l", "3000"]
