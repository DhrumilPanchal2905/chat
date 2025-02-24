import React from "react";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`overflow-y-auto rounded-lg scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = "ScrollArea";
