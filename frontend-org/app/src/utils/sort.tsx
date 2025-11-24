export function compareAmountObjects(a: any, b: any) {
  if (a.amount < b.amount) {
    return -1;
  }
  if (a.amount > b.amount) {
    return 1;
  }
  return 0;
}
