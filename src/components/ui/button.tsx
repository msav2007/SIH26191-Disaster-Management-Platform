import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary' | 'outline' | 'cyan';
type ButtonSize = 'md' | 'sm' | 'xs';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm hover:from-sky-700 hover:to-cyan-700 active:scale-[0.99] ring-1 ring-white/10',
  cyan:
    'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm hover:from-cyan-700 hover:to-teal-700 active:scale-[0.99]',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-[0.99]',
  outline:
    'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 active:scale-[0.99]',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm hover:from-red-700 hover:to-rose-700 active:scale-[0.99]',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2 text-xs font-semibold rounded-lg',
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
    'inline-flex items-center justify-center gap-1.5 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
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
