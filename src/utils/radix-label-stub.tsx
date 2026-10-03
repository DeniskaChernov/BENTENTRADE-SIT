// Заглушка для @radix-ui/react-label
import * as React from "react";

export const Root = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={className} {...props} />
  )
);
Root.displayName = "Label";
