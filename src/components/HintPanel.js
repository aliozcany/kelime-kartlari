import React, { useState } from 'react';
import { View } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { hintsOf } from '../srs';
import { useColors } from '../theme';
import { Button } from './ui/button';
import { Text } from './ui/text';

// İpuçları butona her basışta bir tane açılır: cümle → eş anlamlı → zıt anlamlı.
// Kartta olmayan ipucu atlanır. Kart değişince sıfırlanması için key={card.id} ile kullanılır.
export default function HintPanel({ card }) {
  const colors = useColors();
  const hints = hintsOf(card);
  const [shown, setShown] = useState(0);

  if (hints.length === 0) {
    return <Text variant="small" className="text-center">Bu kelime için ipucu eklenmemiş.</Text>;
  }

  const left = hints.length - shown;

  return (
    <View className="gap-2">
      {hints.slice(0, shown).map((h) => (
        <View key={h.key} className="rounded-xl bg-highlight/40 px-3.5 py-2.5">
          <Text variant="overline" className="mb-0.5 text-highlight-foreground/70">{h.label}</Text>
          <Text className={h.key === 'example' ? 'font-serif-i text-[17px] text-highlight-foreground' : 'font-sans-md text-highlight-foreground'}>
            {h.text}
          </Text>
        </View>
      ))}
      {left > 0 ? (
        <Button variant="outline" size="sm" className="self-center px-4" onPress={() => setShown(shown + 1)}>
          <Lightbulb size={16} color={colors.foreground} strokeWidth={2} />
          <Text>{shown === 0 ? 'İpucu' : 'Sonraki ipucu'}</Text>
          <Text className="font-sans text-muted-foreground">{left}</Text>
        </Button>
      ) : null}
    </View>
  );
}
