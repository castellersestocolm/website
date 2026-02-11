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
