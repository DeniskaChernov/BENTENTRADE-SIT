// Заглушка для @radix-ui/react-dialog
import * as React from "react";

const DialogContext = React.createContext<{open: boolean, onOpenChange: (open: boolean) => void}>({
  open: false,
  onOpenChange: () => {}
});

export const Root = ({ children, open, onOpenChange, defaultOpen, modal }: any) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen || false);
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;
  
  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};
Root.displayName = "DialogRoot";

export const Trigger = React.forwardRef<HTMLButtonElement, any>(({ children, asChild, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext);
  
  // Если asChild=true, клонируем child и добавляем обработчик
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: any) => {
        props.onClick?.(e);
        children.props.onClick?.(e);
        onOpenChange(true);
      }
    } as any);
  }
  
  return (
    <button
      ref={ref}
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        onOpenChange(true);
      }}
    >
      {children}
    </button>
  );
});
Trigger.displayName = "DialogTrigger";

export const Portal = ({ children }: any) => {
  const { open } = React.useContext(DialogContext);
  if (!open) return null;
  return <>{children}</>;
};
Portal.displayName = "DialogPortal";

export const Overlay = React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    {...props}
  />
));
Overlay.displayName = "DialogOverlay";

export const Content = React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    {...props}
  >
    {children}
  </div>
));
Content.displayName = "DialogContent";

export const Close = React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext);
  
  return (
    <button
      ref={ref}
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        onOpenChange(false);
      }}
    >
      {children}
    </button>
  );
});
Close.displayName = "DialogClose";

export const Title = React.forwardRef<HTMLHeadingElement, any>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={className} {...props} />
));
Title.displayName = "DialogTitle";

export const Description = React.forwardRef<HTMLParagraphElement, any>(({ className, ...props }, ref) => (
  <p ref={ref} className={className} {...props} />
));
Description.displayName = "DialogDescription";
