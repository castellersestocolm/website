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
