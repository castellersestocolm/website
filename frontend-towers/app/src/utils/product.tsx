import { Module } from "../enums";

export function filterProductsForUser(products: any[], teamIds: string[]) {
  return products.filter(
    (product: any) =>
      product.modules &&
      product.modules.filter(
        (productModule: any) =>
          productModule.module === Module.TOWERS &&
          productModule.is_required &&
          (productModule.teams.length === 0 ||
            !teamIds ||
            productModule.teams.some((team: any) =>
              teamIds.includes(team.id),
            )) &&
          (productModule.exclude_teams.length === 0 ||
            !teamIds ||
            !productModule.exclude_teams.some((team: any) =>
              teamIds.includes(team.id),
            )),
      ).length > 0,
  );
}
