import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-surface-200 bg-white shadow-card transition-all duration-200 hover:shadow-elevated",
        className
      )}
      {...props}
    />
  );
});

Card.displayName = "Card";

export default Card;