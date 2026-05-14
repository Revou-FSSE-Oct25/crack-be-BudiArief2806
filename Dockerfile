FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG DATABASE_URL

COPY . .
RUN DATABASE_URL=$DATABASE_URL npm run prisma:generate
RUN npm run build

EXPOSE 10000

CMD ["npm", "run", "start:prod"]