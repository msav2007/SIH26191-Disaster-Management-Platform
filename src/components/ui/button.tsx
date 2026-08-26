import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';
type ButtonSize = 'md' | 'sm';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-white shadow-sm hover:bg-[color-mix(in_srgb,var(--accent)_90%,black)]',
  secondary:
    'border border-[var(--border-strong)] bg-transparent text-[var(--surface-strong)] hover:bg-[var(--surface-muted)]',
  ghost: 'bg-transparent text-[var(--accent-strong)] hover:bg-[var(--surface-muted)]',
  danger: 'bg-[var(--danger)] text-white hover:bg-[color-mix(in_srgb,var(--danger)_88%,black)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-2 text-xs',
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
    'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60',
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

