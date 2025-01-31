FROM node:20.16.0-alpine

WORKDIR /app

RUN apk add --no-cache make gcc g++ python3

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]