// Заглушка для @radix-ui/react-slot
import * as React from "react";

export const Slot = React.forwardRef<HTMLElement, any>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref,
    });
  }
  return <span ref={ref as any} {...props}>{children}</span>;
});
Slot.displayName = "Slot";
