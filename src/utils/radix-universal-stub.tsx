// Универсальная заглушка для всех @radix-ui компонентов
import * as React from "react";

// Список специфических пропсов Radix UI, которые не должны попадать в DOM
const RADIX_PROPS = new Set([
  'asChild',
  'onValueChange',
  'onCheckedChange',
  'onOpenChange',
  'defaultValue',
  'defaultOpen',
  'defaultChecked',
  'forceMount',
  'collapsible',
  'orientation',
  'dir',
  'loop',
  'rovingFocus',
  'activationMode',
  'delayDuration',
  'skipDelayDuration',
  'disableHoverableContent',
  'side',
  'sideOffset',
  'align',
  'alignOffset',
  'avoidCollisions',
  'collisionBoundary',
  'collisionPadding',
  'sticky',
  'hideWhenDetached',
  'position',
  'modal',
  'trapFocus',
  'onEscapeKeyDown',
  'onPointerDownOutside',
  'onInteractOutside',
]);

// Фильтрация пропсов для передачи в DOM
const filterProps = (props: any) => {
  const filtered: any = {};
  for (const key in props) {
    if (!RADIX_PROPS.has(key)) {
      filtered[key] = props[key];
    }
  }
  return filtered;
};

// Базовый компонент-обертка
const createWrapper = (displayName: string) => {
  const Component = ({ children, onValueChange, onCheckedChange, onOpenChange, ...props }: any) => {
    const filteredProps = filterProps(props);
    
    // Обрабатываем специфические обработчики событий
    const handleChange = (e: any) => {
      if (onValueChange) onValueChange(e.target?.value ?? e);
      if (onCheckedChange) onCheckedChange(e.target?.checked ?? e);
      if (onOpenChange) onOpenChange(e);
      if (props.onChange) props.onChange(e);
    };

    return (
      <div {...filteredProps} onChange={handleChange}>
        {children}
      </div>
    );
  };
  Component.displayName = displayName;
  return Component;
};

// Базовый forwardRef компонент
const createForwardRef = (element: string, displayName: string) => {
  const Component = React.forwardRef<any, any>(({ children, asChild, ...props }, ref) => {
    const filteredProps = filterProps(props);
    
    // Если asChild = true, рендерим только children с пропсами
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...filteredProps, ref });
    }
    
    return React.createElement(element, { ref, ...filteredProps }, children);
  });
  Component.displayName = displayName;
  return Component;
};

// Context для Select
const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

// Специальный Select Root с поддержкой value и onValueChange
const SelectRoot = ({ children, value, onValueChange, defaultValue, open, onOpenChange, ...props }: any) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value || '');
  const [internalOpen, setInternalOpen] = React.useState(open || false);
  
  const currentValue = value !== undefined ? value : internalValue;
  const currentOpen = open !== undefined ? open : internalOpen;
  
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  }, [open, onOpenChange]);
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
    // Закрываем селект после выбора
    handleOpenChange(false);
  }, [value, onValueChange, handleOpenChange]);
  
  const filteredProps = filterProps(props);
  
  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange,
      open: currentOpen,
      setOpen: handleOpenChange
    }}>
      <div {...filteredProps}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};
SelectRoot.displayName = "SelectRoot";

// Специальный Select Trigger с обработкой клика
const SelectTrigger = React.forwardRef<any, any>(({ children, asChild, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  const filteredProps = filterProps(props);
  
  const handleClick = (e: React.MouseEvent) => {
    if (context?.setOpen) {
      context.setOpen(!context.open);
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  // Если asChild = true, рендерим только children с пропсами
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 
      ...filteredProps, 
      ref,
      onClick: handleClick,
      'data-state': context?.open ? 'open' : 'closed'
    });
  }
  
  return React.createElement(
    'button',
    {
      ref,
      ...filteredProps,
      onClick: handleClick,
      'data-state': context?.open ? 'open' : 'closed',
    },
    children
  );
});
SelectTrigger.displayName = "SelectTrigger";

