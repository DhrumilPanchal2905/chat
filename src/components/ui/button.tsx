import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const baseClasses =
      "px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary:
        "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
