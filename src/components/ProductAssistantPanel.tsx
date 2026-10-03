import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MessageCircle, Send, Sparkles } from '../utils/lucide-stub';
import type { Language } from '../utils/language-context';
import { pickLang } from '../utils/language-context';
import {
  ASSISTANT_PROFILE_COPY,
  ASSISTANT_WIDTH_COPY,
  pickAssistantText,
} from '../data/productAssistantKnowledge';
import { API_BASE_URL } from '../utils/env';

type ChatLine = { role: 'user' | 'assistant'; text: string };

interface ProductAssistantPanelProps {
  language: Language;
  productTitle: string;
  profileKey: string;
  /** Для кашпо не показываем выбор мм */
  showWidthHints: boolean;
  selectedWidthMm: number | null;
  onWidthExplainRequest?: () => void;
}

export function ProductAssistantPanel({
  language,
  productTitle,
  profileKey,
  showWidthHints,
  selectedWidthMm,
  onWidthExplainRequest,
}: ProductAssistantPanelProps) {
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingWidthPrompt, setPendingWidthPrompt] = useState(false);

  const pushAssistant = useCallback((text: string) => {
    setLines((prev) => [...prev, { role: 'assistant', text }]);
  }, []);

  const explainProfile = useCallback(() => {
    const block = ASSISTANT_PROFILE_COPY[profileKey] || ASSISTANT_PROFILE_COPY.planter;
    pushAssistant(pickAssistantText(language, block));
  }, [language, profileKey, pushAssistant]);

  const explainWidth = useCallback(() => {
    if (!selectedWidthMm) return;
    const key = String(selectedWidthMm);
    const block = ASSISTANT_WIDTH_COPY[key];
    if (block) pushAssistant(pickAssistantText(language, block));
    else
      pushAssistant(
        pickLang(language, {
          ru: `Толщина ${selectedWidthMm} мм: подробности уточняйте у менеджера — партии могут отличаться.`,
          uz: `${selectedWidthMm} mm: tafsilotlar uchun menejer bilan bog‘laning.`,
          en: `${selectedWidthMm} mm: ask us for batch-specific details.`,
        }),
      );
    setPendingWidthPrompt(false);
    onWidthExplainRequest?.();
  }, [language, selectedWidthMm, pushAssistant, onWidthExplainRequest]);

  const sendFreeQuestion = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setLines((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/public/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          language,
          context: { productTitle, profileKey, widthMm: selectedWidthMm },
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        typeof data?.reply === 'string' && data.reply
          ? data.reply
          : pickLang(language, {
              ru: 'Пока ответ по шаблону. Подключите ИИ в `server.js` (OPENAI) или допишите логику.',
              uz: 'Hozircha shablon javob. `server.js` da IIni ulang.',
              en: 'Stub reply. Wire your model in server.js.',
            });
      setLines((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setLines((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: pickLang(language, {
            ru: 'Не удалось связаться с сервером. Напишите в Telegram или позвоните.',
            uz: 'Serverga ulanib bo‘lmadi. Telegram yoki telefon.',
            en: 'Could not reach the server. Try Telegram or phone.',
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, language, productTitle, profileKey, selectedWidthMm]);

  return (
    <aside className="flex flex-col rounded-2xl border border-primary/20 bg-card/50 p-4 shadow-sm backdrop-blur-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]">
      <div className="mb-3 flex items-center gap-2 border-b border-primary/10 pb-3">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-semibold font-grotesk">
            {pickLang(language, { ru: 'Ассистент', uz: 'Yordamchi', en: 'Assistant' })}
          </p>
          <p className="text-xs text-muted-foreground">
            {pickLang(language, {
              ru: 'Подсказки по профилю и толщине + ваш вопрос',
              uz: 'Profil va qalinlik + savolingiz',
              en: 'Profile & width tips + your question',
            })}
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-full text-xs" onClick={explainProfile}>
          {pickLang(language, {
            ru: 'Чем отличается этот профиль?',
            uz: 'Bu profil nimasi bilan farq qiladi?',
            en: 'How is this profile different?',
          })}
        </Button>
        {showWidthHints && selectedWidthMm && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 rounded-full text-xs"
            onClick={() => setPendingWidthPrompt(true)}
          >
            {pickLang(language, {
              ru: `Про ${selectedWidthMm} мм`,
              uz: `${selectedWidthMm} mm haqida`,
              en: `About ${selectedWidthMm} mm`,
            })}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {pendingWidthPrompt && selectedWidthMm && (
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 4 }}
            className="mb-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm"
          >
            <p className="mb-2 flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {pickLang(language, {
                ru: `Рассказать преимущества ${selectedWidthMm} мм для вашего выбора?`,
                uz: `${selectedWidthMm} mm afzalliklarini aytaymi?`,
                en: `Explain benefits of ${selectedWidthMm} mm?`,
              })}
            </p>
            <div className="flex gap-2">
              <Button type="button" size="sm" className="h-8 rounded-lg" onClick={explainWidth}>
                {pickLang(language, { ru: 'Да', uz: 'Ha', en: 'Yes' })}
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => setPendingWidthPrompt(false)}>
                {pickLang(language, { ru: 'Не сейчас', uz: 'Keyinroq', en: 'Not now' })}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-[140px] flex-1 space-y-2 overflow-y-auto rounded-xl border border-border/40 bg-background/40 p-2 text-sm">
        {lines.length === 0 && (
          <p className="p-2 text-xs text-muted-foreground">
            {pickLang(language, {
              ru: 'Нажмите кнопку выше или опишите задачу — ответ сформируется из базы знаний и (после настройки) ИИ.',
              uz: 'Yuqoridagi tugma yoki vazifani yozing — javob bazadan va (sozlangach) IIdan.',
              en: 'Use the chips above or type — answers use the knowledge base and (when configured) AI.',
            })}
          </p>
        )}
        <AnimatePresence initial={false}>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={reduce ? undefined : { opacity: 0, x: line.role === 'user' ? 8 : -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-lg px-3 py-2 ${line.role === 'user' ? 'ml-4 bg-primary/15 text-right' : 'mr-4 bg-muted/40'}`}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-3 space-y-2 border-t border-primary/10 pt-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pickLang(language, {
            ru: 'Ваш вопрос или описание задачи…',
            uz: 'Savolingiz yoki vazifa…',
            en: 'Your question…',
          })}
          className="min-h-[72px] resize-none rounded-xl text-sm"
          disabled={loading}
        />
        <Button type="button" className="w-full gap-2 rounded-xl" disabled={loading || !input.trim()} onClick={sendFreeQuestion}>
          <Send className="h-4 w-4" />
          {loading
            ? pickLang(language, { ru: '…', uz: '…', en: '…' })
            : pickLang(language, { ru: 'Спросить', uz: 'So‘rash', en: 'Ask' })}
        </Button>
      </div>
    </aside>
  );
}
