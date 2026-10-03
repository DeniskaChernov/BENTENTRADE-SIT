import { motion } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';

export function ProductCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-border">
        <CardContent className="p-0">
          {/* Image skeleton */}
          <Skeleton className="h-48 w-full rounded-t-lg" />
          
          <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <Skeleton className="h-4 w-3/4" />
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            
            {/* Price skeleton */}
            <Skeleton className="h-5 w-1/3" />
            
            {/* Button skeleton */}
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}