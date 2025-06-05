import * as React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition";

    const variants = {
      default: "bg-pink-600 text-white hover:bg-pink-700",
      outline: "border border-pink-400 text-pink-600 hover:border-pink-600 bg-white",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };