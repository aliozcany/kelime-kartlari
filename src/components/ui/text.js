import * as React from 'react';
import { Text as RNText } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// React Native Reusables'taki Text deseni: Button gibi kapsayıcılar,
// içlerindeki yazının stilini bu bağlam üzerinden verir.
export const TextClassContext = React.createContext(undefined);

const textVariants = cva('font-sans text-base text-foreground', {
  variants: {
    variant: {
      default: '',
      title: 'font-sans-sb text-[26px] leading-8 tracking-tight',
      heading: 'font-sans-sb text-lg',
      word: 'font-serif text-[22px] leading-7',
      muted: 'text-sm text-muted-foreground',
      small: 'text-xs text-muted-foreground',
      label: 'font-sans-md text-[13px] text-muted-foreground',
      // Büyük harf CSS ile değil Text içinde yapılır; yoksa "i" → "I" olur (Pazartesi → PAZARTESI)
      overline: 'font-sans-sb text-[11px] tracking-[1.6px] text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Text({ className, variant, children, ...props }) {
  const ctx = React.useContext(TextClassContext);
  const content = variant === 'overline' && typeof children === 'string' ? children.toLocaleUpperCase('tr') : children;
  return (
    <RNText className={cn(textVariants({ variant }), ctx, className)} {...props}>
      {content}
    </RNText>
  );
}
