FROM node:10

WORKDIR /app

COPY ./package.json .
COPY ./wait-for-it.sh /wait-for-it.sh
COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /wait-for-it.sh
RUN chmod +x /docker-entrypoint.sh

RUN npm install

ADD . .

RUN npm install nodemon -g

RUN npm run build

EXPOSE 3001

ENTRYPOINT ["/docker-entrypoint.sh"]
