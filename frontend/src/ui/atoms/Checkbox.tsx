import type { InputHTMLAttributes } from 'react';

export function Checkbox({ className = '', ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return <input type="checkbox" className={`checkbox ${className}`} {...rest} />;
}
