from djmoney.money import Money


class EventRegistrationsStats:
    count_total: int
    count_can_manage: int
    count_cannot_manage: int

    def __init__(
        self, count_total: int, count_can_manage: int, count_cannot_manage: int
    ):
        self.count_total = count_total
        self.count_can_manage = count_can_manage
        self.count_cannot_manage = count_cannot_manage


class EventEconomyStats:
    amount_earned_total: Money
    amount_spent_total: Money

    def __init__(self, amount_earned_total: Money, amount_spent_total: Money):
        self.amount_earned_total = amount_earned_total
        self.amount_spent_total = amount_spent_total


class EventStats:
    registrations: EventRegistrationsStats
    economy: EventEconomyStats

    def __init__(
        self, registrations: EventRegistrationsStats, economy: EventEconomyStats
    ):
        self.registrations = registrations
        self.economy = economy
