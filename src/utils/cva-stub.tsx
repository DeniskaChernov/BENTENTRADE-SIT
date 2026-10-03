// Заглушка для class-variance-authority
export type VariantProps<T> = any;

export function cva(base: string, config?: any) {
  return (props?: any) => {
    let classes = base;
    
    if (config?.variants && props) {
      Object.keys(config.variants).forEach((variantKey) => {
        const variantValue = props[variantKey];
        if (variantValue && config.variants[variantKey][variantValue]) {
          classes += ' ' + config.variants[variantKey][variantValue];
        }
      });
    }
    
    if (config?.defaultVariants && !props) {
      Object.keys(config.defaultVariants).forEach((variantKey) => {
        const variantValue = config.defaultVariants[variantKey];
        if (config.variants[variantKey][variantValue]) {
          classes += ' ' + config.variants[variantKey][variantValue];
        }
      });
    }
    
    if (props?.className) {
      classes += ' ' + props.className;
    }
    
    return classes;
  };
}
