import * as React from 'react';
import { Pressable } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { TextClassContext } from './text';

const buttonVariants = cva('flex-row items-center justify-center gap-2 rounded-xl active:opacity-80', {
  variants: {
    variant: {
      default: 'bg-primary',
      accent: 'bg-accent',
      danger: 'bg-danger',
      dangerSoft: 'bg-danger-soft',
      secondary: 'bg-muted',
      outline: 'border border-border bg-card',
      ghost: 'active:bg-muted',
    },
    size: {
      default: 'h-12 px-5',
      lg: 'h-14 px-6',
      sm: 'h-9 rounded-lg px-3',
      icon: 'h-10 w-10 rounded-full',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

const buttonTextVariants = cva('font-sans-sb text-base', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      accent: 'text-primary-foreground',
      danger: 'text-primary-foreground',
      dangerSoft: 'text-danger',
      secondary: 'text-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
    },
    size: { default: '', lg: 'text-[17px]', sm: 'text-sm', icon: '' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export function Button({ className, variant, size, disabled, ...props }) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(buttonVariants({ variant, size }), disabled && 'opacity-40', className)}
        disabled={disabled}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}
