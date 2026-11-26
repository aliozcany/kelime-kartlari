import React, { useEffect } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { formatDay } from '../dates';
import { useSettings } from '../settings';
import { missCount } from '../srs';
import { WORD_TYPES } from './CardForm';
import { Volume2 } from 'lucide-react-native';
import { speak, stopSpeaking } from '../speech';
import { useColors } from '../theme';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Text } from './ui/text';
import { t } from '../i18n';


const typeLabel = (k) => WORD_TYPES.find((t) => t.key === k)?.label || k;

// Kartın üst kısmı: küçük başlık ve altında dizin kartlarındaki gibi ince kırmızı çizgi
function CardTop({ label, right }) {
  return (
    <View className="px-6 pt-5">
      <View className="flex-row items-center justify-between pb-3">
        <Text variant="overline">{label}</Text>
        {right ? <Text variant="small">{right}</Text> : null}
      </View>
      <View className="h-px bg-danger/30" />
    </View>
  );
}

function Rel({ label, text }) {
  return (
    <View className="mt-2 flex-row items-baseline justify-center gap-2 px-2">
      <Text variant="overline" className="text-[10px]">{label}</Text>
      <Text className="shrink font-sans-md text-[15px]">{text}</Text>
    </View>
  );
}

// Kelimeyi seslendiren yuvarlak düğme; dokunuş kartı çevirmez
function SpeakButton({ text, lang, size = 20, className }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => speak(text, lang)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={t('common.listen')}
      className={cn('h-10 w-10 items-center justify-center rounded-full bg-muted active:opacity-60', className)}
    >
      <Volume2 size={size} color={colors.foreground} strokeWidth={1.9} />
    </Pressable>
  );
}

// Önü çalışılan dilde, arkası Türkçe ve ayrıntılar olan çevrilebilir kart.
// anim: 0 → ön yüz, 1 → arka yüz (sahibi bileşen yönetir)
export default function FlipCard({ card, anim, onPress, topRight }) {
  const frontRot = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRot = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const misses = missCount(card);
  const { lang, autoSpeak } = useSettings();

  // Yeni kart gelince (ayar açıksa) kelime okunur; ekrandan çıkınca okuma kesilir
  useEffect(() => {
    if (autoSpeak) speak(card.en, lang);
  }, [card.id, autoSpeak]);
  useEffect(() => stopSpeaking, []);

  return (
    <Pressable onPress={onPress} className="max-h-[440px] flex-1">
      <Animated.View style={[styles.face, { transform: [{ perspective: 1200 }, { rotateY: frontRot }] }]}>
        <View className="flex-1 overflow-hidden rounded-3xl border border-border bg-card">
          <CardTop label={lang.label} right={topRight} />
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center font-serif text-[42px] leading-[50px]" adjustsFontSizeToFit numberOfLines={2}>
              {card.en}
            </Text>
            <SpeakButton text={card.en} lang={lang} className="mt-5" />
          </View>
          <Text variant="small" className="pb-5 text-center">{t('card.tapToFlip')}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.face, { transform: [{ perspective: 1200 }, { rotateY: backRot }] }]}>
        <View className="flex-1 overflow-hidden rounded-3xl border border-border bg-card">
          <CardTop label={t('common.meaning')} right={card.en} />
          <ScrollView className="flex-1" contentContainerClassName="flex-grow items-center justify-center px-6 py-4" showsVerticalScrollIndicator={false}>
            <Text className="text-center font-serif text-[34px] leading-[42px]" adjustsFontSizeToFit numberOfLines={3}>
              {card.tr}
            </Text>
            {card.types?.length ? (
              <Text className="mt-1 font-serif-i text-[17px] text-muted-foreground">
                {card.types.map(typeLabel).join(' · ')}
              </Text>
            ) : null}
            {card.example ? (
              <View className="mt-4 items-center gap-2">
                <Text className="text-center font-serif-i text-[17px] leading-6 text-muted-foreground">“{card.example}”</Text>
                <SpeakButton text={card.example} lang={lang} size={17} className="h-8 w-8" />
              </View>
            ) : null}
            {card.synonyms ? <Rel label={t('common.syn')} text={card.synonyms} /> : null}
            {card.antonyms ? <Rel label={t('common.ant')} text={card.antonyms} /> : null}
            {card.reference ? <Text variant="muted" className="mt-3 text-center">{card.reference}</Text> : null}
            {card.topic ? <Badge variant="accent" className="mt-3 self-center">{card.topic}</Badge> : null}
          </ScrollView>
          <Text variant="small" className="pb-4 text-center">
            {t('card.added', { date: formatDay(card.createdAt) })}
            {misses > 0 ? `  ·  ${t('card.missed', { n: misses })}` : ''}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // StyleSheet.absoluteFillObject React Native 0.86'da yok (web'de hâlâ var); değerler açıkça yazılır
  face: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden' },
});
