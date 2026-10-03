import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Breadcrumbs } from './Breadcrumbs';
import { ArrowLeft } from '../utils/lucide-stub';
import { pickLang, useLanguage } from '../utils/language-context';
import { loadGuestProfile, saveGuestProfile, type GuestPayment } from '../utils/guestProfile';

interface UserProfilePageProps {
  onBack: () => void;
}

export function UserProfilePage({ onBack }: UserProfilePageProps) {
  const { language, t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<GuestPayment | ''>('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = loadGuestProfile();
    if (!p) return;
    setName(p.name || '');
    setPhone(p.phone || '');
    setAddress(p.address || '');
    if (p.paymentMethod) setPayment(p.paymentMethod as GuestPayment);
  }, []);

  const save = () => {
    saveGuestProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod: payment || undefined,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background pb-16 pt-24">
      <div className="container mx-auto max-w-lg px-4">
        <Breadcrumbs
          items={[
            {
              label: pickLang(language, { ru: 'Главная', uz: 'Bosh sahifa', en: 'Home' }),
              onClick: onBack,
            },
            { label: t.profilePageTitle },
          ]}
        />
        <Button type="button" variant="ghost" className="mb-6 gap-2 rounded-xl" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t.backToMain}
        </Button>
        <h1 className="font-grotesk text-2xl font-semibold">{t.profilePageTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.profilePageLead}</p>

        <div className="mt-8 space-y-4 rounded-2xl border border-primary/15 bg-card/40 p-6">
          <div>
            <Label>{pickLang(language, { ru: 'Имя', uz: 'Ism', en: 'Name' })}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" autoComplete="name" />
          </div>
          <div>
            <Label>{pickLang(language, { ru: 'Телефон', uz: 'Telefon', en: 'Phone' })}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" autoComplete="tel" />
          </div>
          <div>
            <Label>{pickLang(language, { ru: 'Адрес доставки', uz: 'Yetkazib berish manzili', en: 'Delivery address' })}</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 rounded-xl" autoComplete="street-address" />
          </div>
          <div>
            <Label>{t.checkoutPayMethod}</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ['uzcard', t.payUzcard],
                  ['humo', t.payHumo],
                  ['payme', t.payPayme],
                  ['click', t.payClick],
                ] as const
              ).map(([id, label]) => (
                <Button key={id} type="button" size="sm" variant={payment === id ? 'default' : 'outline'} className="rounded-xl" onClick={() => setPayment(id)}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <Button type="button" className="w-full rounded-xl" onClick={save}>
            {saved ? t.profileSaved : t.profileSave}
          </Button>
        </div>
      </div>
    </div>
  );
}
