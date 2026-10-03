import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { X, MessageCircle, CheckCircle, AlertCircle, ExternalLink, Copy, RefreshCw, Phone } from '../utils/lucide-stub';
import { API_BASE_URL, API_TOKEN } from '../utils/env';

interface TelegramSetupHelperProps {
  isOpen: boolean;
  onClose: () => void;
  error?: any;
}

export function TelegramSetupHelper({ isOpen, onClose, error }: TelegramSetupHelperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableChats, setAvailableChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [testResults, setTestResults] = useState<Map<string, boolean>>(new Map());

  const BOT_USERNAME = '@zayavkassayta_bententrade_bot';
  const CURRENT_CHAT_ID = '';

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] glass-effect ${
      type === 'success' ? 'border-green-400/20 text-green-400' : 'border-red-400/20 text-red-400'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  };

  const checkTelegramStatus = async () => {
    setIsLoading(true);
    try {
      // Используем наш серверный endpoint для получения чатов
      const response = await fetch(`${API_BASE_URL}/telegram/chats`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success && data.chats && data.chats.length > 0) {
        setAvailableChats(data.chats);
        showNotification(`✅ Найдено ${data.chats.length} чатов!`, 'success');
        
        // Проверяем, есть ли текущий Chat ID в списке
        const currentChatExists = data.chats.some((chat: any) => String(chat.id) === CURRENT_CHAT_ID);
        
        if (!currentChatExists) {
          showNotification(`⚠️ Текущий Chat ID (${CURRENT_CHAT_ID}) не найден в доступных чатах!`, 'error');
        }
      } else if (data.success && data.chats && data.chats.length === 0) {
        setAvailableChats([]);
        showNotification('Нет активных чатов. Нажмите START в боте или добавьте бота в группу!', 'error');
      } else {
        showNotification('Ошибка при получении чатов: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error checking Telegram:', error);
      showNotification('Ошибка при проверке Telegram', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testChatId = async (chatId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/telegram/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          chatId,
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResults(new Map(testResults.set(chatId, true)));
        setSelectedChatId(chatId);
        showNotification('✅ Тестовое сообщение отправлено!', 'success');
        return true;
      } else {
        setTestResults(new Map(testResults.set(chatId, false)));
        showNotification('❌ Ошибка: ' + (data.error || 'Не удалось отправить тест'), 'error');
        return false;
      }
    } catch (error) {
      showNotification('Ошибка при тестировании', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('📋 Скопировано!', 'success');
  };

  useEffect(() => {
    if (isOpen) {
      checkTelegramStatus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="glass-effect border-primary/20 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Настройка Telegram</h2>
                    <p className="text-sm text-muted-foreground">Автоматическая настройка за 30 секунд</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Big Action Button for Quick Fix */}
              {error && (
                <div className="mb-6 space-y-4">
                  <Alert className="border-red-400/20 bg-red-400/5">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <AlertDescription>
                      <strong className="text-red-400 text-lg">
                        ❌ Ошибка: {error.chatType === 'group' ? 'Группа не найдена' : 'Чат не найден'}
                      </strong>
                      <div className="mt-3 text-sm opacity-90">
                        <strong>Настроенный Chat ID:</strong> <code className="ml-2 px-2 py-1 bg-black/20 rounded font-mono">{CURRENT_CHAT_ID}</code>
                        <span className="ml-2 text-xs opacity-70">
                          {CURRENT_CHAT_ID.startsWith('-100') ? '(Групповой чат)' : '(Личный чат)'}
                        </span>
                      </div>
                      <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                        <div className="font-semibold text-primary mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          ⚠️ ВАЖНО: Chat ID может измениться!
                        </div>
                        <div className="text-xs space-y-1 opacity-90">
                          <p>• Если группа была пересоздана - ID изменился</p>
                          <p>• Если бот был удален и добавлен заново - нужно обновить ID</p>
                          <p>• Используйте кнопку ниже для автоматического определения правильного ID</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Big prominent button */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={checkTelegramStatus}
                      disabled={isLoading}
                      className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 neon-glow"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                          Поиск чатов...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5 mr-3" />
                          🔍 Найти правильный Chat ID автоматически
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-4 mb-6">
                {CURRENT_CHAT_ID.startsWith('-100') ? (
                  // Инструкции для группового чата
                  <>
                    <div className="p-4 glass-card rounded-xl border border-primary/30 bg-primary/5">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                        👥 Групповой чат: Инструкция
                      </h3>
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-2">
                          <span className="font-bold text-primary">1.</span>
                          <div>
                            <div className="font-medium">Откройте вашу группу/канал</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Перейдите в группу или канал, куда должны приходить заказы
                            </div>
                          </div>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-primary">2.</span>
                          <div>
                            <div className="font-medium">Добавьте бота в группу</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Нажмите: Добавить участников → Найдите <code className="px-1 bg-black/20 rounded">{BOT_USERNAME}</code>
                            </div>
                          </div>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-primary">3.</span>
                          <div>
                            <div className="font-medium">Дайте боту права администратора</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Права → Администраторы → Добавить → Включите "Публикация сообщений"
                            </div>
                          </div>
                        </li>
                      </ol>
                      <Button
                        onClick={() => window.open('https://web.telegram.org/', '_blank')}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Протестировать отправку
                      </Button>
                    </div>
                  </>
                ) : (
                  // Инструкции для личного чата
                  <div className="p-4 glass-card rounded-xl border border-primary/10">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      📱 Шаг 1: Откройте бота
                    </h3>
                    <Button
                      onClick={() => window.open('https://t.me/zayavkassayta_bententrade_bot', '_blank')}
                      className="w-full justify-between h-auto py-3 px-4"
                      variant="outline"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Открыть {BOT_USERNAME}
                      </div>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      → Нажмите START в Telegram
                    </p>
                  </div>
                )}

                {/* Шаг 2 только для личного чата */}
                {!CURRENT_CHAT_ID.startsWith('-100') && (
                  <div className="p-4 glass-card rounded-xl border border-primary/10">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      🔄 Шаг 2: Обновите список чатов
                    </h3>
                    <Button
                      onClick={checkTelegramStatus}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Проверка...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Обновить список чатов
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* No Chats Found Warning */}
              {!isLoading && availableChats.length === 0 && !error && (
                <Alert className="mb-6 border-primary/30 bg-primary/5">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <AlertDescription>
                    <strong className="text-primary text-base">
                      😕 Доступные чаты не найдены
                    </strong>
                    <div className="mt-3 space-y-3 text-sm">
                      <p className="opacity-90">
                        Это означает, что бот еще не получал сообщений. Выполните одно из действий:
                      </p>
                      
                      <div className="p-3 bg-black/20 rounded-lg space-y-2">
                        <div className="font-semibold text-primary">Для личного чата:</div>
                        <ol className="list-decimal list-inside space-y-1 text-xs opacity-90 ml-2">
                          <li>Откройте @zayavkassayta_bententrade_bot в Telegram</li>
                          <li>Нажмите кнопку START</li>
                          <li>Вернитесь сюда и нажмите "Обновить список чатов"</li>
                        </ol>
                      </div>

                      <div className="p-3 bg-black/20 rounded-lg space-y-2">
                        <div className="font-semibold text-primary">Для группового чата:</div>
                        <ol className="list-decimal list-inside space-y-1 text-xs opacity-90 ml-2">
                          <li>Откройте вашу группу в Telegram</li>
                          <li>Добавьте @zayavkassayta_bententrade_bot</li>
                          <li>Сделайте бота администратором</li>
                          <li>Отправьте любое сообщение в группу</li>
                          <li>Подождите 10 секунд</li>
                          <li>Вернитесь сюда и нажмите "Обновить список чатов"</li>
                        </ol>
                      </div>

                      <Button
                        onClick={() => window.open('https://t.me/zayavkassayta_bententrade_bot', '_blank')}
                        className="w-full mt-3 rounded-xl"
                        variant="outline"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Открыть бота в Telegram
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Available Chats */}
              {availableChats.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    ✅ Найдено чатов: {availableChats.length}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Нажмите "Тест" чтобы проверить куда придет сообщение, затем скопируйте правильный Chat ID
                  </p>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableChats.map((chat) => {
                      const isSelected = selectedChatId === String(chat.id);
                      const testResult = testResults.get(String(chat.id));
                      const isCurrentChat = String(chat.id) === CURRENT_CHAT_ID;
                      
                      return (
                        <div
                          key={chat.id}
                          className={`p-4 glass-card rounded-xl border transition-all ${
                            isSelected
                              ? 'border-green-400/40 bg-green-400/5'
                              : isCurrentChat
                              ? 'border-primary/40 bg-primary/5'
                              : 'border-primary/10 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                {chat.title}
                                {testResult === true && (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                )}
                                {isCurrentChat && (
                                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                                    Текущий
                                  </span>
                                )}
                              </div>
                              <div className="text-sm opacity-70">
                                ID: <code className="px-1.5 py-0.5 bg-black/20 rounded">{chat.id}</code>
                                {' • '}
                                <span className="capitalize">{chat.type}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testChatId(String(chat.id))}
                                disabled={isLoading}
                                className="rounded-xl"
                              >
                                Тест
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(String(chat.id))}
                                className="rounded-xl"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {selectedChatId && (
                <Alert className="border-green-400/20 bg-green-400/5">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <AlertDescription>
                    <strong className="text-green-400">✅ Chat ID работает!</strong>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="p-3 bg-black/20 rounded-lg">
                        <strong>Финальный шаг:</strong>
                        <ol className="mt-2 space-y-1 list-decimal list-inside opacity-90">
                          <li>Скопируйте Chat ID: <code className="px-1 py-0.5 bg-black/30 rounded">{selectedChatId}</code></li>
                          <li>Откройте Railway проект</li>
                          <li>Перейдите в Variables</li>
                          <li>Найдите <code>TELEGRAM_CHAT_ID</code></li>
                          <li>Вставьте новый ID → Save</li>
                        </ol>
                      </div>
                      <Button
                        onClick={() => {
                          copyToClipboard(selectedChatId);
                          window.open('https://railway.com/project', '_blank');
                        }}
                        className="w-full rounded-xl"
                      >
                        Скопировать ID и открыть Railway
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Help */}
              <div className="mt-6 p-4 glass-card rounded-xl border border-primary/10">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Важно знать
                </h4>
                <ul className="text-xs space-y-1 opacity-80 list-disc list-inside">
                  <li>Для групповых чатов: добавьте бота и сделайте администратором</li>
                  <li>Для личных чатов: просто нажмите START в боте</li>
                  <li>После обновления Chat ID перезагрузите сайт</li>
                  <li>Горячая клавиша для этого окна: <kbd className="px-1 py-0.5 bg-black/20 rounded">Ctrl+Shift+T</kbd></li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}