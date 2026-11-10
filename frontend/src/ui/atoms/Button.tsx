import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  small?: boolean;
}

export function Button({ variant = 'default', small, className = '', type = 'button', ...rest }: ButtonProps) {
  const classes = ['btn', variant !== 'default' && `btn--${variant}`, small && 'btn--small', className]
    .filter(Boolean)
    .join(' ');
  return <button type={type} className={classes} {...rest} />;
}
