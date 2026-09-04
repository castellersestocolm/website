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

export function compareEventSignup(a: any, b: any) {
  if (a.is_open === b.is_open) {
    const timeNow = new Date();
    const aTimeFrom = a.time_from && new Date(a.time_from);
    const aTimeTo = a.time_to && new Date(a.time_to);
    const bTimeFrom = b.time_from && new Date(b.time_from);
    const bTimeTo = b.time_to && new Date(b.time_to);

    const aOpenNow =
      (!aTimeFrom || aTimeFrom <= timeNow) && (!aTimeTo || timeNow <= aTimeTo);
    const bOpenNow =
      (!bTimeFrom || bTimeFrom <= timeNow) && (!bTimeTo || timeNow <= bTimeTo);

    if (aOpenNow !== bOpenNow) {
      if (aOpenNow) {
        return 0;
      }
      return 1;
    }

    const aOpenFuture = aTimeFrom && aTimeFrom > timeNow;
    const bOpenFuture = bTimeFrom && bTimeFrom > timeNow;

    if (aOpenFuture !== bOpenFuture) {
      if (aOpenFuture) {
        return 0;
      }
      return 1;
    }

    if (aTimeFrom && bTimeFrom) {
      if (aTimeFrom <= bTimeFrom) {
        return 0;
      }
      return 1;
    }

    return 0;
  }
  if (a.is_open) {
    return 0;
  }
  return 1;
}
