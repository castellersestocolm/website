FROM node:23-alpine

WORKDIR /frontend-towers

COPY app .

RUN npm install --force

EXPOSE 3200

CMD ["npm", "start"]