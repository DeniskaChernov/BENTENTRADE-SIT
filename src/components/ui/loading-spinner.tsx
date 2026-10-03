import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'default', 
  text = 'Загрузка...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <motion.div
        className={`animate-spin rounded-full border-2 border-primary/20 border-t-primary ${sizeClasses[size]}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      />
      {text && (
        <motion.p 
          className="mt-3 text-sm text-muted-foreground text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}