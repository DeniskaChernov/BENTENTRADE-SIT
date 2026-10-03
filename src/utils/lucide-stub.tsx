// Заглушка для lucide-react в Figma Make
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

const createIcon = (displayName: string, pathData: string) => {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, color = 'currentColor', strokeWidth = 2, className = '', ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {pathData === 'path' ? <path d="M3 12h18M12 3v18" /> : <path d={pathData} />}
      </svg>
    )
  );
  Icon.displayName = displayName;
  return Icon;
};

// Export all commonly used icons
export const Menu = createIcon('Menu', 'M3 12h18M3 6h18M3 18h18');
export const X = createIcon('X', 'M18 6L6 18M6 6l12 12');
export const ShoppingCart = createIcon('ShoppingCart', 'M9 2L8 6M16 2l1 4M3.5 6h17l-1.8 9H5.3L3.5 6zM10 21a1 1 0 100-2 1 1 0 000 2zM17 21a1 1 0 100-2 1 1 0 000 2z');
export const Globe = createIcon('Globe', 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20');
export const ChevronRight = createIcon('ChevronRight', 'M9 18l6-6-6-6');
export const ChevronLeft = createIcon('ChevronLeft', 'M15 18l-6-6 6-6');
export const ChevronDown = createIcon('ChevronDown', 'M6 9l6 6 6-6');
export const ChevronUp = createIcon('ChevronUp', 'M18 15l-6-6-6 6');
export const Check = createIcon('Check', 'M20 6L9 17l-5-5');
export const Minus = createIcon('Minus', 'M5 12h14');
export const Plus = createIcon('Plus', 'M12 5v14M5 12h14');
export const Star = createIcon('Star', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
export const Package = createIcon('Package', 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z');
export const Palette = createIcon('Palette', 'M12 2a10 10 0 00-9 14 1 1 0 001 1h4a1 1 0 001-1v-1a2 2 0 114 0v1a1 1 0 001 1h4a1 1 0 001-1 10 10 0 00-7-14z');
export const Users = createIcon('Users', 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z');
export const Mail = createIcon('Mail', 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6');
export const Phone = createIcon('Phone', 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z');
export const MapPin = createIcon('MapPin', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z');
export const Send = createIcon('Send', 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z');
export const Search = createIcon('Search', 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35');
export const Filter = createIcon('Filter', 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z');
export const Heart = createIcon('Heart', 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z');
export const Share2 = createIcon('Share2', 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13');
export const MessageSquare = createIcon('MessageSquare', 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z');
export const Calendar = createIcon('Calendar', 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18');
export const Clock = createIcon('Clock', 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2');
export const TrendingUp = createIcon('TrendingUp', 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6');
export const Award = createIcon('Award', 'M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.11');
export const ShoppingBag = createIcon('ShoppingBag', 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 11-8 0');
export const Image = createIcon('Image', 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21');
export const Facebook = createIcon('Facebook', 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z');
export const Instagram = createIcon('Instagram', 'M16 8a6 6 0 11-12 0 6 6 0 0112 0zM16.5 7.5h.01M8 2h8a6 6 0 016 6v8a6 6 0 01-6 6H8a6 6 0 01-6-6V8a6 6 0 016-6z');
export const Twitter = createIcon('Twitter', 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z');
export const Linkedin = createIcon('Linkedin', 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z');
export const Youtube = createIcon('Youtube', 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z');
export const Eye = createIcon('Eye', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z');
export const EyeOff = createIcon('EyeOff', 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22');
export const Lock = createIcon('Lock', 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 1110 0v4');
export const Unlock = createIcon('Unlock', 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 019.9-1');
export const Shield = createIcon('Shield', 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
export const AlertCircle = createIcon('AlertCircle', 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v4M12 16h.01');
export const Info = createIcon('Info', 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01');
export const HelpCircle = createIcon('HelpCircle', 'M12 2a10 10 0 100 20 10 10 0 000-20zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01');
export const Settings = createIcon('Settings', 'M12 15a3 3 0 100-6 3 3 0 000 6z');
export const Trash2 = createIcon('Trash2', 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6');
export const Edit = createIcon('Edit', 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7');
export const Copy = createIcon('Copy', 'M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1M9 9h9a2 2 0 012 2v9a2 2 0 01-2 2H9a2 2 0 01-2-2v-9a2 2 0 012-2z');
export const Download = createIcon('Download', 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3');
export const Upload = createIcon('Upload', 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12');
export const ExternalLink = createIcon('ExternalLink', 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3');
export const Loader2 = createIcon('Loader2', 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83');
export const MoreVertical = createIcon('MoreVertical', 'M12 5v.01M12 12v.01M12 19v.01');
export const MoreHorizontal = createIcon('MoreHorizontal', 'M5 12h.01M12 12h.01M19 12h.01');
export const ArrowRight = createIcon('ArrowRight', 'M5 12h14M12 5l7 7-7 7');
export const ArrowLeft = createIcon('ArrowLeft', 'M19 12H5M12 19l-7-7 7-7');
export const ArrowUp = createIcon('ArrowUp', 'M12 19V5M5 12l7-7 7 7');
export const ArrowDown = createIcon('ArrowDown', 'M12 5v14M19 12l-7 7-7-7');
export const Zap = createIcon('Zap', 'M13 2L3 14h9l-1 8 10-12h-9l1-8z');
export const Sparkles = createIcon('Sparkles', 'M12 2l1.09 3.26L16.34 6.34l-3.26 1.09L12 10.68l-1.09-3.26L7.66 6.34l3.26-1.09L12 2zM5 22l.17-.5.5-.17-.5-.17L5 21l-.17.5-.5.17.5.17L5 22zM19 10l.34-1 1-.34-1-.34L19 8l-.34 1-1 .34 1 .34.34 1z');
export const FileText = createIcon('FileText', 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z');
export const Folder = createIcon('Folder', 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z');
export const Home = createIcon('Home', 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z');
export const Bell = createIcon('Bell', 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0');
export const User = createIcon('User', 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z');
export const LogIn = createIcon('LogIn', 'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3');
export const LogOut = createIcon('LogOut', 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9');
export const Maximize2 = createIcon('Maximize2', 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7');
export const Minimize2 = createIcon('Minimize2', 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7');
export const CheckCircle = createIcon('CheckCircle', 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3');
export const CheckCircle2 = createIcon('CheckCircle2', 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3');
export const XCircle = createIcon('XCircle', 'M12 2a10 10 0 100 20 10 10 0 000-20zM15 9l-6 6M9 9l6 6');
export const Truck = createIcon('Truck', 'M16 3h4a1 1 0 011 1v11a1 1 0 01-1 1h-2m-6 0h-4m-2 0H3a1 1 0 01-1-1V6a1 1 0 011-1h10m0 0l3 4M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z');
export const Wallet = createIcon('Wallet', 'M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12h.01');
export const MessageCircle = createIcon('MessageCircle', 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z');
export const Cookie = createIcon('Cookie', 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 7h.01M12 11h.01M8 11h.01M16 11h.01M12 15h.01');
export const Building = createIcon('Building', 'M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18M6 12h12M4 22h16');
export const RefreshCw = createIcon('RefreshCw', 'M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15');
export const Database = createIcon('Database', 'M12 8c-4 0-7-1.5-7-3s3-1.5 7-1.5S19 3.5 19 5s-3 1.5-7 1.5zM5 5v6c0 1.5 3 3 7 3s7-1.5 7-3V5M5 11v6c0 1.5 3 3 7 3s7-1.5 7-3v-6');
export const BarChart3 = createIcon('BarChart3', 'M3 3v18h18M18 17V9M13 17V5M8 17v-3');
export const LayoutGrid = createIcon('LayoutGrid', 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7z');
export const List = createIcon('List', 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01');
export const CreditCard = createIcon('CreditCard', 'M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22');
export const RotateCcw = createIcon('RotateCcw', 'M1 4v6h6M3.51 15a9 9 0 102.13-9.36L1 10');
export const UserPlus = createIcon('UserPlus', 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6');
export const Sun = createIcon('Sun', 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 8a4 4 0 100 8 4 4 0 000-8z');
export const Droplets = createIcon('Droplets', 'M12 2.69l5.66 8.36a6 6 0 11-11.32 0L12 2.69z');
export const Moon = createIcon('Moon', 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z');
export const Monitor = createIcon('Monitor', 'M20 3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2zM8 21h8M12 17v4');
export const AlertTriangle = createIcon('AlertTriangle', 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01');
export const Leaf = createIcon('Leaf', 'M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C7.03 15.5 7 16 7 16.5c0 2.5 2 4.5 4.5 4.5 0 0 .5-.03 1-.08C13.36 21.15 11 23 8 23c-3 0-6-2-6-2z');
export const Quote = createIcon('Quote', 'M3 21c3 0 7-1 7-8V5c0-1.25-.76-2.5-2-2.5S4 3.75 4 5v6c0 1.25.76 2.5 2 2.5 0 0 0 5.5-3 7.5zM15 21c3 0 7-1 7-8V5c0-1.25-.76-2.5-2-2.5S16 3.75 16 5v6c0 1.25.76 2.5 2 2.5 0 0 0 5.5-3 7.5z');
export const Factory = createIcon('Factory', 'M2 20a2 2 0 002 2h16a2 2 0 002-2V8l-7 5V8l-7 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2zM17 14h.01M12 14h.01M7 14h.01');
