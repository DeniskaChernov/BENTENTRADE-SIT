/**
 * База знаний ассистента на странице товара.
 * Замените тексты на свои — структуру ключей лучше сохранить.
 */
import type { Language } from '../utils/language-context';

type Loc = Record<Language, string>;

export const ASSISTANT_PROFILE_COPY: Record<string, Loc> = {
  hemisphere: {
    ru: 'Профиль «полусфера» — универсал для классического плетения: хорошо ложится в углы и радиусы, визуально мягкий объём.',
    uz: '«Yarim shar» profili — klassik to‘qish uchun universal: burchak va radiuslarda yaxshi yotadi.',
    en: 'Hemisphere profile: a versatile choice for classic weaving; soft volume and easy corners.',
  },
  sphere: {
    ru: 'Профиль «сфера» — округлое сечение для объёмных, «пухлых» узоров; чаще для декора и мебели с крупной фактурой.',
    uz: '«Shar» profili — hajmli, dumaloq naqshlar uchun; dekor va yirik teksturali mebel uchun.',
    en: 'Sphere profile: round section for chunky, volumetric patterns and bold texture.',
  },
  flat: {
    ru: 'Плоский ротанг — ровная поверхность, современный «гладкий» вид; удобен для ровных плоскостей и минималистичных форм.',
    uz: 'Tekis rattan — silliq zamonaviy ko‘rinish; tekis yuzalar va minimalist shakllar uchun qulay.',
    en: 'Flat profile: smooth faces, great for modern flat panels and minimal lines.',
  },
  crescent: {
    ru: '«Полумесяц» — выразительный профиль для декоративных линий и контраста в узоре.',
    uz: '«Yarim oy» — dekorativ chiziqlar va naqshdagi kontrast uchun ifodali profil.',
    en: 'Crescent: decorative lines and strong visual rhythm in the weave.',
  },
  tube: {
    ru: 'Трубчатый / полутрубчатый профиль — обычно легче по весу, удобен для крупных изделий и длинных прогонов.',
    uz: 'Nay/similar profil — odatda yengilroq, katta buyumlar va uzoq yo‘nalishlar uchun qulay.',
    en: 'Tube / half-tube: often lighter, handy for large pieces and long runs.',
  },
  planter: {
    ru: 'Кашпо ручной работы: подберите объём под корневую систему и место установки — улица или интерьер.',
    uz: 'Qo‘lda to‘qilgan guldon: ildiz tizimi va joy (ko‘cha yoki interyer) bo‘yicha hajm tanlang.',
    en: 'Hand-woven planters: pick volume for root space and placement — outdoor or indoor.',
  },
};

/** Пояснения по условной толщине (мм) — подставьте свои факты о партиях */
export const ASSISTANT_WIDTH_COPY: Record<string, Loc> = {
  '4': {
    ru: '4 мм — более тонкая нить: гибче, подходит для мелкой фактуры и детализированных узоров (уточняйте партию у менеджера).',
    uz: '4 mm — ingroq ip: egiluvchanroq, mayda naqshlar uchun (partiyani menejerdan tasdiqlang).',
    en: '4 mm — finer line, more flexible; detailed textures (confirm batch with us).',
  },
  '5': {
    ru: '5 мм — баланс между скоростью плетения и визуальной массой; частый выбор для мебели среднего размера.',
    uz: '5 mm — tezlik va ko‘rinish massasi o‘rtasi; o‘rta o‘lchamdagi mebel uchun tez-tez tanlanadi.',
    en: '5 mm — balance of speed and visual weight; common for mid-size furniture.',
  },
  '6': {
    ru: '6 мм — более смелый рельеф и быстрые прогоны; для крупных форм и акцентных поверхностей.',
    uz: '6 mm — yirik rel’yef va tezroq yo‘nalishlar; katta forma va aksent yuzalar uchun.',
    en: '6 mm — bolder relief, faster coverage; large forms and statement surfaces.',
  },
};

export function pickAssistantText(lang: Language, map: Loc): string {
  return map[lang] || map.ru;
}
