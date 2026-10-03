import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  LogOut, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  Bell,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Search,
  Copy,
  LayoutGrid,
  List,
  Maximize2,
  FileText,
} from '../../utils/lucide-stub';
import { API_BASE_URL, API_TOKEN } from '../../utils/env';
import { TelegramStatusIndicator } from '../TelegramStatusIndicator';
import { DataLoader } from '../DataLoader';

interface OrderItem {
  name: string;
  quantity: number;
  variant?: string;
  size?: string;
  style?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  language: 'uz' | 'ru';
  createdAt: string;
  updatedAt: string;
  telegramMessageId?: string;
}

interface Stats {
  totalOrders: number;
  activeOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  archivedOrders: number;
}

interface AdminPanelProps {
  onExit: () => void;
  adminToken: string;
}

interface CmsProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  updatedAt?: string;
}

interface CmsPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt?: string;
  tag?: Record<string, string>;
  content?: unknown;
}

export default function AdminPanel({ onExit, adminToken }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [sortDirection, setSortDirection] = useState<'newest' | 'oldest'>('newest');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [dbHealthy, setDbHealthy] = useState(true);
  const [dbWarning, setDbWarning] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<'database' | 'in-memory'>('database');
  const [cmsProducts, setCmsProducts] = useState<CmsProduct[]>([]);
  const [cmsPosts, setCmsPosts] = useState<CmsPost[]>([]);
  const [productForm, setProductForm] = useState({
    id: '',
    title: '',
    slug: '',
    description: '',
    image: '',
    category: 'kashpo',
    price: 0,
    status: 'draft',
  });
  const [postForm, setPostForm] = useState({
    id: '',
    title: '',
    slug: '',
    description: '',
    image: '',
    status: 'draft',
  });
  const [roles, setRoles] = useState<Array<{ code: string; title: string; rank: number }>>([]);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; entity_type: string; entity_id: string; actor: string; created_at: string }>>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [postStatusFilter, setPostStatusFilter] = useState('all');
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [isProductDropActive, setIsProductDropActive] = useState(false);
  const [isPostDropActive, setIsPostDropActive] = useState(false);
  const [cmsProductsView, setCmsProductsView] = useState<'list' | 'kanban'>('list');
  const [cmsPostsView, setCmsPostsView] = useState<'list' | 'kanban'>('list');
  const [previewProduct, setPreviewProduct] = useState<CmsProduct | null>(null);
  const [previewPost, setPreviewPost] = useState<CmsPost | null>(null);

  // Загрузка данных
  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Загружаем заказы и статистику параллельно
      const [ordersResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
          },
        }),
        fetch(`${API_BASE_URL}/stats`, {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
          },
        }),
      ]);

      if (ordersResponse.ok && statsResponse.ok) {
        const ordersData = await ordersResponse.json();
        const statsData = await statsResponse.json();
        
        // Определяем режим хранилища
        const mode = ordersData.storageMode || statsData.storageMode || 'database';
        setStorageMode(mode);
        
        // Проверяем наличие ошибок (не warnings)
        if (ordersData.error || statsData.error) {
          const error = ordersData.error || statsData.error;
          setDbHealthy(false);
          setDbWarning(error);
          showNotification(error, 'error');
        } else {
          // Всё работает нормально - режим in-memory это не ошибка!
          setDbHealthy(true);
          setDbWarning(null);
        }
        
        setOrders(ordersData.orders || []);
        setStats(statsData.stats);
      } else {
        throw new Error('Не удалось загрузить данные');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setDbHealthy(false);
      setStorageMode('in-memory');
      setDbWarning('Не удалось подключиться к серверу');
      showNotification(
        'Ошибка подключения к серверу. Проверьте интернет-соединение.',
        'error'
      );
      // Устанавливаем пустые значения по умолчанию
      setOrders([]);
      setStats({
        totalOrders: 0,
        activeOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        archivedOrders: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const adminHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
      'X-Admin-Token': adminToken,
    }),
    [adminToken],
  );

  const fetchCmsData = async () => {
    try {
      const productParams = new URLSearchParams();
      if (productSearch.trim()) productParams.set('q', productSearch.trim());
      if (productStatusFilter !== 'all') productParams.set('status', productStatusFilter);
      productParams.set('limit', '200');
      const postParams = new URLSearchParams();
      if (postSearch.trim()) postParams.set('q', postSearch.trim());
      if (postStatusFilter !== 'all') postParams.set('status', postStatusFilter);
      postParams.set('limit', '200');
      const [productsRes, postsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/products?${productParams.toString()}`, { headers: adminHeaders }),
        fetch(`${API_BASE_URL}/admin/blog?${postParams.toString()}`, { headers: adminHeaders }),
      ]);
      if (productsRes.ok) {
        const data = await productsRes.json();
        setCmsProducts(data.products || []);
      }
      if (postsRes.ok) {
        const data = await postsRes.json();
        setCmsPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching CMS data:', error);
    }
  };

  const cmsEntityStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Черновик',
      published: 'Опубликовано',
      archived: 'Архив',
    };
    return labels[status] || status;
  };

  const putProductUpdate = async (
    item: CmsProduct,
    patch: Partial<CmsProduct>,
    opts?: { silent?: boolean },
  ) => {
    const merged = { ...item, ...patch };
    const res = await fetch(`${API_BASE_URL}/admin/products/${item.id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify(merged),
    });
    if (!res.ok) {
      showNotification('Не удалось сохранить товар', 'error');
      return;
    }
    if (!opts?.silent) showNotification('Товар сохранён', 'success');
    fetchCmsData();
  };

  const putPostUpdate = async (item: CmsPost, patch: Partial<CmsPost>, opts?: { silent?: boolean }) => {
    const merged = { ...item, ...patch };
    const res = await fetch(`${API_BASE_URL}/admin/blog/${item.id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        ...merged,
        content: merged.content ?? {},
        tag: merged.tag ?? { ru: 'Новость', uz: 'Yangilik' },
      }),
    });
    if (!res.ok) {
      showNotification('Не удалось сохранить статью', 'error');
      return;
    }
    if (!opts?.silent) showNotification('Статья сохранена', 'success');
    fetchCmsData();
  };

  const productsByStatus = useMemo(() => {
    const groups: Record<CmsProduct['status'], CmsProduct[]> = {
      draft: [],
      published: [],
      archived: [],
    };
    for (const p of cmsProducts) {
      const s = p.status in groups ? p.status : 'draft';
      groups[s].push(p);
    }
    return groups;
  }, [cmsProducts]);

  const postsByStatus = useMemo(() => {
    const groups: Record<CmsPost['status'], CmsPost[]> = {
      draft: [],
      published: [],
      archived: [],
    };
    for (const p of cmsPosts) {
      const s = p.status in groups ? p.status : 'draft';
      groups[s].push(p);
    }
    return groups;
  }, [cmsPosts]);

  const fetchSecurityData = async () => {
    try {
      const [rolesRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/roles`, { headers: adminHeaders }),
        fetch(`${API_BASE_URL}/admin/audit`, { headers: adminHeaders }),
      ]);
      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(data.roles || []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    }
  };

  const saveProduct = async () => {
    const isEdit = Boolean(productForm.id);
    const url = isEdit ? `${API_BASE_URL}/admin/products/${productForm.id}` : `${API_BASE_URL}/admin/products`;
    const method = isEdit ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: adminHeaders,
      body: JSON.stringify(productForm),
    });
    if (!response.ok) {
      showNotification('Ошибка сохранения товара', 'error');
      return;
    }
    showNotification(isEdit ? 'Товар обновлён' : 'Товар создан', 'success');
    setProductForm({ id: '', title: '', slug: '', description: '', image: '', category: 'kashpo', price: 0, status: 'draft' });
    fetchCmsData();
  };

  const savePost = async () => {
    const isEdit = Boolean(postForm.id);
    const url = isEdit ? `${API_BASE_URL}/admin/blog/${postForm.id}` : `${API_BASE_URL}/admin/blog`;
    const method = isEdit ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: adminHeaders,
      body: JSON.stringify({ ...postForm, content: { ru: [], uz: [] }, tag: { ru: 'Новость', uz: 'Yangilik' } }),
    });
    if (!response.ok) {
      showNotification('Ошибка сохранения статьи', 'error');
      return;
    }
    showNotification(isEdit ? 'Статья обновлена' : 'Статья создана', 'success');
    setPostForm({ id: '', title: '', slug: '', description: '', image: '', status: 'draft' });
    fetchCmsData();
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    const toDataUrl = (blob: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    try {
      const dataUrl = await toDataUrl(file);
      const res = await fetch(`${API_BASE_URL}/admin/media/upload`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const togglePostSelection = (id: string) => {
    setSelectedPostIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const bulkPublishProducts = async () => {
    if (!selectedProductIds.length) return;
    await Promise.all(
      selectedProductIds.map((id) =>
        fetch(`${API_BASE_URL}/admin/products/${id}/publish`, { method: 'POST', headers: adminHeaders }),
      ),
    );
    showNotification(`Опубликовано товаров: ${selectedProductIds.length}`, 'success');
    setSelectedProductIds([]);
    fetchCmsData();
  };

  const bulkPublishPosts = async () => {
    if (!selectedPostIds.length) return;
    await Promise.all(
      selectedPostIds.map((id) =>
        fetch(`${API_BASE_URL}/admin/blog/${id}/publish`, { method: 'POST', headers: adminHeaders }),
      ),
    );
    showNotification(`Опубликовано статей: ${selectedPostIds.length}`, 'success');
    setSelectedPostIds([]);
    fetchCmsData();
  };

  useEffect(() => {
    const productDraft = localStorage.getItem('admin-product-draft');
    const postDraft = localStorage.getItem('admin-post-draft');
    if (productDraft) {
      try {
        setProductForm(JSON.parse(productDraft));
      } catch {
        // ignore broken draft
      }
    }
    if (postDraft) {
      try {
        setPostForm(JSON.parse(postDraft));
      } catch {
        // ignore broken draft
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-product-draft', JSON.stringify(productForm));
  }, [productForm]);

  useEffect(() => {
    localStorage.setItem('admin-post-draft', JSON.stringify(postForm));
  }, [postForm]);

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
            : order
        ));
        
        // Показываем уведомление
        showNotification(`Статус заказа ${orderId} изменен на "${getStatusLabel(newStatus)}"`, 'success');
        
        // Перезагружаем статистику
        fetchData();
      } else {
        showNotification('Ошибка при обновлении статуса заказа', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Ошибка при обновлении статуса заказа', 'error');
    }
  };

  // Удаление заказа
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
        },
      });

      if (response.ok) {
        setOrders(prev => prev.filter(order => order.id !== orderId));
        showNotification(`Заказ ${orderId} удален`, 'success');
        fetchData();
      } else {
        showNotification('Ошибка при удалении заказа', 'error');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotification('Ошибка при удалении заказа', 'error');
    }
  };

  // Показать уведомление
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect ${
      type === 'success' 
        ? 'border-green-400/20 text-green-400' 
        : type === 'error'
          ? 'border-red-400/20 text-red-400'
          : 'border-blue-400/20 text-blue-400'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 4000);
  };

  // Получение метки статуса
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      processing: 'В работе',
      completed: 'Завершён',
      cancelled: 'Отменён'
    };
    return labels[status] || status;
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchData();
    fetchCmsData();
    fetchSecurityData();
    
    // Автообновление каждые 30 секунд
    const interval = setInterval(() => {
      fetchData();
      fetchCmsData();
      fetchSecurityData();
    }, 30000);
    return () => clearInterval(interval);
  }, [productSearch, postSearch, productStatusFilter, postStatusFilter]);

  // Статистические карточки
  const statsCards = stats ? [
    {
      title: 'Всего заказов',
      value: stats.totalOrders.toString(),
      change: `+${stats.pendingOrders} новых`,
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-primary'
    },
    {
      title: 'Активные заказы',
      value: stats.activeOrders.toString(),
      change: `${stats.pendingOrders} ожидают`,
      trend: 'up',
      icon: Clock,
      color: 'text-blue-400'
    },
    {
      title: 'В работе',
      value: stats.processingOrders.toString(),
      change: 'Обрабатываются',
      trend: 'up',
      icon: Settings,
      color: 'text-orange-400'
    },
    {
      title: 'Завершённые',
      value: stats.completedOrders.toString(),
      change: 'Выполнено',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-400'
    }
  ] : [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'Ожидает', icon: Clock },
      processing: { variant: 'default', label: 'В работе', icon: Settings },
      completed: { variant: 'outline', label: 'Завершён', icon: CheckCircle },
      cancelled: { variant: 'destructive', label: 'Отменён', icon: XCircle }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      timeZone: 'Asia/Tashkent',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderSummary = (items: OrderItem[]) => {
    if (items.length === 1) {
      return items[0].name;
    }
    return `${items[0].name} + еще ${items.length - 1} товаров`;
  };

  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    const filtered = orders.filter((order) => {
      const byStatus = statusFilter === 'all' ? true : order.status === statusFilter;
      const bySearch = !term
        ? true
        : order.id.toLowerCase().includes(term) ||
          order.customerInfo.name.toLowerCase().includes(term) ||
          order.customerInfo.phone.toLowerCase().includes(term) ||
          order.items.some((item) => item.name.toLowerCase().includes(term));
      return byStatus && bySearch;
    });

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortDirection === 'newest' ? bTime - aTime : aTime - bTime;
    });
  }, [orders, orderSearch, sortDirection, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-primary/10 glass-effect shadow-sm"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center neon-glow"
            >
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-grotesk">Админ-панель</h1>
              <p className="text-sm text-muted-foreground">Bententrade Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchData}
                disabled={refreshing}
                className="glass-card border-primary/20 hover:border-primary/40"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                </motion.div>
                Обновить
              </Button>
            </motion.div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="glass-card border-primary/20 hover:border-primary/40"
              onClick={() => {
                const next = notifications === 0 ? 3 : 0;
                setNotifications(next);
                showNotification(
                  next === 0 ? 'Уведомления очищены' : 'Добавлены тестовые уведомления',
                  'info',
                );
              }}
            >
              <Bell className="w-4 h-4 mr-2" />
              Уведомления
              {notifications > 0 && (
                <Badge className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground neon-glow">
                  {notifications}
                </Badge>
              )}
            </Button>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onExit}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="blog">Статьи</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="data">
              <Database className="w-4 h-4 mr-1" />
              Данные
            </TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Storage Mode Info - показываем только если БД не настроена И есть заказы */}
            {storageMode === 'in-memory' && stats && stats.totalOrders > 5 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border-blue-400/30 p-6 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-400/10 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2 font-grotesk">
                      Рекомендация: настройте постоянное хранилище
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      У вас уже {stats.totalOrders} заказов! Для сохранения истории между перезапусками настройте базу данных (займёт 2 минуты).
                    </p>
                    <div className="mt-4 flex items-start gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-primary">
                        <strong>Все функции работают!</strong> Заказы отправляются в Telegram. 
                        БД нужна только для долгосрочного хранения.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="glass-card animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </CardTitle>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground font-grotesk">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          {stat.change}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-primary/10">
                <CardHeader>
                  <CardTitle className="text-foreground font-grotesk">Последние заказы</CardTitle>
                  <CardDescription>Актуальные заказы клиентов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveTab('orders');
                        setStatusFilter('pending');
                      }}
                      className="glass-card border-primary/20 hover:border-primary/40 justify-start"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Только новые
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOrderSearch('');
                        setStatusFilter('all');
                        setSortDirection('newest');
                        showNotification('Фильтры сброшены', 'info');
                      }}
                      className="glass-card border-primary/20 hover:border-primary/40 justify-start"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Сброс фильтров
                    </Button>
                  </div>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-border rounded-xl animate-pulse">
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                          <div className="h-8 bg-muted rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Заказов пока нет</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Новые заказы будут отображаться здесь
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {filteredOrders.slice(0, 5).map((order, index) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-4 glass-card rounded-xl hover:border-primary/30 transition-all duration-300"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-primary font-grotesk">{order.id}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {order.customerInfo.name} • {order.customerInfo.phone}
                              </p>
                              <p className="text-sm text-foreground mt-1">
                                {getOrderSummary(order.items)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setActiveTab('orders')}
                                  className="glass-card border-primary/20 hover:border-primary/40"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                {order.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                    className="glass-card border-blue-400/20 hover:border-blue-400/40 text-blue-400 hover:text-blue-400"
                                  >
                                    <Settings className="w-3 h-3" />
                                  </Button>
                                )}
                                {order.status === 'processing' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                    className="glass-card border-green-400/20 hover:border-green-400/40 text-green-400 hover:text-green-400"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {filteredOrders.length > 5 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center pt-4"
                        >
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('orders')}
                            className="glass-card border-primary/20 hover:border-primary/40"
                          >
                            Показать все заказы ({filteredOrders.length})
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground font-grotesk">Управление товарами</CardTitle>
                    <CardDescription>Полный CRUD товаров с публикацией</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <div className="flex rounded-xl border border-primary/15 p-0.5 bg-card/40">
                      <Button
                        type="button"
                        size="sm"
                        variant={cmsProductsView === 'list' ? 'default' : 'ghost'}
                        className="rounded-lg"
                        onClick={() => setCmsProductsView('list')}
                        aria-pressed={cmsProductsView === 'list'}
                      >
                        <List className="w-4 h-4 mr-1" />
                        Список
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={cmsProductsView === 'kanban' ? 'default' : 'ghost'}
                        className="rounded-lg"
                        onClick={() => setCmsProductsView('kanban')}
                        aria-pressed={cmsProductsView === 'kanban'}
                      >
                        <LayoutGrid className="w-4 h-4 mr-1" />
                        Канбан
                      </Button>
                    </div>
                    <Button onClick={() => setIsProductEditorOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Новый товар
                    </Button>
                    <Button onClick={fetchCmsData} variant="outline" className="glass-card border-primary/20 hover:border-primary/40">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Обновить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={bulkPublishProducts} disabled={!selectedProductIds.length}>
                      Публиковать выбранные ({selectedProductIds.length})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedProductIds(cmsProducts.map((p) => p.id))}>
                      Выбрать все
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedProductIds([])}>
                      Снять выбор
                    </Button>
                  </div>
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      className="h-10 rounded-xl bg-card border border-primary/15 px-3"
                      placeholder="Поиск по товарам (название/slug)"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <select
                      className="h-10 rounded-xl bg-card border border-primary/15 px-2"
                      value={productStatusFilter}
                      onChange={(e) => setProductStatusFilter(e.target.value)}
                    >
                      <option value="all">Все статусы</option>
                      <option value="draft">Черновик</option>
                      <option value="published">Опубликован</option>
                      <option value="archived">Архив</option>
                    </select>
                  </div>
                  {cmsProductsView === 'kanban' && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Перетащите карточку в другую колонку, чтобы изменить статус (черновик / опубликовано / архив).
                    </p>
                  )}
                  {cmsProductsView === 'kanban' ? (
                    <div className="grid gap-4 md:grid-cols-3 min-h-[min(70vh,720px)]">
                      {(['draft', 'published', 'archived'] as const).map((status) => (
                        <div
                          key={status}
                          className="rounded-2xl border border-primary/15 bg-card/25 p-3 flex flex-col gap-2 min-h-[200px]"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const id =
                              e.dataTransfer.getData('application/x-benten-product') ||
                              e.dataTransfer.getData('text/plain');
                            if (!id) return;
                            const item = cmsProducts.find((p) => p.id === id);
                            if (!item || item.status === status) return;
                            void putProductUpdate(item, { status }, { silent: true });
                          }}
                        >
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1 pb-2 border-b border-primary/10">
                            {cmsEntityStatusLabel(status)} · {productsByStatus[status].length}
                          </div>
                          <div className="flex flex-col gap-2 overflow-y-auto flex-1 max-h-[min(65vh,680px)] pr-1">
                            {productsByStatus[status].map((item) => (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('application/x-benten-product', item.id);
                                  e.dataTransfer.setData('text/plain', item.id);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                className="p-3 rounded-xl glass-effect border border-primary/10 cursor-grab active:cursor-grabbing"
                              >
                                <div className="flex gap-3">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt=""
                                      className="w-14 h-14 rounded-lg object-cover border border-primary/10 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                                      <Package className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm line-clamp-2">{item.title}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {item.price != null && item.price !== 0
                                        ? `${Number(item.price).toLocaleString('ru-RU')} сўм`
                                        : '—'}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setPreviewProduct(item)}>
                                    Превью
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs px-2"
                                    onClick={() => {
                                      setProductForm({
                                        id: item.id,
                                        title: item.title,
                                        slug: item.slug,
                                        description: item.description,
                                        image: item.image,
                                        category: item.category,
                                        price: Number(item.price || 0),
                                        status: item.status,
                                      });
                                      setIsProductEditorOpen(true);
                                    }}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Ред.
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Название" value={productForm.title} onChange={(e) => setProductForm((p) => ({ ...p, title: e.target.value }))} />
                      <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Slug (опционально)" value={productForm.slug} onChange={(e) => setProductForm((p) => ({ ...p, slug: e.target.value }))} />
                      <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="URL картинки" value={productForm.image} onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))} />
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3 text-sm"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            setProductForm((p) => ({ ...p, image: url }));
                            showNotification('Изображение загружено', 'success');
                          } else {
                            showNotification('Ошибка загрузки изображения', 'error');
                          }
                        }}
                      />
                      <div
                        className={`rounded-xl border border-dashed px-3 py-4 text-sm text-center transition-colors ${
                          isProductDropActive ? 'border-primary bg-primary/10' : 'border-primary/20 bg-card/30'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsProductDropActive(true);
                        }}
                        onDragLeave={() => setIsProductDropActive(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsProductDropActive(false);
                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            setProductForm((p) => ({ ...p, image: url }));
                            showNotification('Изображение загружено через drag&drop', 'success');
                          } else {
                            showNotification('Ошибка загрузки изображения', 'error');
                          }
                        }}
                      >
                        Перетащите изображение сюда
                      </div>
                      <textarea className="w-full min-h-[90px] rounded-xl bg-card border border-primary/15 px-3 py-2" placeholder="Описание" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
                      <div className="grid grid-cols-3 gap-2">
                        <input className="h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Категория" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} />
                        <input className="h-10 rounded-xl bg-card border border-primary/15 px-3" type="number" placeholder="Цена" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: Number(e.target.value || 0) }))} />
                        <select className="h-10 rounded-xl bg-card border border-primary/15 px-2" value={productForm.status} onChange={(e) => setProductForm((p) => ({ ...p, status: e.target.value as any }))}>
                          <option value="draft">Черновик</option>
                          <option value="published">Опубликован</option>
                          <option value="archived">Архив</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveProduct} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          {productForm.id ? 'Сохранить товар' : 'Добавить товар'}
                        </Button>
                        <Button variant="outline" onClick={() => setProductForm({ id: '', title: '', slug: '', description: '', image: '', category: 'kashpo', price: 0, status: 'draft' })}>
                          Сброс
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[480px] overflow-auto pr-1">
                      {cmsProducts.map((item) => (
                        <div key={item.id} className="p-3 rounded-xl glass-effect border border-primary/10">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={selectedProductIds.includes(item.id)}
                                onChange={() => toggleProductSelection(item.id)}
                              />
                              <div className="min-w-0 flex-1">
                                <input
                                  aria-label="Название товара"
                                  defaultValue={item.title}
                                  key={`pt-${item.id}-${item.updatedAt || ''}`}
                                  onBlur={(e) => {
                                    const v = e.target.value.trim();
                                    if (v && v !== item.title) void putProductUpdate(item, { title: v }, { silent: true });
                                  }}
                                  className="font-medium bg-transparent border border-transparent hover:border-primary/25 focus:border-primary/40 rounded px-1 -mx-1 w-full max-w-[min(100%,320px)]"
                                />
                                <div className="text-xs text-muted-foreground mt-1">{item.slug} • {item.category}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground shrink-0">Цена</span>
                                  <input
                                    aria-label="Цена товара"
                                    type="number"
                                    min={0}
                                    step={1}
                                    defaultValue={item.price}
                                    key={`pp-${item.id}-${item.updatedAt || ''}`}
                                    onBlur={(e) => {
                                      const n = Number(e.target.value);
                                      if (!Number.isNaN(n) && n !== Number(item.price)) {
                                        void putProductUpdate(item, { price: n }, { silent: true });
                                      }
                                    }}
                                    className="h-8 text-sm rounded-lg bg-background/50 border border-primary/15 px-2 w-32"
                                  />
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">{cmsEntityStatusLabel(item.status)}</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => setPreviewProduct(item)}>
                              <Maximize2 className="w-3 h-3 mr-1" />
                              Превью
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setProductForm({ id: item.id, title: item.title, slug: item.slug, description: item.description, image: item.image, category: item.category, price: Number(item.price || 0), status: item.status })}>
                              <Edit className="w-3 h-3 mr-1" />
                              Изменить
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setProductForm({ id: item.id, title: item.title, slug: item.slug, description: item.description, image: item.image, category: item.category, price: Number(item.price || 0), status: item.status });
                                setIsProductEditorOpen(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              В модалке
                            </Button>
                            <Button size="sm" variant="outline" onClick={async () => {
                              await fetch(`${API_BASE_URL}/admin/products/${item.id}/publish`, { method: 'POST', headers: adminHeaders });
                              fetchCmsData();
                            }}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Публиковать
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => window.open('/catalog', '_blank')}>
                              <Eye className="w-3 h-3 mr-1" />
                              На сайте
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-400 border-red-400/20 hover:border-red-400/40" onClick={async () => {
                              if (!confirm('Удалить товар? Это действие можно отменить только через восстановление из БД.')) return;
                              await fetch(`${API_BASE_URL}/admin/products/${item.id}`, { method: 'DELETE', headers: adminHeaders });
                              showNotification('Товар перемещён в архив', 'success');
                              fetchCmsData();
                            }}>
                              <Trash2 className="w-3 h-3 mr-1" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground font-grotesk">Управление статьями</CardTitle>
                    <CardDescription>Создание, публикация и редактирование статей</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <div className="flex rounded-xl border border-primary/15 p-0.5 bg-card/40">
                      <Button
                        type="button"
                        size="sm"
                        variant={cmsPostsView === 'list' ? 'default' : 'ghost'}
                        className="rounded-lg"
                        onClick={() => setCmsPostsView('list')}
                        aria-pressed={cmsPostsView === 'list'}
                      >
                        <List className="w-4 h-4 mr-1" />
                        Список
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={cmsPostsView === 'kanban' ? 'default' : 'ghost'}
                        className="rounded-lg"
                        onClick={() => setCmsPostsView('kanban')}
                        aria-pressed={cmsPostsView === 'kanban'}
                      >
                        <LayoutGrid className="w-4 h-4 mr-1" />
                        Канбан
                      </Button>
                    </div>
                    <Button onClick={() => setIsPostEditorOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Новая статья
                    </Button>
                    <Button onClick={fetchCmsData} variant="outline" className="glass-card border-primary/20 hover:border-primary/40">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Обновить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={bulkPublishPosts} disabled={!selectedPostIds.length}>
                      Публиковать выбранные ({selectedPostIds.length})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedPostIds(cmsPosts.map((p) => p.id))}>
                      Выбрать все
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedPostIds([])}>
                      Снять выбор
                    </Button>
                  </div>
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      className="h-10 rounded-xl bg-card border border-primary/15 px-3"
                      placeholder="Поиск по статьям (заголовок/slug)"
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                    />
                    <select
                      className="h-10 rounded-xl bg-card border border-primary/15 px-2"
                      value={postStatusFilter}
                      onChange={(e) => setPostStatusFilter(e.target.value)}
                    >
                      <option value="all">Все статусы</option>
                      <option value="draft">Черновик</option>
                      <option value="published">Опубликована</option>
                      <option value="archived">Архив</option>
                    </select>
                  </div>
                  {cmsPostsView === 'kanban' && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Перетащите карточку статьи в другую колонку, чтобы изменить статус.
                    </p>
                  )}
                  {cmsPostsView === 'kanban' ? (
                    <div className="grid gap-4 md:grid-cols-3 min-h-[min(70vh,720px)]">
                      {(['draft', 'published', 'archived'] as const).map((status) => (
                        <div
                          key={status}
                          className="rounded-2xl border border-primary/15 bg-card/25 p-3 flex flex-col gap-2 min-h-[200px]"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const id =
                              e.dataTransfer.getData('application/x-benten-post') ||
                              e.dataTransfer.getData('text/plain');
                            if (!id) return;
                            const item = cmsPosts.find((p) => p.id === id);
                            if (!item || item.status === status) return;
                            void putPostUpdate(item, { status }, { silent: true });
                          }}
                        >
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1 pb-2 border-b border-primary/10">
                            {cmsEntityStatusLabel(status)} · {postsByStatus[status].length}
                          </div>
                          <div className="flex flex-col gap-2 overflow-y-auto flex-1 max-h-[min(65vh,680px)] pr-1">
                            {postsByStatus[status].map((post) => (
                              <div
                                key={post.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('application/x-benten-post', post.id);
                                  e.dataTransfer.setData('text/plain', post.id);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                className="p-3 rounded-xl glass-effect border border-primary/10 cursor-grab active:cursor-grabbing"
                              >
                                <div className="flex gap-3">
                                  {post.image ? (
                                    <img
                                      src={post.image}
                                      alt=""
                                      className="w-14 h-14 rounded-lg object-cover border border-primary/10 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                                      <FileText className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm line-clamp-2">{post.title}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.description}</div>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setPreviewPost(post)}>
                                    Превью
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs px-2"
                                    onClick={() => {
                                      setPostForm({
                                        id: post.id,
                                        title: post.title,
                                        slug: post.slug,
                                        description: post.description,
                                        image: post.image,
                                        status: post.status,
                                      });
                                      setIsPostEditorOpen(true);
                                    }}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Ред.
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Заголовок статьи" value={postForm.title} onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))} />
                      <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Slug (опционально)" value={postForm.slug} onChange={(e) => setPostForm((p) => ({ ...p, slug: e.target.value }))} />
                      <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="URL обложки" value={postForm.image} onChange={(e) => setPostForm((p) => ({ ...p, image: e.target.value }))} />
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3 text-sm"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            setPostForm((p) => ({ ...p, image: url }));
                            showNotification('Обложка загружена', 'success');
                          } else {
                            showNotification('Ошибка загрузки обложки', 'error');
                          }
                        }}
                      />
                      <div
                        className={`rounded-xl border border-dashed px-3 py-4 text-sm text-center transition-colors ${
                          isPostDropActive ? 'border-primary bg-primary/10' : 'border-primary/20 bg-card/30'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsPostDropActive(true);
                        }}
                        onDragLeave={() => setIsPostDropActive(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsPostDropActive(false);
                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            setPostForm((p) => ({ ...p, image: url }));
                            showNotification('Обложка загружена через drag&drop', 'success');
                          } else {
                            showNotification('Ошибка загрузки обложки', 'error');
                          }
                        }}
                      >
                        Перетащите обложку сюда
                      </div>
                      <textarea className="w-full min-h-[120px] rounded-xl bg-card border border-primary/15 px-3 py-2" placeholder="Краткое описание" value={postForm.description} onChange={(e) => setPostForm((p) => ({ ...p, description: e.target.value }))} />
                      <div className="grid grid-cols-2 gap-2">
                        <select className="h-10 rounded-xl bg-card border border-primary/15 px-2" value={postForm.status} onChange={(e) => setPostForm((p) => ({ ...p, status: e.target.value as any }))}>
                          <option value="draft">Черновик</option>
                          <option value="published">Опубликована</option>
                          <option value="archived">Архив</option>
                        </select>
                        <Button onClick={savePost} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          {postForm.id ? 'Сохранить статью' : 'Добавить статью'}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[480px] overflow-auto pr-1">
                      {cmsPosts.map((post) => (
                        <div key={post.id} className="p-3 rounded-xl glass-effect border border-primary/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={selectedPostIds.includes(post.id)}
                                onChange={() => togglePostSelection(post.id)}
                              />
                              <div className="min-w-0 flex-1">
                                <input
                                  aria-label="Заголовок статьи"
                                  defaultValue={post.title}
                                  key={`bt-${post.id}-${post.updatedAt || ''}`}
                                  onBlur={(e) => {
                                    const v = e.target.value.trim();
                                    if (v && v !== post.title) void putPostUpdate(post, { title: v }, { silent: true });
                                  }}
                                  className="font-medium bg-transparent border border-transparent hover:border-primary/25 focus:border-primary/40 rounded px-1 -mx-1 w-full max-w-[min(100%,320px)]"
                                />
                                <div className="text-xs text-muted-foreground mt-1">{post.slug}</div>
                              </div>
                            </div>
                            <Badge variant="outline">{cmsEntityStatusLabel(post.status)}</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => setPreviewPost(post)}>
                              <Maximize2 className="w-3 h-3 mr-1" />
                              Превью
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setPostForm({ id: post.id, title: post.title, slug: post.slug, description: post.description, image: post.image, status: post.status })}>
                              <Edit className="w-3 h-3 mr-1" />
                              Изменить
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPostForm({ id: post.id, title: post.title, slug: post.slug, description: post.description, image: post.image, status: post.status });
                                setIsPostEditorOpen(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              В модалке
                            </Button>
                            <Button size="sm" variant="outline" onClick={async () => {
                              await fetch(`${API_BASE_URL}/admin/blog/${post.id}/publish`, { method: 'POST', headers: adminHeaders });
                              fetchCmsData();
                            }}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Публиковать
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                              <Eye className="w-3 h-3 mr-1" />
                              На сайте
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-400 border-red-400/20 hover:border-red-400/40" onClick={async () => {
                              if (!confirm('Удалить статью? Это действие можно отменить только через восстановление из БД.')) return;
                              await fetch(`${API_BASE_URL}/admin/blog/${post.id}`, { method: 'DELETE', headers: adminHeaders });
                              showNotification('Статья перемещена в архив', 'success');
                              fetchCmsData();
                            }}>
                              <Trash2 className="w-3 h-3 mr-1" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground font-grotesk">Управление заказами</CardTitle>
                    <CardDescription>Обработка и отслеживание всех заказов</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchData}
                      disabled={refreshing}
                      className="glass-card border-primary/20 hover:border-primary/40"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Обновить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 grid gap-3 md:grid-cols-3">
                    <div className="relative md:col-span-2">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Поиск: ID, имя, телефон, товар..."
                        className="w-full h-10 pl-10 pr-3 rounded-xl bg-card border border-primary/15 focus:border-primary/35 outline-none text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="h-10 rounded-xl bg-card border border-primary/15 px-2 text-sm"
                      >
                        <option value="all">Все</option>
                        <option value="pending">Ожидают</option>
                        <option value="processing">В работе</option>
                        <option value="completed">Завершены</option>
                        <option value="cancelled">Отменены</option>
                      </select>
                      <Button
                        variant="outline"
                        onClick={() => setSortDirection((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
                        className="glass-card border-primary/20 hover:border-primary/40 text-xs"
                      >
                        {sortDirection === 'newest' ? 'Сначала новые' : 'Сначала старые'}
                      </Button>
                    </div>
                  </div>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 border border-border rounded-xl animate-pulse">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                              <div className="h-4 bg-muted rounded w-48"></div>
                            </div>
                            <div className="h-6 bg-muted rounded w-20"></div>
                          </div>
                          <div className="h-4 bg-muted rounded w-full mb-2"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">По текущему фильтру заказов нет</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Попробуйте изменить поиск или статус
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <AnimatePresence>
                        {filteredOrders.map((order, index) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className="p-6 glass-card rounded-2xl hover:border-primary/30 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-primary font-grotesk">{order.id}</h3>
                                  {getStatusBadge(order.status)}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard.writeText(order.id);
                                      showNotification(`ID ${order.id} скопирован`, 'info');
                                    }}
                                    className="h-7 px-2"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    ID
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Создан: {formatDate(order.createdAt)}
                                  {order.updatedAt !== order.createdAt && (
                                    <span> • Обновлен: {formatDate(order.updatedAt)}</span>
                                  )}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                {order.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateOrderStatus(order.id, 'processing')}
                                      className="glass-card border-blue-400/20 hover:border-blue-400/40 text-blue-400 hover:text-blue-400"
                                    >
                                      <Settings className="w-4 h-4 mr-1" />
                                      В работу
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                      className="glass-card border-red-400/20 hover:border-red-400/40 text-red-400 hover:text-red-400"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Отменить
                                    </Button>
                                  </>
                                )}
                                
                                {order.status === 'processing' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateOrderStatus(order.id, 'completed')}
                                      className="glass-card border-green-400/20 hover:border-green-400/40 text-green-400 hover:text-green-400"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Завершить
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                      className="glass-card border-red-400/20 hover:border-red-400/40 text-red-400 hover:text-red-400"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Отменить
                                    </Button>
                                  </>
                                )}
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteOrder(order.id)}
                                  className="glass-card border-red-400/20 hover:border-red-400/40 text-red-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                                className="text-primary hover:text-primary/80"
                              >
                                {expandedOrderId === order.id ? 'Скрыть детали' : 'Показать детали'}
                              </Button>
                            </div>

                            {expandedOrderId === order.id && (
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Информация о клиенте */}
                              <div>
                                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" />
                                  Информация о клиенте
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-muted-foreground">Имя:</span> {order.customerInfo.name}</p>
                                  <p><span className="text-muted-foreground">Телефон:</span> {order.customerInfo.phone}</p>
                                  {order.customerInfo.email && (
                                    <p><span className="text-muted-foreground">Email:</span> {order.customerInfo.email}</p>
                                  )}
                                  {order.customerInfo.address && (
                                    <p><span className="text-muted-foreground">Адрес:</span> {order.customerInfo.address}</p>
                                  )}
                                  {order.customerInfo.notes && (
                                    <p><span className="text-muted-foreground">Комментарий:</span> {order.customerInfo.notes}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Товары */}
                              <div>
                                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                  <Package className="w-4 h-4 text-primary" />
                                  Заказанные товары ({order.items.length})
                                </h4>
                                <div className="space-y-3">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="p-3 glass-effect rounded-xl">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <p className="font-medium text-foreground">{item.name}</p>
                                          <div className="flex gap-2 mt-1">
                                            {item.variant && (
                                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                Цвет: {item.variant}
                                              </Badge>
                                            )}
                                            {item.size && (
                                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                {item.size}
                                              </Badge>
                                            )}
                                            {item.style && (
                                              <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                                                {item.style}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20">
                                          {item.quantity} шт
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Data Loader Tab */}
          <TabsContent value="data" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DataLoader />
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Telegram Status Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TelegramStatusIndicator 
                showTestButton={true}
                onOpenSetup={() => {
                  window.dispatchEvent(new CustomEvent('openTelegramSetup'));
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-primary/10">
                <CardHeader>
                  <CardTitle className="text-foreground font-grotesk">Настройки системы</CardTitle>
                  <CardDescription>Конфигурация сайта и админ-панели</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">

                    {/* Server Settings */}
                    <Card className="glass-effect border-primary/10">
                      <CardHeader>
                        <CardTitle className="text-base">Сервер и хранилище</CardTitle>
                        <CardDescription>Состояние серверной части</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Сервер:</span>
                            <Badge className="bg-green-500/10 text-green-400 border-green-400/20">
                              ✓ Работает
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Режим хранения:</span>
                            {storageMode === 'database' ? (
                              <Badge className="bg-green-500/10 text-green-400 border-green-400/20">
                                База данных
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-500/10 text-blue-400 border-blue-400/20">
                                Оперативная память
                              </Badge>
                            )}
                          </div>
                          {storageMode === 'in-memory' && (
                            <div className="p-3 bg-blue-400/10 rounded-xl border border-blue-400/20 mt-3">
                              <p className="text-xs text-blue-400 mb-2">
                                💡 Данные временные. Для постоянного хранения настройте БД
                              </p>
                              <a 
                                href="https://railway.com/project" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-block"
                              >
                                Открыть Railway PostgreSQL →
                              </a>
                            </div>
                          )}
                          {!dbHealthy && dbWarning && (
                            <div className="p-3 bg-red-400/10 rounded-xl border border-red-400/20 mt-3">
                              <p className="text-xs text-red-400">
                                ⚠️ {dbWarning}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Версия API:</span>
                            <span className="text-xs font-mono">v2.0.0</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Telegram:</span>
                            <Badge className="bg-green-500/10 text-green-400 border-green-400/20">
                              ✓ Активен
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-8 text-center">
                    <motion.div
                      animate={{ 
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                    >
                      <Settings className="w-16 h-16 text-primary mx-auto mb-4 opacity-60" />
                    </motion.div>
                    <h3 className="text-lg font-grotesk text-gradient mb-2">Расширенные настройки</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto text-balance">
                      Дополнительные параметры конфигурации будут добавлены в следующих обновлениях
                    </p>
                  </div>

                  <div className="mt-8 grid lg:grid-cols-2 gap-6">
                    <Card className="glass-effect border-primary/10">
                      <CardHeader>
                        <CardTitle className="text-base">Роли доступа</CardTitle>
                        <CardDescription>Текущие роли в системе</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {roles.map((r) => (
                          <div key={r.code} className="flex items-center justify-between text-sm">
                            <span>{r.title}</span>
                            <Badge variant="outline">{r.code}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="glass-effect border-primary/10">
                      <CardHeader>
                        <CardTitle className="text-base">Журнал изменений</CardTitle>
                        <CardDescription>Последние действия админов</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-52 overflow-auto">
                        {auditLogs.slice(0, 20).map((log) => (
                          <div key={log.id} className="text-xs p-2 rounded-lg bg-background/40 border border-border/40">
                            <div className="font-medium">{log.action} • {log.entity_type}</div>
                            <div className="text-muted-foreground">{log.entity_id} • {log.actor}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <Dialog open={isProductEditorOpen} onOpenChange={setIsProductEditorOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{productForm.id ? 'Редактирование товара' : 'Новый товар'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Название" value={productForm.title} onChange={(e) => setProductForm((p) => ({ ...p, title: e.target.value }))} />
                <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Slug" value={productForm.slug} onChange={(e) => setProductForm((p) => ({ ...p, slug: e.target.value }))} />
                <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="URL картинки" value={productForm.image} onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))} />
                <textarea className="w-full min-h-[120px] rounded-xl bg-card border border-primary/15 px-3 py-2" placeholder="Описание" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
                <div className="grid grid-cols-3 gap-2">
                  <input className="h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Категория" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} />
                  <input className="h-10 rounded-xl bg-card border border-primary/15 px-3" type="number" placeholder="Цена" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: Number(e.target.value || 0) }))} />
                  <select className="h-10 rounded-xl bg-card border border-primary/15 px-2" value={productForm.status} onChange={(e) => setProductForm((p) => ({ ...p, status: e.target.value as any }))}>
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликован</option>
                    <option value="archived">Архив</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsProductEditorOpen(false)}>Закрыть</Button>
                  <Button onClick={async () => { await saveProduct(); setIsProductEditorOpen(false); }} className="bg-primary text-primary-foreground hover:bg-primary/90">Сохранить</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isPostEditorOpen} onOpenChange={setIsPostEditorOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{postForm.id ? 'Редактирование статьи' : 'Новая статья'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Заголовок" value={postForm.title} onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))} />
                <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="Slug" value={postForm.slug} onChange={(e) => setPostForm((p) => ({ ...p, slug: e.target.value }))} />
                <input className="w-full h-10 rounded-xl bg-card border border-primary/15 px-3" placeholder="URL обложки" value={postForm.image} onChange={(e) => setPostForm((p) => ({ ...p, image: e.target.value }))} />
                <textarea className="w-full min-h-[120px] rounded-xl bg-card border border-primary/15 px-3 py-2" placeholder="Краткое описание" value={postForm.description} onChange={(e) => setPostForm((p) => ({ ...p, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="h-10 rounded-xl bg-card border border-primary/15 px-2" value={postForm.status} onChange={(e) => setPostForm((p) => ({ ...p, status: e.target.value as any }))}>
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликована</option>
                    <option value="archived">Архив</option>
                  </select>
                  <Button onClick={async () => { await savePost(); setIsPostEditorOpen(false); }} className="bg-primary text-primary-foreground hover:bg-primary/90">Сохранить</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Предпросмотр карточки товара</DialogTitle>
              </DialogHeader>
              {previewProduct && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden border border-primary/10 bg-muted/20">
                    {previewProduct.image ? (
                      <img src={previewProduct.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[140px] text-muted-foreground text-sm">
                        Нет изображения
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-grotesk">{previewProduct.title}</h3>
                    <p className="text-sm text-muted-foreground">{previewProduct.category}</p>
                  </div>
                  {previewProduct.description ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{previewProduct.description}</p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-semibold text-primary">
                      {previewProduct.price != null && previewProduct.price !== 0
                        ? `${Number(previewProduct.price).toLocaleString('ru-RU')} сўм`
                        : '—'}
                    </span>
                    <Badge variant="outline">{cmsEntityStatusLabel(previewProduct.status)}</Badge>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={!!previewPost} onOpenChange={(open) => !open && setPreviewPost(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Предпросмотр статьи</DialogTitle>
              </DialogHeader>
              {previewPost && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden border border-primary/10 bg-muted/20">
                    {previewPost.image ? (
                      <img src={previewPost.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[140px] text-muted-foreground text-sm">
                        Нет обложки
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold font-grotesk leading-snug">{previewPost.title}</h3>
                  {previewPost.description ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-8">{previewPost.description}</p>
                  ) : null}
                  <Badge variant="outline">{cmsEntityStatusLabel(previewPost.status)}</Badge>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </div>
  );
}