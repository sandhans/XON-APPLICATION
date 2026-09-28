import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Heart,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  MoreHorizontal,
  Building2,
  Landmark,
  Smartphone,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Tag,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Heart,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  MoreHorizontal,
  Building2,
  Landmark,
  Smartphone,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Tag,
  CircleDollarSign,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', size }) => {
  const IconComponent = ICON_MAP[name] || CircleDollarSign;
  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Utensils',
  'Car',
  'ShoppingBag',
  'Receipt',
  'Film',
  'HeartPulse',
  'GraduationCap',
  'Heart',
  'Briefcase',
  'Laptop',
  'TrendingUp',
  'Gift',
  'PlusCircle',
  'MoreHorizontal',
  'Building2',
  'Smartphone',
  'Wallet',
];
