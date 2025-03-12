FROM php:7.4-fpm

# docker-php-ext-install mysqli

RUN apt-get update && apt-get install -y default-mysql-client
RUN docker-php-ext-install mysqli
RUN docker-php-ext-enable mysqli

# Copy the php config file
COPY ./php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY ./php.ini /usr/local/etc/php/conf.d

# Copy the application code
COPY . /pinyator

VOLUME ["/pinyator"]