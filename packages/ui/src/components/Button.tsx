import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger";
  size?: "default" | "sm";
  children: ReactNode;
}

export function Button({ variant = "default", size = "default", className = "", children, ...props }: ButtonProps) {
  const classes = [
    "btn",
    variant === "primary" && "btn-primary",
    variant === "danger" && "btn-danger",
    size === "sm" && "btn-sm",
    className,
  ].filter(Boolean).join(" ");

  return <button className={classes} {...props}>{children}</button>;
}