// Специальный Select Item с обработкой клика
const SelectItem = React.forwardRef<any, any>(({ children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  const filteredProps = filterProps(props);
  
  const handleClick = (e: React.MouseEvent) => {
    if (value && context?.onValueChange) {
      context.onValueChange(value);
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  const isSelected = context?.value === value;
  
  return React.createElement(
    'div',
    {
      ref,
      ...filteredProps,
      onClick: handleClick,
      'data-state': isSelected ? 'checked' : 'unchecked',
      'data-value': value,
      role: 'option',
      'aria-selected': isSelected,
    },
    children
  );
});
SelectItem.displayName = "SelectItem";

// Select stub
export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: createForwardRef("span", "SelectValue"),
  Icon: createForwardRef("span", "SelectIcon"),
  Portal: ({ children }: any) => <>{children}</>,
  Content: createForwardRef("div", "SelectContent"),
  Viewport: createForwardRef("div", "SelectViewport"),
  Item: SelectItem,
  ItemText: createForwardRef("span", "SelectItemText"),
  ItemIndicator: createForwardRef("span", "SelectItemIndicator"),
  Group: createForwardRef("div", "SelectGroup"),
  Label: createForwardRef("div", "SelectLabel"),
  Separator: createForwardRef("div", "SelectSeparator"),
  ScrollUpButton: createForwardRef("div", "SelectScrollUpButton"),
  ScrollDownButton: createForwardRef("div", "SelectScrollDownButton"),
};

// Accordion stub
export const Accordion = {
  Root: createForwardRef("div", "AccordionRoot"),
  Item: createForwardRef("div", "AccordionItem"),
  Trigger: createForwardRef("button", "AccordionTrigger"),
  Content: createForwardRef("div", "AccordionContent"),
  Header: createForwardRef("h3", "AccordionHeader"),
};

// AlertDialog stub
export const AlertDialog = {
  Root: createWrapper("AlertDialogRoot"),
  Trigger: createForwardRef("button", "AlertDialogTrigger"),
  Portal: ({ children }: any) => <>{children}</>,
  Overlay: createForwardRef("div", "AlertDialogOverlay"),
  Content: createForwardRef("div", "AlertDialogContent"),
  Title: createForwardRef("h2", "AlertDialogTitle"),
  Description: createForwardRef("p", "AlertDialogDescription"),
  Action: createForwardRef("button", "AlertDialogAction"),
  Cancel: createForwardRef("button", "AlertDialogCancel"),
};

// AspectRatio stub
export const AspectRatio = {
  Root: createForwardRef("div", "AspectRatio"),
};

// Collapsible stub
export const Collapsible = {
  Root: createWrapper("CollapsibleRoot"),
  Trigger: createForwardRef("button", "CollapsibleTrigger"),
  Content: createForwardRef("div", "CollapsibleContent"),
};

// ContextMenu stub
export const ContextMenu = {
  Root: createWrapper("ContextMenuRoot"),
  Trigger: createForwardRef("div", "ContextMenuTrigger"),
  Portal: ({ children }: any) => <>{children}</>,
  Content: createForwardRef("div", "ContextMenuContent"),
  Item: createForwardRef("div", "ContextMenuItem"),
  CheckboxItem: createForwardRef("div", "ContextMenuCheckboxItem"),
  RadioGroup: createForwardRef("div", "ContextMenuRadioGroup"),
  RadioItem: createForwardRef("div", "ContextMenuRadioItem"),
  ItemIndicator: createForwardRef("span", "ContextMenuItemIndicator"),
  Label: createForwardRef("div", "ContextMenuLabel"),
  Separator: createForwardRef("div", "ContextMenuSeparator"),
  Sub: createWrapper("ContextMenuSub"),
  SubTrigger: createForwardRef("div", "ContextMenuSubTrigger"),
  SubContent: createForwardRef("div", "ContextMenuSubContent"),
};

// DropdownMenu stub
export const DropdownMenu = {
  Root: createWrapper("DropdownMenuRoot"),
  Trigger: createForwardRef("button", "DropdownMenuTrigger"),
  Portal: ({ children }: any) => <>{children}</>,
  Content: createForwardRef("div", "DropdownMenuContent"),
  Item: createForwardRef("div", "DropdownMenuItem"),
  CheckboxItem: createForwardRef("div", "DropdownMenuCheckboxItem"),
  RadioGroup: createForwardRef("div", "DropdownMenuRadioGroup"),
  RadioItem: createForwardRef("div", "DropdownMenuRadioItem"),
  ItemIndicator: createForwardRef("span", "DropdownMenuItemIndicator"),
  Label: createForwardRef("div", "DropdownMenuLabel"),
  Separator: createForwardRef("div", "DropdownMenuSeparator"),
  Sub: createWrapper("DropdownMenuSub"),
  SubTrigger: createForwardRef("div", "DropdownMenuSubTrigger"),
  SubContent: createForwardRef("div", "DropdownMenuSubContent"),
  Group: createForwardRef("div", "DropdownMenuGroup"),
};

// HoverCard stub
export const HoverCard = {
  Root: createWrapper("HoverCardRoot"),
  Trigger: createForwardRef("div", "HoverCardTrigger"),
  Portal: ({ children }: any) => <>{children}</>,
  Content: createForwardRef("div", "HoverCardContent"),
};

// Menubar stub
export const Menubar = {
  Root: createForwardRef("div", "MenubarRoot"),
  Menu: createWrapper("MenubarMenu"),
  Trigger: createForwardRef("button", "MenubarTrigger"),
  Portal: ({ children }: any) => <>{children}</>,
  Content: createForwardRef("div", "MenubarContent"),
  Item: createForwardRef("div", "MenubarItem"),
  CheckboxItem: createForwardRef("div", "MenubarCheckboxItem"),
  RadioGroup: createForwardRef("div", "MenubarRadioGroup"),
  RadioItem: createForwardRef("div", "MenubarRadioItem"),
  ItemIndicator: createForwardRef("span", "MenubarItemIndicator"),
  Label: createForwardRef("div", "MenubarLabel"),
  Separator: createForwardRef("div", "MenubarSeparator"),
  Sub: createWrapper("MenubarSub"),
  SubTrigger: createForwardRef("div", "MenubarSubTrigger"),
  SubContent: createForwardRef("div", "MenubarSubContent"),
  Group: createForwardRef("div", "MenubarGroup"),
};

// NavigationMenu stub
export const NavigationMenu = {
  Root: createForwardRef("nav", "NavigationMenuRoot"),
  List: createForwardRef("ul", "NavigationMenuList"),
  Item: createForwardRef("li", "NavigationMenuItem"),
  Trigger: createForwardRef("button", "NavigationMenuTrigger"),
  Content: createForwardRef("div", "NavigationMenuContent"),
  Link: createForwardRef("a", "NavigationMenuLink"),
  Indicator: createForwardRef("div", "NavigationMenuIndicator"),
  Viewport: createForwardRef("div", "NavigationMenuViewport"),
};

// Popover stub
export const Popover = {
  Root: createWrapper("PopoverRoot"),
  Trigger: createForwardRef("button", "PopoverTrigger"),
  Anchor: createForwardRef("div", "PopoverAnchor"),
  Portal: ({ children }: any) => <>{children}</>,
  Content: createForwardRef("div", "PopoverContent"),
  Close: createForwardRef("button", "PopoverClose"),
};

// Progress stub
export const Progress = {
  Root: createForwardRef("div", "ProgressRoot"),
  Indicator: createForwardRef("div", "ProgressIndicator"),
};

// RadioGroup stub
export const RadioGroup = {
  Root: createForwardRef("div", "RadioGroupRoot"),
  Item: createForwardRef("button", "RadioGroupItem"),
  Indicator: createForwardRef("span", "RadioGroupIndicator"),
};

// Slider stub
export const Slider = {
  Root: createForwardRef("div", "SliderRoot"),
  Track: createForwardRef("div", "SliderTrack"),
  Range: createForwardRef("div", "SliderRange"),
  Thumb: createForwardRef("div", "SliderThumb"),
};

// Switch stub
export const Switch = {
  Root: createForwardRef("button", "SwitchRoot"),
  Thumb: createForwardRef("span", "SwitchThumb"),
};

// Context для Tabs
const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

// Специальный Tabs Root с поддержкой value и onValueChange
const TabsRoot = ({ children, value, onValueChange, defaultValue, ...props }: any) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value || '');
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  }, [value, onValueChange]);
  
  const filteredProps = filterProps(props);
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div {...filteredProps} data-value={currentValue}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};
TabsRoot.displayName = "TabsRoot";

