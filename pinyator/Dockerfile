FROM nginx:1.31.5-alpine

# Copy the public directory
COPY ./src/ /pinyator/pinyator/

# Copy the nginx config file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
