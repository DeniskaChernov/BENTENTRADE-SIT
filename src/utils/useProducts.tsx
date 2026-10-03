import { useState, useEffect } from 'react';
import { API_BASE_URL, API_TOKEN } from './env';

// Интерфейсы
export interface ColorVariant {
  id: string;
  name: string;
  images: string[];
  color: string;
  gradient?: string;
  article?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  features?: string[];
  variants?: ColorVariant[];
  category: string;
  size?: string;
  style?: string;
  dimensions?: {
    height: number;
    diameter: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Хук для работы с продуктами
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получение всех товаров
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Получение товара по ID
  const getProduct = async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.product;
      } else {
        throw new Error(data.error || 'Failed to fetch product');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  };

  // Создание товара
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Обновляем локальный список
        setProducts(prev => [...prev, data.product]);
        return data.product;
      } else {
        throw new Error(data.error || 'Failed to create product');
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  // Обновление товара
  const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Обновляем локальный список
        setProducts(prev => prev.map(p => p.id === id ? data.product : p));
        return data.product;
      } else {
        throw new Error(data.error || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  // Удаление товара
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Обновляем локальный список
        setProducts(prev => prev.filter(p => p.id !== id));
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  // Массовая загрузка товаров
  const bulkUpload = async (productsData: Product[]): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: productsData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Обновляем локальный список
        setProducts(data.products);
        return true;
      } else {
        throw new Error(data.error || 'Failed to upload products');
      }
    } catch (err) {
      console.error('Error bulk uploading products:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  // Фильтрация по категории
  const filterByCategory = async (category: string): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/filter/${category}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.products;
      } else {
        throw new Error(data.error || 'Failed to filter products');
      }
    } catch (err) {
      console.error('Error filtering products:', err);
      return [];
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpload,
    filterByCategory,
  };
}

// Утилита для миграции данных из старого формата
export async function migrateProductsToDatabase(productsData: Product[]): Promise<boolean> {
  try {
    console.log(`🚀 Starting migration of ${productsData.length} products...`);

    const response = await fetch(`${API_BASE_URL}/products/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products: productsData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Migration completed! ${data.total} products saved to database.`);
      return true;
    } else {
      throw new Error(data.error || 'Failed to migrate products');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
    return false;
  }
}
