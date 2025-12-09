"use client";
import "./Card.scss";
import { ReactNode, MouseEventHandler } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "highlight" | "dark";
  onClick?: MouseEventHandler<HTMLDivElement> | null;
  className?: string;
  hoverable?: boolean;
}

export default function Card({ 
  children, 
  variant = "default",
  onClick = null,
  className = "",
  hoverable = false
}: CardProps) {
  const isClickable = onClick !== null;
  
  return (
    <div
      className={`card card-${variant} ${isClickable || hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick || undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  );
}
