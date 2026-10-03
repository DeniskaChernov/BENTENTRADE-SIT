import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  Settings, 
  Package, 
  Database, 
  Trash2, 
  Edit, 
  Eye,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from '../utils/lucide-stub';
import { useProducts, type Product } from '../utils/useProducts';
import { ProductMigrationTool } from './ProductMigrationTool';

interface AdminPanelProps {
  onClose: () => void;
  initialProducts?: Product[]; // Для миграции
}

export function AdminPanel({ onClose, initialProducts = [] }: AdminPanelProps) {
  const { products, loading, error, fetchProducts, deleteProduct } = useProducts();
  const [showMigration, setShowMigration] = useState(initialProducts.length > 0 && products.length === 0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    setDeletingId(id);
    const success = await deleteProduct(id);
    setDeletingId(null);
    
    if (success) {
      alert('✅ Товар успешно удалён');
    } else {
      alert('❌ Ошибка при удалении товара');
    }
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const handleMigrationComplete = () => {
    setShowMigration(false);
    fetchProducts();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Панель администратора</CardTitle>
                <CardDescription>Управление каталогом товаров</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue={showMigration ? "migration" : "products"} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">
                <Package className="w-4 h-4 mr-2" />
                Товары ({products.length})
              </TabsTrigger>
              <TabsTrigger value="migration">
                <Database className="w-4 h-4 mr-2" />
                Миграция
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Settings className="w-4 h-4 mr-2" />
                Статистика
              </TabsTrigger>
            </TabsList>

            {/* Вкладка: Товары */}
            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Список товаров</h3>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить
                </Button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Загрузка товаров...</span>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ошибка загрузки</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!loading && !error && products.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Товаров нет</AlertTitle>
                  <AlertDescription>
                    База данных пуста. Используйте вкладку "Миграция" для загрузки товаров.
                  </AlertDescription>
                </Alert>
              )}

              {!loading && !error && products.length > 0 && (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="flex">
                        {/* Изображение */}
                        <div className="w-32 h-32 flex-shrink-0">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Информация */}
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{product.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                              
                              <div className="flex gap-2 mt-3 flex-wrap">
                                <Badge variant="outline">{product.category}</Badge>
                                {product.size && <Badge variant="secondary">{product.size}</Badge>}
                                {product.style && <Badge variant="secondary">{product.style}</Badge>}
                                {product.variants && (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    {product.variants.length} цветов
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Действия */}
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Просмотр"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Редактировать"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                title="Удалить"
                                className="text-destructive hover:text-destructive"
                              >
                                {deletingId === product.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Размеры */}
                          {product.dimensions && (
                            <div className="mt-3 text-sm text-muted-foreground">
                              📏 Размеры: {product.dimensions.height}мм × ⌀{product.dimensions.diameter}мм
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Вкладка: Миграция */}
            <TabsContent value="migration" className="space-y-4">
              {products.length > 0 ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">База данных заполнена</AlertTitle>
                  <AlertDescription className="text-green-700">
                    В базе данных уже есть {products.length} товаров. Миграция не требуется.
                  </AlertDescription>
                </Alert>
              ) : initialProducts.length > 0 ? (
                <ProductMigrationTool 
                  productsData={initialProducts}
                  onMigrationComplete={handleMigrationComplete}
                />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Нет данных для миграции</AlertTitle>
                  <AlertDescription>
                    Данные для миграции не найдены. Загрузите товары вручную или через API.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Вкладка: Статистика */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Всего товаров</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{products.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Категорий</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {new Set(products.map(p => p.category)).size}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Цветовых вариантов</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {products.reduce((sum, p) => sum + (p.variants?.length || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Распределение по категориям</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(
                    products.reduce((acc, p) => {
                      acc[p.category] = (acc[p.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="font-medium">{category}</span>
                      <Badge>{count} товаров</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
