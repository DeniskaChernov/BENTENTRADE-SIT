import { motion } from 'framer-motion';
import { ChevronRight, Home } from '../utils/lucide-stub';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-muted-foreground mb-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center"
      >
        <Home className="w-4 h-4" />
      </motion.div>
      
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-center space-x-2"
        >
          <ChevronRight className="w-4 h-4 text-primary/50" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={`hover:text-primary transition-colors ${
                index === items.length - 1 
                  ? "text-foreground font-medium" 
                  : "hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ) : (
            <span className={index === items.length - 1 ? "text-foreground font-medium" : ""}>
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </nav>
  );
}