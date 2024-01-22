FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

ARG BUILD_DATE
RUN npm install --no-cache --build-from-source

ENV NODE_ENV docker

COPY . .

CMD ["npm", "run", "start"]