import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Minus, Plus, ShoppingBag, CheckCircle, Shield, Mail, Wallet } from '../utils/lucide-stub';
import { pickLang, useLanguage } from '../utils/language-context';
import { trackEvent } from '../utils/analytics';
import { API_BASE_URL, API_TOKEN } from '../utils/env';
import { formatPrice } from '../utils/translations';

interface ColorVariant {
  id: string;
  name: string;
  image: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  selectedVariant?: ColorVariant;
  selectedImageIndex?: number;
  size?: string;
  style?: string;
  category?: string; // 'materials' для ротанга, иначе кашпо
}

interface CartItem extends Product {
  quantity: number;
  /** Доп. строка в заказе (например ширина нити) */
  lineMeta?: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartProps) {
  const { t, language } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToDataProcessing, setAgreeToDataProcessing] = useState(false);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'uzcard' | 'humo' | 'payme' | 'click' | ''>('');
  const [rememberProfile, setRememberProfile] = useState(false);

  const GUEST_PROFILE_KEY = 'bententrade-guest-profile';

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(GUEST_PROFILE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as {
        name?: string;
        phone?: string;
        address?: string;
        paymentMethod?: 'uzcard' | 'humo' | 'payme' | 'click';
      };
      setFormData((prev) => ({
        ...prev,
        name: p.name || prev.name,
        phone: p.phone || prev.phone,
        address: p.address || prev.address,
      }));
      if (p.paymentMethod) setPaymentMethod(p.paymentMethod);
    } catch {
      /* ignore */
    }
  }, [isOpen]);

  const normalizePhoneInput = (raw: string) => {
    const sanitized = raw.replace(/[^\d+]/g, '');
    const plusCount = (sanitized.match(/\+/g) || []).length;
    if (plusCount > 1) return `+${sanitized.replace(/\+/g, '')}`.slice(0, 20);
    if (sanitized.includes('+') && !sanitized.startsWith('+')) {
      return `+${sanitized.replace(/\+/g, '')}`.slice(0, 20);
    }
    return sanitized.slice(0, 20);
  };

  const formatUzbekPhone = (value: string) => {
    const raw = normalizePhoneInput(value);
    if (!raw) return '';
    let digits = raw.replace(/\D/g, '');
    if (raw.startsWith('+')) {
      if (!digits.startsWith('998')) digits = `998${digits}`;
      digits = digits.slice(0, 12);
      const cc = digits.slice(0, 3);
      const p1 = digits.slice(3, 5);
      const p2 = digits.slice(5, 8);
      const p3 = digits.slice(8, 10);
      const p4 = digits.slice(10, 12);
      return `+${cc}${p1 ? ` ${p1}` : ''}${p2 ? ` ${p2}` : ''}${p3 ? ` ${p3}` : ''}${p4 ? ` ${p4}` : ''}`;
    }
    return raw;
  };
  
  // Функция перевода названий цветов
  const getColorName = (colorId: string): string => {
    const colorMap: {[key: string]: {ru: string; uz: string}} = {
      'yellow': { ru: 'Жёлтый', uz: 'Sariq' },
      'gray': { ru: 'Серый', uz: 'Kulrang' },
      'white-birch': { ru: 'Белая берёзка', uz: 'Oq qayin' },
      'beige': { ru: 'Бежевый', uz: 'Och jigarrang' },
      'buttery': { ru: 'Кремовый', uz: 'Krem' },
      'brown': { ru: 'Коричневый', uz: 'Jigarrang' },
      'brown-white': { ru: 'Коричнево-Белый', uz: 'Jigarrang-Oq' },
      'tricolor': { ru: 'Трёхцветный', uz: 'Uch rangli' },
      'pearl': { ru: 'Жемчужный', uz: 'Marvarid' },
      'sand': { ru: 'Песочный', uz: 'Qum' },
      'gold': { ru: 'Золото', uz: 'Oltin' },
      'brushed-grey': { ru: 'Серый с начёсом', uz: 'Yuvulgan kulrang' },
      'mahogany': { ru: 'Красное дерево', uz: 'Qizil yog\'och' },
      'white': { ru: 'Белый', uz: 'Oq' },
      'purple': { ru: 'Фиолетовый', uz: 'Binafsha' },
      'grey': { ru: 'Серый', uz: 'Kulrang' },
      'bronze': { ru: 'Бронза', uz: 'Bronza' },
      'black-gold': { ru: 'Черная с золотыми наплывами', uz: 'Oltin chiziqli qora' },
      'light-grey': { ru: 'Светло-серый', uz: 'Och kulrang' },
      'pale-yellow': { ru: 'Бледно-жёлтый', uz: 'Och sariq' },
    };
    return colorMap[colorId]?.[language] || colorId;
  };

  // Функция для получения цены товара
  const getItemPrice = (item: CartItem): number => {
    const isRattan = item.category === 'materials';
    
    if (isRattan) {
      return 36000; // 36000 сум за 1кг
    }
    
    // Для кашпо
    if (item.size === '10л') {
      return 187000; // 187000 сум
    }
    
    if (item.size === '16л') {
      return 245000; // 245000 сум
    }
    
    // Для кашпо 5л с ручкой (по умолчанию)
    return 120000; // 120000 сум
  };

  // Функция для вычисления итоговой цены товара с учетом количества
  const getItemTotal = (item: CartItem): number => {
    return getItemPrice(item) * item.quantity;
  };

  // Вычисляем общую сумму заказа
  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || items.length === 0 || !agreeToDataProcessing || !paymentMethod) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-[9999] max-w-sm';
      notification.textContent = !agreeToDataProcessing
        ? pickLang(language, {
            uz: 'Shaxsiy ma\'lumotlarni qayta ishlashga rozilik bering',
            ru: 'Необходимо согласие на обработку персональных данных',
            en: 'Please accept data processing',
          })
        : !paymentMethod
          ? pickLang(language, {
              uz: 'To‘lov usulini tanlang',
              ru: 'Выберите способ оплаты',
              en: 'Choose a payment method',
            })
          : pickLang(language, {
              uz: 'Iltimos, barcha majburiy maydonlarni to\'ldiring',
              ru: 'Пожалуйста, заполните обязательные поля',
              en: 'Please fill required fields',
            });
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
      return;
    }

    setIsSubmitting(true);

    const orderSkus = items.map((item) =>
      item.selectedVariant
        ? `${item.id}-${item.selectedVariant.id}-${item.selectedImageIndex || 0}`
        : item.id,
    );
    trackEvent('start_checkout', {
      currency: 'UZS',
      value: calculateTotal(),
      sku: orderSkus,
    });

    try {
      const orderData = {
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          variant: item.selectedVariant?.name,
          size: item.size,
          style: item.style,
          lineMeta: item.lineMeta,
          price: getItemPrice(item),
          total: getItemTotal(item)
        })),
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          notes: formData.message,
          paymentMethod,
        },
        total: calculateTotal(),
        language
      };

      // Отправляем в Telegram через наш сервер
      const telegramResponse = await fetch(`${API_BASE_URL}/telegram/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(orderData),
      });

      let telegramSuccess = false;
      let telegramMessageId = null;

      if (telegramResponse.ok) {
        const telegramResult = await telegramResponse.json();
        telegramSuccess = telegramResult.success;
        telegramMessageId = telegramResult.messageId;
        console.log('✅ Order sent to Telegram:', telegramMessageId);
      } else {
        const errorData = await telegramResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Telegram error:', errorData);
        console.log('🔍 Response status:', telegramResponse.status);
        console.log('🔍 Error details:', errorData.details);
        
        // Проверяем различные варианты ошибки "chat not found"
        const isChatNotFound = 
          telegramResponse.status === 400 && (
            errorData.details?.toLowerCase().includes('chat not found') ||
            errorData.details?.toLowerCase().includes('chat_not_found') ||
            errorData.error?.toLowerCase().includes('chat not found') ||
            errorData.helpMessage?.includes('не добавлен в группу')
          );
        
        // Если ошибка 400 (Chat not found), показываем помощник настройки
        if (isChatNotFound) {
          console.log('🚨 Chat not found - opening Telegram setup helper');
          console.log('📋 Error data:', JSON.stringify(errorData, null, 2));
          
          // ОГРОМНОЕ ASCII сообщение в консоль
          console.log('\n\n');
          console.log('%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #D4A574; font-size: 16px; font-weight: bold;');
          console.log('%c║                                                                            ║', 'color: #D4A574; font-size: 16px; font-weight: bold;');
          console.log('%c║              🚨 TELEGRAM ОШИБКА - ТРЕБУЕТСЯ НАСТРОЙКА 🚨                  ║', 'color: #FF4B4B; font-size: 20px; font-weight: bold;');
          console.log('%c║                                                                            ║', 'color: #D4A574; font-size: 16px; font-weight: bold;');
          console.log('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #D4A574; font-size: 16px; font-weight: bold;');
          
          console.log('\n%c⚡ ЧТО СЕЙЧАС ПРОИЗОЙДЕТ:', 'color: #D4A574; font-size: 18px; font-weight: bold;');
          console.log('%c   → МАСТЕР НАСТРОЙКИ откроется АВТОМАТИЧЕСКИ через 1 секунду', 'color: #4ade80; font-size: 16px; font-weight: bold;');
          console.log('%c   → НЕ закрывайте это окно!', 'color: #fbbf24; font-size: 16px;');
          console.log('%c   → Следуйте инструкциям на экране', 'color: #F5F3F0; font-size: 14px;');
          
          console.log('\n%c📋 КРАТКАЯ ИНСТРУКЦИЯ (3 шага):', 'color: #D4A574; font-size: 18px; font-weight: bold;');
          console.log('%c   ┌─────────────────────────────────────────────────────────────┐', 'color: #D4A574;');
          console.log('%c   │  ШАГ 1: Нажмите "Найти чаты автоматически"                │', 'color: #F5F3F0; font-size: 14px;');
          console.log('%c   │  ШАГ 2: Нажмите "Тест" для каждого чата (проверьте Telegram)│', 'color: #F5F3F0; font-size: 14px;');
          console.log('%c   │  ШАГ 3: Скопируйте Chat ID и обновите в Supabase          │', 'color: #F5F3F0; font-size: 14px;');
          console.log('%c   └─────────────────────────────────────────────────────────────┘', 'color: #D4A574;');
          
          console.log('\n%c❌ ТЕКУЩАЯ ПРОБЛЕМА:', 'color: #FF4B4B; font-size: 18px; font-weight: bold;');
          console.log('%c   Chat ID НЕ НАСТРОЕН или НЕ РАБОТАЕТ', 'color: #FF4B4B; font-size: 16px; font-weight: bold;');
          console.log('%c   Причина: Бот не в группе или группа была пересоздана', 'color: #F5F3F0; font-size: 14px;');
          
          console.log('\n%c✅ ПОСЛЕ ИСПРАВЛЕНИЯ:', 'color: #4ade80; font-size: 18px; font-weight: bold;');
          console.log('%c   • Заказы будут приходить автоматически', 'color: #F5F3F0; font-size: 14px;');
          console.log('%c   • В правильную Telegram группу', 'color: #F5F3F0; font-size: 14px;');
          console.log('%c   • Без ошибок', 'color: #F5F3F0; font-size: 14px;');
          
          console.log('\n%c⏱️ ВРЕМЯ ВЫПОЛНЕНИЯ: 3-5 минут', 'color: #fbbf24; font-size: 16px; font-weight: bold;');
          
          console.log('\n%c' + '═'.repeat(80), 'color: #D4A574;');
          console.log('\n\n');
          
          // Отправляем событие для открытия TelegramSetupHelper с небольшой задержкой
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('openTelegramSetup', { 
              detail: { error: errorData } 
            }));
          }, 500);
          
          // Показываем ОГРОМНОЕ уведомление с обратным отсчетом
          const notification = document.createElement('div');
          notification.className = 'fixed inset-0 bg-black/90 backdrop-blur-md z-[9998] flex items-center justify-center p-4';
          
          let countdown = 3;
          const countdownInterval = setInterval(() => {
            countdown--;
            const countdownEl = notification.querySelector('#wizard-countdown');
            if (countdownEl) {
              countdownEl.textContent = String(countdown);
            }
            if (countdown === 0) {
              clearInterval(countdownInterval);
            }
          }, 1000);
          
          // Определяем тип чата
          const isGroupChat = errorData.chatType === 'group';
          
          notification.innerHTML = `
            <div class="max-w-2xl w-full glass-effect rounded-3xl p-8 border-2 border-primary/40 shadow-2xl" style="animation: pulse 2s infinite;">
              <div class="text-center mb-6">
                <div class="text-8xl mb-4 animate-bounce">🔧</div>
                <h2 class="text-4xl font-bold text-primary mb-3">Требуется настройка Telegram</h2>
                <p class="text-xl text-white/80">
                  ${isGroupChat 
                    ? 'Бот не добавлен в группу или Chat ID устарел' 
                    : 'Telegram чат не найден'}
                </p>
              </div>
              
              <div class="bg-gradient-to-r from-green-400/20 to-primary/20 rounded-2xl border-2 border-green-400/40 p-6 mb-6">
                <div class="flex items-center gap-4 mb-4">
                  <div class="text-6xl" id="wizard-countdown">3</div>
                  <div class="flex-1">
                    <div class="text-2xl font-bold text-green-400 mb-2">Мастер настройки откроется через...</div>
                    <div class="text-lg text-white/70">Следуйте простым пошаговым инструкциям</div>
                  </div>
                </div>
                <div class="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-green-400 to-primary rounded-full animate-pulse" style="width: 100%; animation: shrink 3s linear;"></div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-black/30 rounded-xl p-4 text-center">
                  <div class="text-3xl mb-2">1️⃣</div>
                  <div class="text-sm text-white/90 font-semibold">Найти чаты</div>
                  <div class="text-xs text-white/60 mt-1">Автоматически</div>
                </div>
                <div class="bg-black/30 rounded-xl p-4 text-center">
                  <div class="text-3xl mb-2">2️⃣</div>
                  <div class="text-sm text-white/90 font-semibold">Протестировать</div>
                  <div class="text-xs text-white/60 mt-1">Кнопка "Тест"</div>
                </div>
                <div class="bg-black/30 rounded-xl p-4 text-center">
                  <div class="text-3xl mb-2">3️⃣</div>
                  <div class="text-sm text-white/90 font-semibold">Обновить ID</div>
                  <div class="text-xs text-white/60 mt-1">В Supabase</div>
                </div>
              </div>
              
              <div class="text-center">
                <div class="text-sm text-white/60 mb-3">⏱️ Займет всего 3-5 минут</div>
                <div class="text-xs text-white/40">
                  Или нажмите <kbd class="px-2 py-1 bg-primary/20 rounded font-mono text-primary mx-1">Ctrl+Shift+T</kbd> в любой момент
                </div>
              </div>
            </div>
            
            <style>
              @keyframes shrink {
                from { width: 100%; }
                to { width: 0%; }
              }
            </style>
          `;
          document.body.appendChild(notification);
          
          // Автоматически закрываем через 3 секунды (когда откроется мастер)
          setTimeout(() => {
            if (notification.parentNode) {
              notification.style.opacity = '0';
              notification.style.transition = 'opacity 0.5s ease-out';
              setTimeout(() => {
                if (notification.parentNode) {
                  notification.remove();
                  clearInterval(countdownInterval);
                }
              }, 500);
            }
          }, 3000);
        }
      }
      
      // Сохраняем заказ на сервере
      try {
        const serverResponse = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`,
          },
          body: JSON.stringify({
            items: orderData.items,
            customerInfo: orderData.customerInfo,
            language: orderData.language,
            telegramMessageId: telegramMessageId
          }),
        });

        const resultJson = await serverResponse.json().catch(() => ({}));
        if (!serverResponse.ok) {
          const showOrderWarning = (msg: string) => {
            const n = document.createElement('div');
            n.className =
              'fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] max-w-sm glass-effect border-primary/30 text-primary/90 text-sm';
            n.textContent = msg;
            document.body.appendChild(n);
            setTimeout(() => n.remove(), 6000);
          };
          if (serverResponse.status === 429) {
            showOrderWarning(
              language === 'uz'
                ? 'Juda koʻp buyurtma yuborildi. Keyinroq urinib koʻring.'
                : String(resultJson.error || 'Слишком много заявок. Попробуйте позже.'),
            );
          } else if (serverResponse.status === 400 || serverResponse.status === 413) {
            showOrderWarning(
              String(
                resultJson.error ||
                  (language === 'uz'
                    ? 'Buyurtma yuborilmadi. Maʼlumotlarni tekshiring.'
                    : 'Заказ не сохранён. Проверьте данные или попробуйте позже.'),
              ),
            );
          } else {
            console.error('Server error:', resultJson);
          }
        } else {
          console.log('Order saved to server:', resultJson.orderId);
        }
      } catch (serverError) {
        console.error('Error saving order to server:', serverError);
        // Продолжаем даже если сервер недоступен
      }
      
      if (telegramSuccess) {
        trackEvent('purchase', {
          value: calculateTotal(),
          currency: 'UZS',
          sku: orderSkus,
        });

        if (rememberProfile) {
          try {
            localStorage.setItem(
              GUEST_PROFILE_KEY,
              JSON.stringify({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                paymentMethod,
              }),
            );
          } catch {
            /* private mode */
          }
        }

        // Показываем современное уведомление об успехе
        const notification = document.createElement('div');
        notification.className = 'fixed top-6 right-6 p-5 rounded-2xl shadow-2xl z-[9999] max-w-md glass-effect border-green-400/30 animate-in';
        notification.innerHTML = `
          <div class="flex items-start gap-4">
            <div class="p-2.5 bg-green-400/20 rounded-xl flex-shrink-0">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-green-400 mb-2 text-lg">
                ${language === 'uz' ? '✅ Buyurtma yuborildi!' : '✅ Заказ принят!'}
              </div>
              <div class="text-sm text-foreground/80 mb-3">
                ${language === 'uz' 
                  ? 'Buyurtmangiz Telegram orqali yuborildi. Tez orada aloqaga chiqamiz!' 
                  : 'Ваш заказ отправлен в Telegram. Мы свяжемся с вами в ближайшее время!'}
              </div>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>${language === 'uz' ? 'Javob 5-10 daqiqada' : 'Ответим в течение 5-10 минут'}</span>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
          }
        }, 6000);

        setFormData({ name: '', phone: '', email: '', address: '', message: '' });
        onClose();
        
        // Очищаем корзину после успешного заказа
        items.forEach(item => {
          const itemId = getItemId(item);
          onRemoveItem(itemId);
        });
      } else {
        throw new Error('Failed to send order to Telegram');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-[9999] max-w-sm';
      notification.textContent = language === 'uz' 
        ? 'Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.'
        : 'Произошла ошибка при отправке заказа. Попробуйте еще раз.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
    
    setIsSubmitting(false);
  };

  // Создаем уникальный идентификатор для каждого элемента корзины
  const getItemId = (item: CartItem) => {
    const base = item.selectedVariant
      ? `${item.id}-${item.selectedVariant.id}-${item.selectedImageIndex || 0}`
      : item.id;
    return item.lineMeta ? `${base}::${item.lineMeta}` : base;
  };

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => calculateTotal(), [items]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.4, type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            <Card className="glass-effect shadow-2xl border-primary/20 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between glass-card border-b border-primary/10 rounded-t-2xl">
                <motion.div 
                  className="flex items-center"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <ShoppingBag className="w-6 h-6 text-primary mr-3" />
                  <CardTitle className="text-foreground font-grotesk">
{t.cartTitle} {totalItems > 0 && `(${totalItems})`}
                  </CardTitle>
                </motion.div>
                
                <div className="flex items-center gap-2">


                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      aria-label={language === 'uz' ? 'Savatni yopish' : 'Закрыть корзину'}
                      title={language === 'uz' ? 'Savatni yopish' : 'Закрыть корзину'}
                      className="hover:bg-primary/10 rounded-xl micro-interaction"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardHeader>
              
              <CardContent className="overflow-y-auto max-h-[70vh] p-5 sm:p-8 relative">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={prefersReducedMotion ? undefined : {
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ShoppingBag className="w-20 h-20 text-primary mx-auto mb-6" />
                    </motion.div>
                    <p className="text-muted-foreground text-lg mb-3">{t.emptyCart}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.emptyCartDesc}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="md:hidden sticky top-0 z-10 mb-4 -mx-2 px-2 py-2 bg-gradient-to-b from-background via-background/95 to-transparent">
                      <div className="glass-card rounded-xl border border-primary/15 px-3 py-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === 'uz' ? `Mahsulotlar: ${totalItems}` : `Товаров: ${totalItems}`}
                        </span>
                        <span className="font-semibold text-primary">{formatPrice(totalPrice, t.currency)}</span>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 mb-10 sm:mb-12">
                      <AnimatePresence>
                        {items.map((item, index) => {
                          const itemId = getItemId(item);
                          return (
                            <motion.div
                              key={itemId}
                              initial={{ opacity: 0, x: -50, scale: 0.9 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: 50, scale: 0.9 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 glass-card rounded-2xl border border-primary/10 bg-gradient-to-b from-white/5 to-transparent micro-interaction"
                            >
                              <div className="flex items-start sm:items-center flex-1 w-full">
                                {/* Изображение товара */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mr-4 sm:mr-6 flex-shrink-0 glass-effect">
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-foreground font-grotesk text-lg">
                                      {item.name}
                                      {item.lineMeta && (
                                        <span className="ml-2 text-sm font-normal text-muted-foreground">({item.lineMeta})</span>
                                      )}
                                    </h4>
                                    {/* Бейдж для ротанга */}
                                    {item.category === 'materials' && (
                                      <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                                        {t.minOrder}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Отображение выбранного цвета */}
                                  {item.selectedVariant && (
                                    <div className="flex items-center mt-2 mb-3">
                                      <div
                                        className="w-4 h-4 rounded-full border border-primary/30 mr-3"
                                        style={{ backgroundColor: item.selectedVariant.color }}
                                      />
                                      <span className="text-sm text-primary font-medium">
                                        {getColorName(item.selectedVariant.id)}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                                  
                                  {/* Цена за единицу и итоговая сумма */}
                                  <div className="mt-3 flex flex-col gap-1.5" aria-live="polite">
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-muted-foreground">
                                        {item.category === 'materials' ? t.pricePerKg : t.price}
                                      </span>
                                      <span className="font-medium text-primary">
                                        {formatPrice(getItemPrice(item), t.currency)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Wallet className="w-4 h-4 text-primary" />
                                      <span className="text-base font-semibold text-foreground">
                                        {formatPrice(getItemTotal(item), t.currency)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between sm:justify-start space-x-3 mt-4 sm:mt-0 sm:ml-6 w-full sm:w-auto">
                                {(() => {
                                  // Для ротанга (materials) минимум 5кг, шаг 5кг
                                  // Для кашпо минимум 1шт, шаг 1шт
                                  const isRattan = item.category === 'materials';
                                  const minQuantity = isRattan ? 5 : 1;
                                  const step = isRattan ? 5 : 1;
                                  
                                  return (
                                    <>
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onUpdateQuantity(itemId, Math.max(minQuantity, item.quantity - step))}
                                          aria-label={language === 'uz' ? 'Miqdorni kamaytirish' : 'Уменьшить количество'}
                                          className="glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/10 rounded-xl w-9 h-9 sm:w-10 sm:h-10"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </Button>
                                      </motion.div>
                                      
                                      <motion.span 
                                        className="w-12 text-center font-semibold text-primary text-base sm:text-lg"
                                        key={item.quantity}
                                        initial={{ scale: 1.3 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        {item.quantity}{isRattan ? ' кг' : ''}
                                      </motion.span>
                                      
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onUpdateQuantity(itemId, item.quantity + step)}
                                          aria-label={language === 'uz' ? 'Miqdorni oshirish' : 'Увеличить количество'}
                                          className="glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/10 rounded-xl w-9 h-9 sm:w-10 sm:h-10"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </Button>
                                      </motion.div>
                                    </>
                                  );
                                })()}
                                
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 90 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveItem(itemId)}
                                    aria-label={language === 'uz' ? 'Mahsulotni olib tashlash' : 'Удалить товар'}
                                    className="ml-1 sm:ml-2 hover:text-destructive hover:bg-destructive/10 rounded-xl w-9 h-9 sm:w-10 sm:h-10"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Итоговая сумма заказа */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mb-8 p-5 sm:p-6 glass-card rounded-2xl border-2 border-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Wallet className="w-6 h-6 text-primary" />
                          <span className="text-lg font-semibold text-foreground font-grotesk">
                            {language === 'uz' ? 'Jami summa:' : 'Итого к оплате:'}
                          </span>
                        </div>
                        <motion.div
                          key={totalPrice}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, type: "spring" }}
                          className="text-2xl font-bold text-gradient"
                        >
                          {formatPrice(totalPrice, t.currency)}
                        </motion.div>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground text-center">
                        {language === 'uz' 
                          ? 'Umumiy mahsulotlar: ' + totalItems + ' dona'
                          : 'Общее количество товаров: ' + totalItems + ' шт'}
                      </div>
                    </motion.div>

                    <motion.form
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 }}
                          className="space-y-3"
                        >
                          <Label htmlFor="name" className="text-base">{language === 'uz' ? 'Ismingiz' : 'Имя'} *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoComplete="name"
                            disabled={isSubmitting}
                            className="glass-card border-primary/20 focus:border-primary/40 focus:ring-primary/20 rounded-xl h-12 text-base"
                            placeholder={language === 'uz' ? 'Ismingizni kiriting' : 'Ваше имя'}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 }}
                          className="space-y-3"
                        >
                          <Label htmlFor="phone" className="text-base">{language === 'uz' ? 'Telefon raqam' : 'Телефон'} *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: normalizePhoneInput(e.target.value) })}
                            onFocus={() => {
                              setFormData((prev) => ({
                                ...prev,
                                phone: prev.phone.trim() ? prev.phone : '+998 ',
                              }));
                            }}
                            onBlur={(e) => setFormData({ ...formData, phone: formatUzbekPhone(e.target.value).trim() })}
                            required
                            autoComplete="tel"
                            inputMode="tel"
                            pattern="^\+?[0-9\s\-()]{9,20}$"
                            minLength={9}
                            title={language === 'uz' ? 'To\'g\'ri telefon raqamini kiriting' : 'Введите корректный номер телефона'}
                            disabled={isSubmitting}
                            className="glass-card border-primary/20 focus:border-primary/40 focus:ring-primary/20 rounded-xl h-12 text-base"
                            placeholder={language === 'uz' ? '+998 77 104 44 22' : '+998 77 104 44 22'}
                          />
                        </motion.div>
                      </div>


                      
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="address" className="text-base">{language === 'uz' ? 'Yetkazib berish manzili' : 'Адрес доставки'}</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          autoComplete="street-address"
                          disabled={isSubmitting}
                          className="glass-card border-primary/20 focus:border-primary/40 focus:ring-primary/20 rounded-xl h-12 text-base"
                          placeholder={language === 'uz' ? 'Shahar, ko\'cha, uy, xonadon' : 'Город, улица, дом, квартира'}
                        />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="message" className="text-base">{language === 'uz' ? 'Buyurtmaga izoh' : 'Комментарий к заказу'}</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          autoComplete="off"
                          disabled={isSubmitting}
                          className="glass-card border-primary/20 focus:border-primary/40 focus:ring-primary/20 rounded-xl text-base resize-none"
                          placeholder={language === 'uz' ? 'Maxsus istaklar, yetkazib berish vaqti...' : 'Особые пожелания, время доставки...'}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.82 }}
                        className="space-y-3"
                      >
                        <Label className="text-base">{t.checkoutPayMethod} *</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                              variant={paymentMethod === id ? 'default' : 'outline'}
                              className="rounded-xl h-11 text-sm font-medium"
                              onClick={() => setPaymentMethod(id)}
                              disabled={isSubmitting}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.84 }}
                        className="flex flex-col sm:flex-row gap-2"
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-xl h-11 flex-1"
                          disabled={isSubmitting}
                          onClick={() => {
                            try {
                              const raw = localStorage.getItem(GUEST_PROFILE_KEY);
                              if (!raw) {
                                const n = document.createElement('div');
                                n.className =
                                  'fixed top-4 right-4 z-[100] bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-lg text-sm max-w-xs';
                                n.textContent = pickLang(language, {
                                  uz: 'Avval bitta buyurtma bilan ma’lumotlarni saqlang',
                                  ru: 'Сначала оформите заказ и сохраните данные',
                                  en: 'Complete an order once and save your details',
                                });
                                document.body.appendChild(n);
                                setTimeout(() => n.remove(), 4500);
                                return;
                              }
                              const p = JSON.parse(raw) as {
                                name?: string;
                                phone?: string;
                                address?: string;
                                paymentMethod?: 'uzcard' | 'humo' | 'payme' | 'click';
                              };
                              setFormData((prev) => ({
                                ...prev,
                                name: p.name || prev.name,
                                phone: p.phone || prev.phone,
                                address: p.address || prev.address,
                              }));
                              if (p.paymentMethod) setPaymentMethod(p.paymentMethod);
                              trackEvent('one_click_prefill', {});
                            } catch {
                              /* ignore */
                            }
                          }}
                        >
                          {t.cartOneClick}
                        </Button>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.86 }}
                        className="flex items-start gap-3 p-4 glass-card rounded-xl border border-border/30"
                      >
                        <Checkbox
                          id="remember-profile"
                          checked={rememberProfile}
                          onCheckedChange={(c) => setRememberProfile(c as boolean)}
                          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div>
                          <label htmlFor="remember-profile" className="text-sm font-medium cursor-pointer">
                            {t.profileRememberTitle}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">{t.profileRememberCta}</p>
                        </div>
                      </motion.div>

                      {/* Чекбоксы согласия */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.85 }}
                        className="space-y-4 pt-2"
                      >
                        {/* Обязательное согласие на обработку данных */}
                        <motion.div
                          className="flex items-start space-x-3 p-4 glass-card rounded-xl border border-primary/20"
                          whileHover={{ borderColor: 'rgba(212, 165, 116, 0.4)' }}
                          transition={{ duration: 0.2 }}
                        >
                          <Checkbox
                            id="data-processing"
                            checked={agreeToDataProcessing}
                            onCheckedChange={(checked) => setAgreeToDataProcessing(checked as boolean)}
                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="data-processing"
                              className="text-sm font-medium leading-relaxed cursor-pointer text-foreground flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4 text-primary" />
                              {t.agreeToDataProcessing} *
                            </label>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {pickLang(language, {
                                uz: 'Majburiy rozilik. Buyurtmani qayta ishlash uchun zarur.',
                                ru: 'Обязательное согласие. Необходимо для обработки заказа.',
                                en: 'Required to process your order.',
                              })}
                            </p>
                          </div>
                        </motion.div>

                        {/* Дополнительное согласие на маркетинг */}
                        <motion.div
                          className="flex items-start space-x-3 p-4 glass-card rounded-xl border border-border/30"
                          whileHover={{ borderColor: 'rgba(212, 165, 116, 0.2)' }}
                          transition={{ duration: 0.2 }}
                        >
                          <Checkbox
                            id="marketing"
                            checked={agreeToMarketing}
                            onCheckedChange={(checked) => setAgreeToMarketing(checked as boolean)}
                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="marketing"
                              className="text-sm font-medium leading-relaxed cursor-pointer text-foreground flex items-center gap-2"
                            >
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              {t.agreeToMarketing}
                            </label>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {language === 'uz' 
                                ? 'Yangi mahsulotlar va aksiyalar haqida xabar olish (ixtiyoriy).'
                                : 'Получать уведомления о новых товарах и акциях (необязательно).'
                              }
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="sticky bottom-0 z-10 pt-4 pb-2 bg-gradient-to-t from-background via-background/95 to-transparent"
                      >
                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 micro-interaction neon-glow rounded-2xl h-14 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSubmitting || !agreeToDataProcessing || !paymentMethod}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-3"
                              />
                              {pickLang(language, {
                                uz: 'Buyurtma qayta ishlanmoqda...',
                                ru: 'Обрабатываем заказ...',
                                en: 'Processing order...',
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <CheckCircle className="w-5 h-5" />
                              <span>
                                {pickLang(language, {
                                  uz: 'Buyurtma berish',
                                  ru: 'Оформить заказ',
                                  en: 'Place order',
                                })}
                              </span>
                              <span className="px-3 py-1 bg-primary-foreground/20 rounded-lg font-bold">
                                {formatPrice(totalPrice, t.currency)}
                              </span>
                            </div>
                          )}
                        </Button>
                      </motion.div>

                      {/* Информация о доставке */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 1 }}
                        className="text-sm text-muted-foreground text-center mt-6 p-6 glass-card rounded-xl border border-primary/10 leading-relaxed"
                      >
                        📱 {language === 'uz' ? 'Buyurtmangiz Telegramga yuboriladi va biz siz bilan bog\'lanamiz' : 'Ваш заказ будет отправлен в Telegram, и мы свяжемся с вами для уточнения деталей'}.
                        <br /><br />
                        🚚 {language === 'uz' ? 'Toshkent bo\'ylab 1-2 kun ichida yetkazib berish. O\'zbekiston bo\'ylab transport kompaniyasi orqali' : 'Доставка по Ташкенту в течение 1-2 дней. По Узбекистану через ТК'}.
                      </motion.div>
                    </motion.form>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}