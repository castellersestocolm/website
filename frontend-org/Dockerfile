FROM node:18-alpine

WORKDIR /frontend-org

COPY . frontend-org

WORKDIR /frontend-org/frontend-org/app

RUN npm install

EXPOSE 3200

CMD ["npm", "start", "--port", "3200"]
