export const formatPrice = (value: number): string =>
  `€${Number.isInteger(value) ? value : value.toFixed(2)}`;
