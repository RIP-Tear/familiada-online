'use client';
import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Dłuższe opóźnienie dla płynniejszej animacji
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    } else if (shouldRender) {
      setIsAnimating(false);
      // Czas musi odpowiadać czasowi transition w CSS (300ms)
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div 
      className={`modal-overlay ${isAnimating ? 'active' : ''}`}
      onClick={onClose}
    >
      <div 
        className={`modal-content ${isAnimating ? 'active' : ''} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
