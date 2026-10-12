import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { isDue, todayStr, STAGE_LABELS, formatDay } from '../dates';
import { markKnown, markUnknown } from '../srs';

export default function StudyScreen({ cards, onUpdate }) {
  const today = todayStr();
  const dueIds = useMemo(() => cards.filter((c) => isDue(c, today)).map((c) => c.id), [cards, today]);

  // Oturum kuyruğu: cevaplanan kart (bilinse de bilinmese de) bugünlük çıkar
  const [queue, setQueue] = useState(dueIds);
  // Bugün tekrar edilen kart sayısı kayıtlardan hesaplanır; sekme değişince ya da uygulama kapanınca sıfırlanmaz
  const doneCount = useMemo(
    () => cards.filter((c) => (c.reviews || []).some((r) => r.date === today)).length,
    [cards, today]
  );
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  // Yeni kart eklendiğinde ya da gün değiştiğinde kuyruğu tazele (oturum ortasında değilse)
  useEffect(() => {
    setQueue((q) => (q.length === 0 ? dueIds : q.filter((id) => cards.some((c) => c.id === id))));
  }, [dueIds.join(',')]);

  const card = cards.find((c) => c.id === queue[0]);

  const reset = () => {
    setFlipped(false);
    setShowHint(false);
    anim.setValue(0);
  };

  const flip = () => {
    Animated.spring(anim, { toValue: flipped ? 0 : 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
    setFlipped(!flipped);
  };

  const answer = (ok) => {
    if (!card) return;
    onUpdate(ok ? markKnown(card, today) : markUnknown(card, today));
    setQueue((q) => q.slice(1));
    reset();
  };

  if (!card) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{doneCount > 0 ? 'Bugünlük bitti 🎉' : 'Bugün tekrar yok'}</Text>
        <Text style={styles.emptyText}>
          {doneCount > 0
            ? `${doneCount} kelimeyi tekrar ettin. Yarın görüşürüz.`
            : 'Yeni kelime ekle; eklediğin kelimeler ertesi gün buraya gelir.'}
        </Text>
      </View>
    );
  }

  const frontRot = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRot = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.counter}>Kalan: {queue.length}</Text>
        <Text style={styles.badge}>{STAGE_LABELS[card.stage]} tekrarı</Text>
      </View>

      <Pressable onPress={flip} style={styles.cardArea}>
        <Animated.View style={[styles.card, { transform: [{ perspective: 1000 }, { rotateY: frontRot }] }]}>
          <Text style={styles.lang}>İNGİLİZCE</Text>
          <Text style={styles.word}>{card.en}</Text>
          <Text style={styles.tapHint}>Çevirmek için dokun</Text>
        </Animated.View>
        <Animated.View
          style={[styles.card, styles.cardBack, { transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}
        >
          <Text style={[styles.lang, { color: C.accent }]}>TÜRKÇE</Text>
          <Text style={styles.word}>{card.tr}</Text>
          {card.example ? <Text style={styles.exampleBack}>“{card.example}”</Text> : null}
          {card.reference ? <Text style={styles.reference}>📍 {card.reference}</Text> : null}
          {card.topic ? <Text style={styles.tag}>{card.topic}</Text> : null}
          <Text style={styles.added}>Eklendi: {formatDay(card.createdAt)}</Text>
        </Animated.View>
      </Pressable>

      {!flipped && (
        <View style={styles.hintArea}>
          {showHint ? (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>{card.example ? `“${card.example}”` : 'Bu kelime için örnek cümle eklenmemiş.'}</Text>
            </View>
          ) : (
            <Pressable onPress={() => setShowHint(true)} style={styles.hintBtn}>
              <Text style={styles.hintBtnText}>💡 İpucu</Text>
            </Pressable>
          )}
        </View>
      )}

      {flipped ? (
        <View style={styles.answerRow}>
          <Pressable onPress={() => answer(false)} style={[styles.answerBtn, { backgroundColor: C.warnSoft }]}>
            <Text style={[styles.answerText, { color: C.warn }]}>Bilemedim</Text>
          </Pressable>
          <Pressable onPress={() => answer(true)} style={[styles.answerBtn, { backgroundColor: C.accent }]}>
            <Text style={[styles.answerText, { color: '#fff' }]}>Bildim</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.answerRow} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  counter: { color: C.muted, fontSize: 15 },
  badge: { color: C.accent, backgroundColor: C.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 13, overflow: 'hidden' },
  cardArea: { flex: 1, maxHeight: 380 },
  card: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: C.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', justifyContent: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 1, borderColor: C.line,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  cardBack: { backgroundColor: '#FBFDFC' },
  lang: { position: 'absolute', top: 20, fontSize: 12, letterSpacing: 1.5, color: C.muted, fontWeight: '600' },
  word: { fontSize: 36, fontWeight: '700', color: C.ink, textAlign: 'center' },
  tapHint: { position: 'absolute', bottom: 20, color: C.muted, fontSize: 13 },
  exampleBack: { marginTop: 18, fontSize: 16, color: C.muted, textAlign: 'center', fontStyle: 'italic' },
  reference: { marginTop: 12, fontSize: 14, color: C.muted, textAlign: 'center' },
  tag: { marginTop: 10, color: C.accent, backgroundColor: C.accentSoft, fontSize: 12, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  added: { position: 'absolute', bottom: 20, color: C.muted, fontSize: 12 },
  hintArea: { minHeight: 70, justifyContent: 'center', marginTop: 16 },
  hintBtn: { alignSelf: 'center', backgroundColor: C.hintSoft, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 24 },
  hintBtnText: { color: C.hint, fontSize: 16, fontWeight: '600' },
  hintBox: { backgroundColor: C.hintSoft, borderRadius: 14, padding: 14 },
  hintText: { color: C.hint, fontSize: 16, fontStyle: 'italic', textAlign: 'center' },
  answerRow: { flexDirection: 'row', gap: 12, marginTop: 12, minHeight: 56 },
  answerBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  answerText: { fontSize: 17, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: C.ink, marginBottom: 8 },
  emptyText: { fontSize: 16, color: C.muted, textAlign: 'center', lineHeight: 22 },
});
