import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary' | 'outline' | 'cyan' | 'success' | 'info';
type ButtonSize = 'md' | 'sm' | 'xs';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] ring-1 ring-blue-700/30 font-semibold',
  cyan:
    'bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] ring-1 ring-blue-700/30 font-semibold',
  info:
    'bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] ring-1 ring-blue-700/30 font-semibold',
  success:
    'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] ring-1 ring-emerald-700/30 font-semibold',
  secondary:
    'border border-slate-200 bg-white text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98] font-semibold',
  outline:
    'border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] font-medium',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]',
  danger:
    'bg-red-600 text-white shadow-xs hover:bg-red-700 active:scale-[0.98] ring-1 ring-red-700/30 font-semibold',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2 text-xs font-semibold rounded-xl',
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  xs: 'px-2.5 py-1 text-[11px] font-medium rounded-md',
};

export function buttonStyles({
  className,
  size = 'md',
  variant = 'primary',
}: {
  className?: string | undefined;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return cn(
    'inline-flex items-center justify-center gap-1.5 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  className,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return <button className={buttonStyles({ className, size, variant })} type={type} {...props} />;
}
