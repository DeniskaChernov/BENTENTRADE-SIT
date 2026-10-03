import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Upload, Database, CheckCircle, AlertCircle, Loader2 } from '../utils/lucide-stub';
import { migrateProductsToDatabase, type Product } from '../utils/useProducts';

interface ProductMigrationToolProps {
  productsData: Product[];
  onMigrationComplete?: () => void;
}

export function ProductMigrationTool({ productsData, onMigrationComplete }: ProductMigrationToolProps) {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleMigration = async () => {
    setStatus('migrating');
    setMessage('Миграция данных в базу данных...');

    try {
      const success = await migrateProductsToDatabase(productsData);
      
      if (success) {
        setStatus('success');
        setMessage(`✅ Успешно мигрировано ${productsData.length} товаров в базу данных!`);
        onMigrationComplete?.();
      } else {
        setStatus('error');
        setMessage('❌ Ошибка при миграции данных. Проверьте консоль для деталей.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          <div>
            <CardTitle className="text-2xl">Миграция данных каталога</CardTitle>
            <CardDescription className="mt-2">
              Перенос товаров из статического кода в базу данных Supabase
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Товаров для миграции</div>
            <div className="text-3xl font-bold text-primary">{productsData.length}</div>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Статус</div>
            <div className="flex items-center gap-2 mt-1">
              {status === 'idle' && <Badge variant="secondary">Готов к миграции</Badge>}
              {status === 'migrating' && <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Миграция...</Badge>}
              {status === 'success' && <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Завершено</Badge>}
              {status === 'error' && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Ошибка</Badge>}
            </div>
          </div>
        </div>

        {message && (
          <Alert variant={status === 'error' ? 'destructive' : 'default'} className={status === 'success' ? 'border-green-500 bg-green-50' : ''}>
            {status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {status === 'error' && <AlertCircle className="h-4 w-4" />}
            {status === 'migrating' && <Loader2 className="h-4 w-4 animate-spin" />}
            <AlertTitle className={status === 'success' ? 'text-green-800' : ''}>
              {status === 'success' ? 'Успешно!' : status === 'error' ? 'Ошибка' : 'Выполняется...'}
            </AlertTitle>
            <AlertDescription className={status === 'success' ? 'text-green-700' : ''}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Что будет мигрировано:
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Все товары из каталога</li>
            <li>• Цветовые варианты и изображения</li>
            <li>• Размеры и характеристики</li>
            <li>• Категории и описания</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleMigration} 
          disabled={status === 'migrating' || status === 'success'}
          className="w-full"
          size="lg"
        >
          {status === 'migrating' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
          {status === 'idle' && <Database className="mr-2 h-4 w-4" />}
          {status === 'success' ? 'Миграция завершена' : status === 'migrating' ? 'Миграция...' : 'Начать миграцию'}
        </Button>
      </CardFooter>
    </Card>
  );
}
