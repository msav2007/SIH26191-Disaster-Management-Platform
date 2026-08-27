import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary' | 'outline';
type ButtonSize = 'md' | 'sm' | 'xs';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-strong)]',
  secondary:
    'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]',
  outline:
    'border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-[var(--surface-muted)]',
  ghost: 'bg-transparent text-[var(--accent-strong)] hover:bg-[var(--surface-muted)]',
  danger: 'bg-[var(--critical)] text-white hover:bg-[color-mix(in_srgb,var(--critical)_88%,black)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-3.5 py-2 text-xs font-semibold',
  sm: 'px-2.5 py-1.5 text-xs font-medium',
  xs: 'px-2 py-1 text-[11px] font-medium',
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
    'inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
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
