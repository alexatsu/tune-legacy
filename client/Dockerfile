FROM node:18-alpine

RUN apk add --no-cache openssl
WORKDIR /app

COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
RUN npm install --legacy-peer-deps


COPY ./prisma ./prisma
COPY ./migrate.sh ./migrate.sh


ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "dev"]
# CMD ["sh","migrate.sh"] for manual migrations