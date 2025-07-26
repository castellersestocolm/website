export function amountToString(amount: number, digits: number = 0) {
  return amount.toLocaleString("sv-SE", { minimumFractionDigits: digits });
}
