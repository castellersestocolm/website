FROM node:18-alpine

WORKDIR /frontend-org

COPY . frontend-org

WORKDIR /frontend-org/frontend-org/app

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
