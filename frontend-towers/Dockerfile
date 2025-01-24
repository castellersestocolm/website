FROM node:18-alpine

WORKDIR /frontend-towers

COPY . frontend-towers

WORKDIR /frontend-towers/frontend-towers/app

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
