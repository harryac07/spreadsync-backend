FROM node:10

WORKDIR /app

COPY ./package.json .
COPY ./wait-for-it.sh /wait-for-it.sh


RUN npm install

ADD . .

RUN npm install pm2 -g

RUN npm run build

RUN chmod +x /wait-for-it.sh

EXPOSE 3001

CMD npm run server