from typing import Optional

from django.contrib.auth.base_user import BaseUserManager
from django.db import IntegrityError


class UserManager(BaseUserManager):
    def create_user(
        self,
        email: str,
        firstname: Optional[str] = None,
        lastname: Optional[str] = None,
        password: Optional[str] = None,
        is_staff: bool = False,
        is_superuser: bool = False,
    ):
        if not firstname or not lastname:
            firstname = email.split("@")[0].capitalize()
            split_char = None
            if "." in firstname:
                split_char = "."
            elif "_" in firstname:
                split_char = "_"
            elif "-" in firstname:
                split_char = "-"
            if split_char:
                firstname = firstname.split(split_char)[0]
                lastname = "".join(firstname.split(split_char)[1:])

        try:
            user = self.model(
                email=email.lower(),
                firstname=firstname,
                lastname=lastname,
                is_staff=is_staff,
                is_superuser=is_superuser,
            )

            user.set_password(password)
            user.save(using=self._db)
        except IntegrityError:
            user = self.model.objects.filter(email=email.lower()).first()

        return user

    def create_superuser(
        self, email: str, firstname: str, lastname: str, password: str
    ):
        user = self.create_user(
            email=email,
            firstname=firstname,
            lastname=lastname,
            password=password,
            is_staff=True,
            is_superuser=True,
        )
        user.save(using=self._db)
        return user
