"use client";
import "./Text.scss";
import { ReactNode } from "react";

interface TextProps {
  children: ReactNode;
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
  color?: "default" | "primary" | "secondary" | "danger" | "success";
  align?: "left" | "center" | "right";
  className?: string;
}

export default function Text({ 
  children, 
  variant = "body",
  color = "default",
  align = "left",
  className = ""
}: TextProps) {
  const Tag = variant === "h1" || variant === "h2" || variant === "h3" ? variant : "p";
  
  return (
    <Tag className={`text text-${variant} text-color-${color} text-align-${align} ${className}`}>
      {children}
    </Tag>
  );
}
