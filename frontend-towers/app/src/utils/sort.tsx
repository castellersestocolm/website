export function compareTowerPlaceWithPositionObjects(a: any, b: any) {
  if (a.placement.x < b.placement.x && a.placement.y < b.placement.y) {
    return 1;
  }
  if (a.placement.x > b.placement.x && a.placement.y > b.placement.y) {
    return -1;
  }
  if (a.placement.x < b.placement.x && a.placement.y > b.placement.y) {
    return -1;
  }
  if (a.placement.x > b.placement.x && a.placement.y < b.placement.y) {
    return 1;
  }
  return 0;
}

export function compareTowerPlaceFamilyObjects(a: any, b: any) {
  const aText =
    a[0].user && a[0].user.towers && a[0].user.towers.alias
      ? a[0].user.towers.alias.toUpperCase()
      : a[0].extra.text.toUpperCase();
  const bText =
    b[0].user && b[0].user.towers && b[0].user.towers.alias
      ? b[0].user.towers.alias.toUpperCase()
      : b[0].extra.text.toUpperCase();

  return aText >= bText;
}

export function compareTowerPlaceCloseObjects(a: any, c: any) {
  // const aDistance = Math.sqrt(Math.pow(c.placement.x - a.placement.x, 2) + Math.pow(c.placement.y - a.placement.y, 2));
  // const bDistance = Math.sqrt(Math.pow(c.placement.x - b.placement.x, 2) + Math.pow(c.placement.y - b.placement.y, 2));
  // if ((a.extra.text === "BAIX 4" || a.extra.text === "BAIX 5") && (b.extra.text === "BAIX 4" || b.extra.text === "BAIX 5")){
  //   console.log(c.user, a.extra.text, aDistance, b.extra.text, bDistance);
  // }

  return Math.sqrt(
    Math.pow(c.placement.x - a.placement.x, 2) +
      Math.pow(c.placement.y - a.placement.y, 2),
  );
}
