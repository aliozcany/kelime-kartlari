import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { isDue, todayStr, STAGE_LABELS } from '../dates';
import { markKnown, markUnknown } from '../srs';
import FlipCard from '../components/FlipCard';
import EditCardSheet from '../components/EditCardSheet';

export default function StudyScreen({ cards, onUpdate, topics, onAddTopic, onRemoveTopic }) {
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
  const [editing, setEditing] = useState(false);
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

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.counter}>Kalan: {queue.length}</Text>
        <View style={styles.topRight}>
          {flipped ? (
            <Pressable onPress={() => setEditing(true)} hitSlop={8} style={styles.editBtn}>
              <Text style={styles.editText}>✏️ Düzenle</Text>
            </Pressable>
          ) : null}
          <Text style={styles.badge}>{STAGE_LABELS[card.stage]} tekrarı</Text>
        </View>
      </View>

      <FlipCard card={card} anim={anim} onPress={flip} />

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

      <EditCardSheet
        card={editing ? card : null}
        onClose={() => setEditing(false)}
        onSave={onUpdate}
        cards={cards}
        topics={topics}
        onAddTopic={onAddTopic}
        onRemoveTopic={onRemoveTopic}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  counter: { color: C.muted, fontSize: 15 },
  badge: { color: C.accent, backgroundColor: C.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 13, overflow: 'hidden' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  editText: { fontSize: 13, fontWeight: '600', color: C.ink },
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