// Специальный Tabs Trigger с обработкой клика
const TabsTrigger = React.forwardRef<any, any>(({ children, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const filteredProps = filterProps(props);
  
  const handleClick = (e: React.MouseEvent) => {
    if (value && context?.onValueChange) {
      context.onValueChange(value);
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  const isActive = context?.value === value;
  
  return React.createElement(
    'button',
    {
      ref,
      ...filteredProps,
      onClick: handleClick,
      'data-state': isActive ? 'active' : 'inactive',
      'data-value': value,
    },
    children
  );
});
TabsTrigger.displayName = "TabsTrigger";

// Tabs stub
export const Tabs = {
  Root: TabsRoot,
  List: createForwardRef("div", "TabsList"),
  Trigger: TabsTrigger,
  Content: createForwardRef("div", "TabsContent"),
};

// Toggle stub
export const Toggle = {
  Root: createForwardRef("button", "ToggleRoot"),
};

// ToggleGroup stub
export const ToggleGroup = {
  Root: createForwardRef("div", "ToggleGroupRoot"),
  Item: createForwardRef("button", "ToggleGroupItem"),
};

// Tooltip stub
export const Tooltip = {
  Provider: ({ children }: any) => <>{children}</>,
  Root: createWrapper("TooltipRoot"),
  Trigger: createForwardRef("button", "TooltipTrigger"),
  Portal: ({ children }: any) => <>{children}</>,
  Content: createForwardRef("div", "TooltipContent"),
};
