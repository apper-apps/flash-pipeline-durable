import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  className, 
  variant = "default",
  size = "md",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-surface-100 text-surface-800 border-surface-200",
    primary: "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border-primary-200",
    secondary: "bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800 border-secondary-200",
    success: "bg-gradient-to-r from-accent-100 to-accent-200 text-accent-800 border-accent-200",
    warning: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-200",
    danger: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-200",
    outline: "border border-surface-300 text-surface-700 bg-transparent"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full font-medium border transition-all duration-200",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export default Badge;