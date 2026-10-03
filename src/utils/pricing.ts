/** Минимальные поля для расчёта цены */
export type PriceProduct = { category?: string; size?: string };

export function unitPriceUzs(p: PriceProduct): number {
  if (p.category === 'materials') return 36000;
  if (p.size === '10л') return 187000;
  if (p.size === '16л') return 245000;
  return 120000;
}

export function defaultQuantity(p: PriceProduct): number {
  return p.category === 'materials' ? 5 : 1;
}
