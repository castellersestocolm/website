FROM nginx:1.17.8-alpine

# Copy the public directory
COPY ./src/ /pinyator/pinyator/

# Copy the nginx config file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
