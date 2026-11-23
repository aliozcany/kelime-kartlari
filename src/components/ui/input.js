import * as React from 'react';
import { TextInput } from 'react-native';
import { cn } from '../../lib/utils';
import { useColors } from '../../theme';

export const Input = React.forwardRef(function Input({ className, multiline, ...props }, ref) {
  const colors = useColors();
  return (
    <TextInput
      ref={ref}
      multiline={multiline}
      placeholderTextColor={colors.placeholder}
      className={cn(
        'rounded-xl border border-input bg-card px-3.5 font-sans text-base text-foreground',
        'focus:border-foreground',
        multiline ? 'min-h-[72px] py-3' : 'h-12',
        className
      )}
      style={multiline ? { textAlignVertical: 'top' } : undefined}
      {...props}
    />
  );
});
