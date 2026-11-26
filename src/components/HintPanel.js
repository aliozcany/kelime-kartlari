import React, { useState } from 'react';
import { View } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { hintsOf } from '../srs';
import { useColors } from '../theme';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { t } from '../i18n';


// İpuçları butona her basışta bir tane açılır: cümle → eş anlamlı → zıt anlamlı.
// Kartta olmayan ipucu atlanır. Kart değişince sıfırlanması için key={card.id} ile kullanılır.
export default function HintPanel({ card }) {
  const colors = useColors();
  const hints = hintsOf(card);
  const [shown, setShown] = useState(0);

  if (hints.length === 0) {
    return <Text variant="small" className="text-center">{t('hint.none')}</Text>;
  }

  const left = hints.length - shown;

  return (
    <View className="gap-2">
      {hints.slice(0, shown).map((h) => (
        <View key={h.key} className="rounded-xl bg-hint px-3.5 py-2.5">
          <Text variant="overline" className="mb-0.5 text-hint-foreground/75">{h.label}</Text>
          <Text className={h.key === 'example' ? 'font-serif-i text-[17px] text-hint-foreground' : 'font-sans-md text-hint-foreground'}>
            {h.text}
          </Text>
        </View>
      ))}
      {left > 0 ? (
        <Button variant="outline" size="sm" className="self-center px-4" onPress={() => setShown(shown + 1)}>
          <Lightbulb size={16} color={colors.foreground} strokeWidth={2} />
          <Text>{shown === 0 ? t('hint.first') : t('hint.next')}</Text>
          <Text className="font-sans text-muted-foreground">{left}</Text>
        </Button>
      ) : null}
    </View>
  );
}
