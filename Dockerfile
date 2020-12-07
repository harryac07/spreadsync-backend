FROM node:10

WORKDIR /app

COPY ./package.json .

RUN npm install

ADD . .

RUN npm install pm2 -g

RUN npm run build

EXPOSE 3001

CMD npm run server