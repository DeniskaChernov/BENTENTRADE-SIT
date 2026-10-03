"use client";

import * as React from "react";
import { Check as CheckIcon } from "../../utils/lucide-stub";
import { cn } from "./utils";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          data-slot="checkbox"
          className={cn(
            "peer size-4 shrink-0 rounded-[4px] border border-border bg-input-background appearance-none cursor-pointer transition-all",
            "checked:bg-primary checked:text-primary-foreground checked:border-primary",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
            "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "shadow-xs",
            className,
          )}
          onChange={handleChange}
          {...props}
        />
        <CheckIcon 
          className={cn(
            "absolute size-3.5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-primary-foreground opacity-0 transition-opacity",
            "peer-checked:opacity-100"
          )}
        />
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
