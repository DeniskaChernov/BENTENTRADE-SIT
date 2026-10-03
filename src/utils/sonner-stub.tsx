// Заглушка для sonner
import * as React from 'react';

export interface ToasterProps {
  theme?: 'light' | 'dark' | 'system';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  expand?: boolean;
  richColors?: boolean;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  closeButton?: boolean;
  [key: string]: any;
}

export const Toaster = ({ className, ...props }: ToasterProps) => {
  return <div className={className} {...props} />;
};

export const toast = {
  success: (message: string, options?: any) => {
    console.log('Toast success:', message, options);
  },
  error: (message: string, options?: any) => {
    console.error('Toast error:', message, options);
  },
  info: (message: string, options?: any) => {
    console.info('Toast info:', message, options);
  },
  warning: (message: string, options?: any) => {
    console.warn('Toast warning:', message, options);
  },
  message: (message: string, options?: any) => {
    console.log('Toast message:', message, options);
  },
  promise: (promise: Promise<any>, options?: any) => {
    console.log('Toast promise:', promise, options);
    return promise;
  },
  loading: (message: string, options?: any) => {
    console.log('Toast loading:', message, options);
  },
  custom: (component: React.ReactNode, options?: any) => {
    console.log('Toast custom:', component, options);
  },
  dismiss: (id?: string | number) => {
    console.log('Toast dismiss:', id);
  },
};
