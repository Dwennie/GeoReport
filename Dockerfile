
FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini" \
    && echo "memory_limit = 512M\n\
max_execution_time = 300\n\
upload_max_filesize = 100M\n\
post_max_size = 100M\n\
max_input_time = 300\n\
default_socket_timeout = 300\n" > "$PHP_INI_DIR/conf.d/georeport.ini" \
    && echo "[www]\n\
pm.max_children = 20\n\
pm.start_servers = 4\n\
pm.min_spare_servers = 2\n\
pm.max_spare_servers = 6\n\
pm.max_requests = 500\n\
request_terminate_timeout = 300s\n\
catch_workers_output = yes\n" > /usr/local/etc/php-fpm.d/zz-docker-georeport.conf

EXPOSE 9000

CMD ["php-fpm"]
