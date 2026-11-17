import React from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { formatDay } from '../dates';
import { missCount } from '../srs';
import { WORD_TYPES } from './CardForm';

const typeLabel = (k) => WORD_TYPES.find((t) => t.key === k)?.label || k;

// Önü İngilizce, arkası Türkçe ve ayrıntılar olan çevrilebilir kart.
// anim: 0 → ön yüz, 1 → arka yüz (sahibi bileşen yönetir)
export default function FlipCard({ card, anim, onPress }) {
  const frontRot = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRot = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const misses = missCount(card);

  return (
    <Pressable onPress={onPress} style={styles.cardArea}>
      <Animated.View style={[styles.card, { transform: [{ perspective: 1000 }, { rotateY: frontRot }] }]}>
        <Text style={styles.lang}>İNGİLİZCE</Text>
        <Text style={styles.word} adjustsFontSizeToFit numberOfLines={2}>{card.en}</Text>
        <Text style={styles.tapHint}>Çevirmek için dokun</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, { transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}>
        <Text style={[styles.lang, { color: C.accent }]}>TÜRKÇE</Text>
        <ScrollView
          style={styles.backScroll}
          contentContainerStyle={styles.backBody}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.wordBack} adjustsFontSizeToFit numberOfLines={3}>{card.tr}</Text>
          {card.types?.length ? (
            <View style={styles.typeRow}>
              {card.types.map((t) => (
                <Text key={t} style={styles.type}>{typeLabel(t)}</Text>
              ))}
            </View>
          ) : null}
          {card.example ? <Text style={styles.exampleBack}>“{card.example}”</Text> : null}
          {card.synonyms ? <Text style={styles.rel}><Text style={styles.relKey}>≈ </Text>{card.synonyms}</Text> : null}
          {card.antonyms ? <Text style={styles.rel}><Text style={styles.relKey}>≠ </Text>{card.antonyms}</Text> : null}
          {card.reference ? <Text style={styles.reference}>📍 {card.reference}</Text> : null}
          {card.topic ? <Text style={styles.tag}>{card.topic}</Text> : null}
        </ScrollView>
        <Text style={styles.added}>
          Eklendi: {formatDay(card.createdAt)}
          {misses > 0 ? `  ·  ${misses} kez bilinemedi` : ''}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardArea: { flex: 1, maxHeight: 400 },
  card: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: C.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', justifyContent: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 1, borderColor: C.line,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  cardBack: { backgroundColor: '#FBFDFC', paddingTop: 44, paddingBottom: 44 },
  backScroll: { alignSelf: 'stretch' },
  backBody: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  lang: { position: 'absolute', top: 20, fontSize: 12, letterSpacing: 1.5, color: C.muted, fontWeight: '600' },
  word: { fontSize: 36, fontWeight: '700', color: C.ink, textAlign: 'center' },
  wordBack: { fontSize: 32, fontWeight: '700', color: C.ink, textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  type: { color: C.hint, backgroundColor: C.hintSoft, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  tapHint: { position: 'absolute', bottom: 20, color: C.muted, fontSize: 13 },
  exampleBack: { marginTop: 14, fontSize: 16, color: C.muted, textAlign: 'center', fontStyle: 'italic' },
  rel: { marginTop: 8, fontSize: 15, color: C.ink, textAlign: 'center' },
  relKey: { fontWeight: '800', color: C.accent },
  reference: { marginTop: 10, fontSize: 14, color: C.muted, textAlign: 'center' },
  tag: { marginTop: 10, color: C.accent, backgroundColor: C.accentSoft, fontSize: 12, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  added: { position: 'absolute', bottom: 18, color: C.muted, fontSize: 12 },
});
