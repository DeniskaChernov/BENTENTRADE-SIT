import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Palette, Ruler, ArrowUpDown } from '../utils/lucide-stub';
import { Badge } from './ui/badge';

interface ColorVariant {
  id: string;
  name: string;
  color: string;
}

interface ProductFilterProps {
  // Цвет
  colorFilter: string;
  onColorChange: (value: string) => void;
  availableColors: string[];
  colorVariants: ColorVariant[];
  
  // Размер
  sizeFilter: string;
  onSizeChange: (value: string) => void;
  availableSizes: string[];
  
  // Сортировка по названию
  sortBy: string;
  onSortChange: (value: string) => void;
  
  // Для анимации
  inView?: boolean;
}

export function ProductFilter({
  colorFilter,
  onColorChange,
  availableColors,
  colorVariants,
  sizeFilter,
  onSizeChange,
  availableSizes,
  sortBy,
  onSortChange,
  inView = true
}: ProductFilterProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full"
    >
      <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-xl backdrop-blur-sm">
        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-primary to-emerald-600 rounded-xl shadow-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-emerald-800 bg-clip-text text-transparent">
            Фильтры товаров
          </h3>
        </div>

        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Цвет */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-sm font-medium text-primary">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Palette className="w-3.5 h-3.5 text-white" />
              </div>
              Цвет
            </label>
            <Select value={colorFilter} onValueChange={onColorChange}>
              <SelectTrigger className="w-full border border-border bg-background hover:border-primary/40 transition-all duration-300 focus:ring-2 focus:ring-primary shadow-sm">
                <SelectValue placeholder="Выберите цвет" />
              </SelectTrigger>
              <SelectContent className="border border-border bg-popover backdrop-blur-sm">
                <SelectItem value="all" className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-emerald-600 border-2 border-white shadow-sm" />
                    Все цвета
                  </div>
                </SelectItem>
                {availableColors.map(colorId => {
                  const color = colorVariants.find(c => c.id === colorId);
                  return (
                    <SelectItem key={colorId} value={colorId}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color?.color }}
                        />
                        {color?.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Размер */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-sm font-medium text-primary">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Ruler className="w-3.5 h-3.5 text-white" />
              </div>
              Размер
            </label>
            <Select value={sizeFilter} onValueChange={onSizeChange}>
              <SelectTrigger className="w-full border border-border bg-background hover:border-primary/40 transition-all duration-300 focus:ring-2 focus:ring-primary shadow-sm">
                <SelectValue placeholder="Выберите размер" />
              </SelectTrigger>
              <SelectContent className="border border-border bg-popover backdrop-blur-sm">
                <SelectItem value="all" className="font-medium">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-primary" />
                    Все размеры
                  </div>
                </SelectItem>
                {availableSizes.map(size => (
                  <SelectItem key={size} value={size}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                        {size}
                      </Badge>
                      <span>Объем {size}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Сортировка */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-sm font-medium text-primary">
              <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <ArrowUpDown className="w-3.5 h-3.5 text-white" />
              </div>
              Сортировка
            </label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full border border-border bg-background hover:border-primary/40 transition-all duration-300 focus:ring-2 focus:ring-primary shadow-sm">
                <SelectValue placeholder="Сортировать по" />
              </SelectTrigger>
              <SelectContent className="border border-border bg-popover backdrop-blur-sm">
                <SelectItem value="name">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-primary" />
                    По названию (А-Я)
                  </div>
                </SelectItem>
                <SelectItem value="name-desc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-primary rotate-180" />
                    По названию (Я-А)
                  </div>
                </SelectItem>
                <SelectItem value="size">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-blue-600" />
                    По размеру (возр.)
                  </div>
                </SelectItem>
                <SelectItem value="size-desc">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-blue-600 rotate-180" />
                    По размеру (убыв.)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>

        {/* Активные фильтры */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 pt-6 border-t border-border"
        >
          {(colorFilter !== 'all' || sizeFilter !== 'all') && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-primary">Активные фильтры:</span>
              
              {colorFilter !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onColorChange('all')}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: colorVariants.find(c => c.id === colorFilter)?.color }}
                    />
                    {colorVariants.find(c => c.id === colorFilter)?.name}
                    <span className="ml-1 text-purple-600 hover:text-purple-800">×</span>
                  </div>
                </Badge>
              )}
              
              {sizeFilter !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSizeChange('all')}
                >
                  <div className="flex items-center gap-2">
                    <Ruler className="w-3 h-3" />
                    {sizeFilter}
                    <span className="ml-1 text-blue-600 hover:text-blue-800">×</span>
                  </div>
                </Badge>
              )}
              
              {(colorFilter !== 'all' || sizeFilter !== 'all') && (
                <button
                  onClick={() => {
                    onColorChange('all');
                    onSizeChange('all');
                  }}
                  className="text-xs text-primary hover:text-primary underline underline-offset-2 transition-colors font-medium"
                >
                  Сбросить все
                </button>
              )}
            </div>
          )}
          
          {colorFilter === 'all' && sizeFilter === 'all' && (
            <p className="text-sm text-primary/60 italic">
              Фильтры не применены. Выберите цвет или размер для фильтрации товаров.
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}