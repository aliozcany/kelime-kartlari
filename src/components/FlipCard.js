import React from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { formatDay } from '../dates';
import { missCount } from '../srs';
import { WORD_TYPES } from './CardForm';
import { Badge } from './ui/badge';
import { Text } from './ui/text';

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

// Önü İngilizce, arkası Türkçe ve ayrıntılar olan çevrilebilir kart.
// anim: 0 → ön yüz, 1 → arka yüz (sahibi bileşen yönetir)
export default function FlipCard({ card, anim, onPress, topRight }) {
  const frontRot = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRot = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const misses = missCount(card);

  return (
    <Pressable onPress={onPress} className="max-h-[440px] flex-1">
      <Animated.View style={[styles.face, { transform: [{ perspective: 1200 }, { rotateY: frontRot }] }]}>
        <View className="flex-1 overflow-hidden rounded-3xl border border-border bg-card">
          <CardTop label="İngilizce" right={topRight} />
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center font-serif text-[42px] leading-[50px]" adjustsFontSizeToFit numberOfLines={2}>
              {card.en}
            </Text>
          </View>
          <Text variant="small" className="pb-5 text-center">Çevirmek için dokun</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.face, { transform: [{ perspective: 1200 }, { rotateY: backRot }] }]}>
        <View className="flex-1 overflow-hidden rounded-3xl border border-border bg-card">
          <CardTop label="Türkçe" right={card.en} />
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
              <Text className="mt-4 text-center font-serif-i text-[17px] leading-6 text-muted-foreground">“{card.example}”</Text>
            ) : null}
            {card.synonyms ? <Rel label="Eş" text={card.synonyms} /> : null}
            {card.antonyms ? <Rel label="Zıt" text={card.antonyms} /> : null}
            {card.reference ? <Text variant="muted" className="mt-3 text-center">{card.reference}</Text> : null}
            {card.topic ? <Badge variant="accent" className="mt-3 self-center">{card.topic}</Badge> : null}
          </ScrollView>
          <Text variant="small" className="pb-4 text-center">
            Eklendi {formatDay(card.createdAt)}
            {misses > 0 ? `  ·  ${misses} kez bilinemedi` : ''}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: { ...StyleSheet.absoluteFillObject, backfaceVisibility: 'hidden' },
});
