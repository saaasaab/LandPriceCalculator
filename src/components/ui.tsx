// components/ui/card.tsx
import React from 'react';
import './ui.scss'

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}


interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('card', className)} {...props} />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('card__header', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('card__title', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('card__content', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';


export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => (
    <div className="input__container">
      {label && (
        <label htmlFor={id} className="input__label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'input__field',
          error && 'input__field--error',
          className
        )}
        {...props}
      />
    </div>
  )
);
Input.displayName = 'Input';


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'button',
        `button--${variant}`,
        fullWidth && 'button--full',
        disabled && 'button--disabled',
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
);
Button.displayName = 'Button';



export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="checkbox__container">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={cn('checkbox__input', className)}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="checkbox__label">
          {label}
        </label>
      )}
    </div>
  )
);
Checkbox.displayName = 'Checkbox';




interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'info',
  className = '' 
}) => {
  return (
    <div className={`alert alert-${variant} ${className}`}>
      {children}
    </div>
  );
};

// AlertDescription.tsx
interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  children,
  className = ''
}) => {
  return (
    <div className={`alert-description ${className}`}>
      {children}
    </div>
  );
};

