"use client";
import "./Badge.scss";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function Badge({ 
  children, 
  variant = "primary",
  size = "medium",
  className = ""
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {children}
    </span>
  );
}
