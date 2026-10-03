import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { X, Zap } from '../utils/lucide-stub';
import { pickLang, useLanguage } from '../utils/language-context';
import { trackEvent } from '../utils/analytics';
import { API_BASE_URL, API_TOKEN } from '../utils/env';
import { formatPrice } from '../utils/translations';
import { loadGuestProfile, saveGuestProfile, type GuestPayment } from '../utils/guestProfile';

type Pay = GuestPayment;

export interface OneClickLine {
  name: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
  size?: string;
  style?: string;
  lineMeta?: string;
}

interface OneClickCheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  lines: OneClickLine[];
  onSuccess: () => void;
}

export function OneClickCheckoutSheet({ open, onClose, lines, onSuccess }: OneClickCheckoutSheetProps) {
  const { language, t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState<Pay | ''>('');
  const [agree, setAgree] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const p = loadGuestProfile();
    if (p) {
      setName(p.name || '');
      setPhone(p.phone || '');
      if (p.paymentMethod) setPayment(p.paymentMethod as Pay);
    }
  }, [open]);

  const total = lines.reduce((s, x) => s + x.total, 0);

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !payment || !agree || lines.length === 0) return;
    setBusy(true);
    trackEvent('one_click_submit', { value: total, currency: 'UZS' });
    try {
      const orderData = {
        items: lines.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          variant: item.variant,
          size: item.size,
          style: item.style,
          lineMeta: item.lineMeta,
          price: item.price,
          total: item.total,
        })),
        customerInfo: {
          name: name.trim(),
          phone: phone.trim(),
          address: '',
          notes: pickLang(language, {
            ru: 'Оформление в 1 клик',
            uz: '1 bosishda buyurtma',
            en: 'One-click checkout',
          }),
          paymentMethod: payment,
        },
        total,
        language,
      };

      const res = await fetch(`${API_BASE_URL}/telegram/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(orderData),
      });
      const ok = res.ok && (await res.json().catch(() => ({}))).success;
      if (ok) {
        trackEvent('purchase', { value: total, currency: 'UZS', flow: 'one_click' });
        if (remember) {
          saveGuestProfile({
            name: name.trim(),
            phone: phone.trim(),
            address: loadGuestProfile()?.address || '',
            paymentMethod: payment,
          });
        }
        onSuccess();
        onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-primary/20 bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="font-grotesk text-lg font-semibold">{t.cartOneClick}</h2>
              </div>
              <Button type="button" size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label={t.close}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ul className="mb-4 space-y-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
              {lines.map((l, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {l.name}
                    {l.lineMeta ? ` · ${l.lineMeta}` : ''} ×{l.quantity}
                  </span>
                  <span className="shrink-0 font-medium">{formatPrice(l.total, t.currency)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-border/40 pt-2 font-semibold">
                <span>{t.total}</span>
                <span className="text-primary">{formatPrice(total, t.currency)}</span>
              </li>
            </ul>

            <div className="space-y-3">
              <div>
                <Label>{pickLang(language, { ru: 'Имя', uz: 'Ism', en: 'Name' })} *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" autoComplete="name" />
              </div>
              <div>
                <Label>{pickLang(language, { ru: 'Телефон', uz: 'Telefon', en: 'Phone' })} *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 rounded-xl"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
              <div>
                <Label>{t.checkoutPayMethod} *</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      ['uzcard', t.payUzcard],
                      ['humo', t.payHumo],
                      ['payme', t.payPayme],
                      ['click', t.payClick],
                    ] as const
                  ).map(([id, label]) => (
                    <Button
                      key={id}
                      type="button"
                      size="sm"
                      variant={payment === id ? 'default' : 'outline'}
                      className="rounded-xl"
                      onClick={() => setPayment(id)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="oc-agree" checked={agree} onCheckedChange={(c) => setAgree(!!c)} />
                <label htmlFor="oc-agree" className="text-sm leading-snug">
                  {t.agreeToDataProcessing} *
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="oc-rem" checked={remember} onCheckedChange={(c) => setRemember(!!c)} />
                <label htmlFor="oc-rem" className="text-sm text-muted-foreground">
                  {t.profileRememberCta}
                </label>
              </div>
            </div>

            <Button type="button" className="agency-cta-primary mt-6 h-12 w-full rounded-xl text-primary-foreground" disabled={busy} onClick={submit}>
              {busy
                ? pickLang(language, { ru: 'Отправка…', uz: 'Yuborilmoqda…', en: 'Sending…' })
                : pickLang(language, { ru: 'Подтвердить заказ', uz: 'Tasdiqlash', en: 'Confirm order' })}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
