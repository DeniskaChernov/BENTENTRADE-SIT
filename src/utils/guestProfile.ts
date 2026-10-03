export const GUEST_PROFILE_KEY = 'bententrade-guest-profile';

export type GuestPayment = 'uzcard' | 'humo' | 'payme' | 'click';

export type GuestProfile = {
  name?: string;
  phone?: string;
  address?: string;
  paymentMethod?: GuestPayment | '';
};

export function loadGuestProfile(): GuestProfile | null {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestProfile;
  } catch {
    return null;
  }
}

export function saveGuestProfile(p: GuestProfile): void {
  try {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* private mode */
  }
}

export function isGuestProfileCheckoutReady(p: GuestProfile | null): boolean {
  if (!p?.name?.trim() || !p?.phone?.trim()) return false;
  if (!p.paymentMethod) return false;
  return true;
}
