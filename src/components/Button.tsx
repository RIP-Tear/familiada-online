"use client";
import "./Button.scss";
import { ReactNode, MouseEventHandler } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function Button({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "medium",
  disabled = false,
  icon = null,
  className = ""
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${disabled ? 'btn-disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
    </button>
  );
}
