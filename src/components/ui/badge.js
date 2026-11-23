import * as React from 'react';
import { View } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text, TextClassContext } from './text';

const badgeVariants = cva('flex-row items-center self-start rounded-md px-2 py-0.5', {
  variants: {
    variant: {
      default: 'bg-muted',
      accent: 'bg-accent-soft',
      danger: 'bg-danger-soft',
      highlight: 'bg-highlight',
      outline: 'border border-border',
    },
  },
  defaultVariants: { variant: 'default' },
});

const badgeTextVariants = cva('font-sans-sb text-xs', {
  variants: {
    variant: {
      default: 'text-muted-foreground',
      accent: 'text-accent',
      danger: 'text-danger',
      highlight: 'text-highlight-foreground',
      outline: 'text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Badge({ variant, className, children, ...props }) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View className={cn(badgeVariants({ variant }), className)} {...props}>
        {typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children}
      </View>
    </TextClassContext.Provider>
  );
}
