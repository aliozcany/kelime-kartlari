import React from 'react';
import { Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, X } from 'lucide-react-native';
import { useColors } from '../theme';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { t } from '../i18n';


// Bilemedim / Bildim butonları (günlük çalışma ve Haznem testi)
export default function AnswerRow({ onAnswer }) {
  const colors = useColors();
  const press = (ok) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
    }
    onAnswer(ok);
  };
  return (
    <View className="flex-row gap-3">
      <Button variant="dangerSoft" size="lg" className="flex-1" onPress={() => press(false)}>
        <X size={20} color={colors.danger} strokeWidth={2.4} />
        <Text>{t('answer.no')}</Text>
      </Button>
      <Button variant="accent" size="lg" className="flex-1" onPress={() => press(true)}>
        <Check size={20} color={colors.primaryForeground} strokeWidth={2.4} />
        <Text>{t('answer.yes')}</Text>
      </Button>
    </View>
  );
}
