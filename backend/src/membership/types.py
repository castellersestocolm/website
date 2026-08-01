import datetime

from djmoney.money import Money

from comunicat.enums import Module


class MembershipRenewModule:
    module: Module
    amount: Money

    def __init__(self, module: Module, amount: Money):
        self.module = module
        self.amount = amount


class MembershipRenewOption:
    modules: list[MembershipRenewModule]
    amount: Money
    date_to: datetime.date

    def __init__(
        self,
        modules: list[MembershipRenewModule],
        amount: Money,
        date_to: datetime.date,
    ):
        self.modules = modules
        self.amount = amount
        self.date_to = date_to
