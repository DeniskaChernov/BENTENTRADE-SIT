/** ЧПУ для страниц товаров (совпадают с URL /product/...) */
export const PRODUCT_ID_TO_SLUG: Record<string, string> = {
  '1': 'rattan-polusfera',
  '1-sphere': 'rattan-sfera',
  '1-flat': 'rattan-ploskiy',
  '1-crescent': 'rattan-polumesyac',
  '1-tube': 'rattan-trubka',
  '2': 'kashpo-5l-s-ruchkoy',
  '3': 'kashpo-10l-klassika',
  '4': 'kashpo-10l-puffy',
  '5': 'kashpo-16l-klassika',
  '6': 'kashpo-16l-puffy',
};

export function getSlugForProductId(id: string): string {
  return PRODUCT_ID_TO_SLUG[id] || id;
}

export function getProductIdForSlug(slug: string): string | null {
  const e = Object.entries(PRODUCT_ID_TO_SLUG).find(([, s]) => s === slug);
  return e ? e[0] : null;
}

/** Ключи для блока знаний ассистента (профиль ротанга) */
export function getAssistantProfileKey(productId: string): string {
  const map: Record<string, string> = {
    '1': 'hemisphere',
    '1-sphere': 'sphere',
    '1-flat': 'flat',
    '1-crescent': 'crescent',
    '1-tube': 'tube',
  };
  return map[productId] || 'planter';
}
