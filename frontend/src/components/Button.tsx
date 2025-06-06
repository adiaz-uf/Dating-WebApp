import * as React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "like" | "none";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseCommon =
      "inline-flex items-center justify-center font-medium transition";

    const base =
      variant === "like"
      ? "" + baseCommon
      : "px-4 py-2 rounded-xl text-sm" + baseCommon;

    const variants = {
      default: "bg-pink-600 text-white hover:bg-pink-700",
      outline: "border border-pink-400 text-pink-600 hover:border-pink-600 bg-white hover:bg-pink-50",
      like: "rounded-full text-4xl",
      none: ""
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