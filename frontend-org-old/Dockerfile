FROM node:23-alpine

WORKDIR /frontend-org

COPY app .

RUN npm install

EXPOSE 3200

CMD ["npm", "start"]