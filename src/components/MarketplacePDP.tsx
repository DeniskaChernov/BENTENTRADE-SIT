import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Breadcrumbs } from './Breadcrumbs';
import { ArrowLeft, ShoppingBag, Zap } from '../utils/lucide-stub';
import type { Translations } from '../utils/translations';
import type { Language } from '../utils/language-context';
import { pickLang } from '../utils/language-context';
import { formatPrice } from '../utils/translations';
import { getAssistantProfileKey } from '../data/productSlugs';
import { ProductAssistantPanel } from './ProductAssistantPanel';
import { trackEvent } from '../utils/analytics';

export interface PDPColorVariant {
  id: string;
  name: string;
  images: string[];
  color: string;
  gradient?: string;
  article?: string;
}

export interface PDPProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  size?: string;
  style?: string;
  dimensions?: { height: number; diameter: number };
  variants?: PDPColorVariant[];
}

interface MarketplacePDPProps {
  product: PDPProduct;
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  getColorName: (colorId: string) => string;
  onBack: () => void;
  onAddToCart: (opts: { widthMm: number | null }) => void;
  onOneClick: (opts: { widthMm: number | null }) => void;
  language: Language;
  t: Translations;
  homeLabel: string;
}

const WIDTH_OPTIONS = [4, 5, 6] as const;

function galleryFor(product: PDPProduct, variantId: string): string[] {
  const v = product.variants?.find((x) => x.id === variantId);
  if (v?.images?.length) return v.images;
  return [product.image];
}

function priceLine(product: PDPProduct, t: Translations, language: Language): string {
  const isRattan = product.category === 'materials';
  if (isRattan) {
    return pickLang(language, {
      uz: `36 000 so'm/kg · min. 5 kg`,
      ru: `36 000 сум/кг · мин. 5 кг`,
      en: `36,000 UZS/kg · min. 5 kg`,
    });
  }
  if (product.size === '5л') return formatPrice(120000, t.currency);
  if (product.size === '10л') return formatPrice(187000, t.currency);
  if (product.size === '16л') return formatPrice(245000, t.currency);
  return '';
}

export function MarketplacePDP({
  product,
  selectedVariantId,
  onVariantChange,
  getColorName,
  onBack,
  onAddToCart,
  onOneClick,
  language,
  t,
  homeLabel,
}: MarketplacePDPProps) {
  const reduce = useReducedMotion();
  const [imgIdx, setImgIdx] = useState(0);
  const [widthMm, setWidthMm] = useState<number | null>(product.category === 'materials' ? 5 : null);

  const imgs = useMemo(() => galleryFor(product, selectedVariantId), [product, selectedVariantId]);
  const mainSrc = imgs[Math.min(imgIdx, imgs.length - 1)] || product.image;
  const profileKey = getAssistantProfileKey(product.id);
  const showWidth = product.category === 'materials';

  return (
    <div className="min-h-screen bg-background pb-16 pt-20">
      <div className="container mx-auto max-w-7xl px-4">
        <Breadcrumbs
          items={[
            { label: homeLabel, onClick: onBack },
            { label: t.catalog, onClick: onBack },
            { label: product.name },
          ]}
        />

        <Button type="button" variant="ghost" className="mb-6 gap-2 rounded-xl" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t.backToMain}
        </Button>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <motion.div
              key={mainSrc}
              initial={reduce ? undefined : { opacity: 0.9 }}
              animate={{ opacity: 1 }}
              className="aspect-square overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm"
            >
              <ImageWithFallback src={mainSrc} alt={product.name} className="h-full w-full object-cover" />
            </motion.div>
            {imgs.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imgs.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                      i === imgIdx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:col-span-6 xl:grid-cols-2 xl:gap-8">
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {product.category === 'materials' ? t.pdpMadeToOrder : t.pdpInStock}
                  </Badge>
                  {product.size && <Badge variant="outline">{product.size}</Badge>}
                </div>
                <h1 className="font-grotesk text-3xl font-semibold tracking-tight text-balance md:text-4xl">{product.name}</h1>
                <p className="mt-3 text-lg font-medium text-primary">{priceLine(product, t, language)}</p>
                <p className="mt-4 text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">{t.selectColor}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          onVariantChange(v.id);
                          setImgIdx(0);
                          trackEvent('pdp_variant_select', { product_id: product.id, variant_id: v.id });
                        }}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all ${
                          selectedVariantId === v.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/60 hover:border-primary/40'
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                          style={{ background: v.gradient || v.color }}
                        />
                        {getColorName(v.id)}
                        {v.article && <span className="text-xs opacity-70">· {v.article}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showWidth && (
                <div>
                  <p className="mb-2 text-sm font-medium">
                    {pickLang(language, {
                      ru: 'Ширина нити (мм)',
                      uz: 'Ip kengligi (mm)',
                      en: 'Thread width (mm)',
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {WIDTH_OPTIONS.map((w) => (
                      <Button
                        key={w}
                        type="button"
                        size="sm"
                        variant={widthMm === w ? 'default' : 'outline'}
                        className="h-10 min-w-[4rem] rounded-xl"
                        onClick={() => {
                          setWidthMm(w);
                          trackEvent('pdp_width_select', { product_id: product.id, width_mm: w });
                        }}
                      >
                        {w} mm
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
                <Button
                  type="button"
                  className="agency-cta-primary h-12 flex-1 gap-2 rounded-xl text-primary-foreground"
                  onClick={() => onAddToCart({ widthMm: showWidth ? widthMm : null })}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t.order}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-12 flex-1 gap-2 rounded-xl"
                  onClick={() => onOneClick({ widthMm: showWidth ? widthMm : null })}
                >
                  <Zap className="h-4 w-4" />
                  {t.cartOneClick}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">{t.pdpDeliveryBlock}</p>
            </div>

            <ProductAssistantPanel
              language={language}
              productTitle={product.name}
              profileKey={profileKey}
              showWidthHints={showWidth}
              selectedWidthMm={widthMm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
