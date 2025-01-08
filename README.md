# ComuniCAT

## Local setup

### Requirements

- Docker
- Docker compose

### Setup

1. Build the `backend` image.

```shell
docker-compose build backend frontend-towers
```

2. Create the containers.

```shell
docker-compose up -d
```

3. Migrate the database.

```shell
docker exec -it comunicat_backend_1 python manage.py migrate
```

4. You can make a superuser so you can access the admin.

```shell
docker exec -it comunicat_backend_1 python manage.py createsuperuser
```

5. After development, to turn down the containers.

```shell
docker-compose down
```
