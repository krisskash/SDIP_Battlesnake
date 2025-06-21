FROM node:20

ENV NODE_ENV=production

WORKDIR /app

COPY . .
RUN npm install

CMD [ "node", "index.js" ]
