import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Avatar = forwardRef(({ 
  className, 
  src, 
  alt, 
  fallback,
  size = "md",
  ...props 
}, ref) => {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl"
  };

  const initials = fallback || (alt ? alt.split(' ').map(n => n[0]).join('').toUpperCase() : '??');

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
          {initials}
        </div>
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";

export default Avatar;