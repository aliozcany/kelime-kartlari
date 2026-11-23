import * as React from 'react';
import { Pressable } from 'react-native';
import { cn } from '../../lib/utils';
import { Text } from './text';

// Seçilebilir küçük etiket (kelime türü, konu)
export function Chip({ active, label, className, dashed, ...props }) {
  return (
    <Pressable
      className={cn(
        'h-9 justify-center rounded-full border px-3.5 active:opacity-70',
        active ? 'border-primary bg-primary' : 'border-border bg-card',
        dashed && 'border-dashed border-input bg-transparent',
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          'font-sans-md text-sm',
          active ? 'text-primary-foreground' : dashed ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
