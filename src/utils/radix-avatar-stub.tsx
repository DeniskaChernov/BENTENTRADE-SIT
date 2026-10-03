// Заглушка для @radix-ui/react-avatar
import * as React from "react";

export const Root = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={className} {...props} />
  )
);
Root.displayName = "AvatarRoot";

export const Image = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref as any} className={`${className} flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium`} {...props}>
      Р
    </div>
  )
);
Image.displayName = "AvatarImage";

export const Fallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={className} {...props} />
  )
);
Fallback.displayName = "AvatarFallback";
