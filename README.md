# ComuniCAT

## Local setup

### Requirements

- Docker
- Docker compose

### Setup

1. Build the `backend` image.

```shell
docker-compose build backend frontend-towers frontend-org
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

## Remote setup

### Postfix configuration
```bash
smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination
myhostname = comunicat
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
mydestination = localhost.$mydomain, localhost, $myhostname
relayhost = smtp-relay.gmail.com:587
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128 172.24.0.0/16
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = 172.17.0.1
inet_protocols = ipv4
myorigin = /etc/mailname
masquerade_domains = castellersestocolm.se lesquatrebarres.org
```
