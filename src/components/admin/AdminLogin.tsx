import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Lock, Shield, Eye, EyeOff, AlertCircle } from '../../utils/lucide-stub';
import { API_BASE_URL, API_TOKEN } from '../../utils/env';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (session: { token: string }) => void;
}

export function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 30000; // 30 секунд

  const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
    // Создаем кастомное уведомление
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[9999] transition-all duration-300 max-w-sm ${
      type === 'success' 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      showNotification('Вход заблокирован. Попробуйте позже.');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'X-Admin-Password': password,
        },
        body: JSON.stringify({}),
      });
      const result = await response.json().catch(() => ({}));

      if (response.status === 429) {
        showNotification(String(result.error || 'Слишком много попыток входа. Повторите позже.'));
        setPassword('');
        return;
      }

      if (!response.ok || !result.success || !result.token) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          showNotification(`Превышено количество попыток. Доступ заблокирован на ${LOCKOUT_TIME / 1000} секунд.`);

          setTimeout(() => {
            setIsLocked(false);
            setAttempts(0);
          }, LOCKOUT_TIME);
        } else {
          showNotification(
            String(result.error || `Неверный пароль. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`),
          );
        }
        setPassword('');
        return;
      }

      showNotification('Добро пожаловать в админ-панель!', 'success');
      setPassword('');
      setAttempts(0);
      onLogin({ token: result.token });
    } catch {
      showNotification('Не удалось связаться с сервером.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPassword('');
      setAttempts(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="admin-login-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
            Вход в админ-панель
          </DialogTitle>
          <DialogDescription id="admin-login-description" className="text-center">
            Введите пароль администратора для доступа к панели управления сайтом
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Предупреждение о безопасности */}
          <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Доступ только для авторизованного персонала</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Пароль администратора
              </label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль..."
                  disabled={isLoading || isLocked}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isLocked}
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Индикатор попыток */}
            {attempts > 0 && !isLocked && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span>Неверных попыток: {attempts} из {MAX_ATTEMPTS}</span>
              </div>
            )}

            {/* Индикатор блокировки */}
            {isLocked && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                <Lock className="w-4 h-4" />
                <span>Вход временно заблокирован</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={!password || isLoading || isLocked}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-xs text-center text-muted-foreground border-t pt-4">
            💡 Пароль проверяется на сервере Railway
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}