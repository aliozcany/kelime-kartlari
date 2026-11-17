import React, { useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { isMastered, todayStr } from '../dates';
import { missCount, recordTest, restartPlan } from '../srs';
import FlipCard from '../components/FlipCard';
import EditCardSheet from '../components/EditCardSheet';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Kelime Haznem: 5/5 tekrarı bitmiş kelimeler. Günlük çalışmaya gelmezler;
// kullanıcı istediğinde buradan kendini test eder. Test, tekrar planını değiştirmez.
export default function VaultScreen({ cards, onUpdate, topics, onAddTopic, onRemoveTopic }) {
  const today = todayStr();
  const mastered = useMemo(
    () => cards.filter(isMastered).sort((a, b) => a.en.localeCompare(b.en, 'en')),
    [cards]
  );

  const [queue, setQueue] = useState(null); // null → test yok
  const [results, setResults] = useState([]); // [{ id, ok }]
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const resetCard = () => {
    setFlipped(false);
    anim.setValue(0);
  };

  const start = () => {
    setQueue(shuffle(mastered.map((c) => c.id)));
    setResults([]);
    resetCard();
  };

  const exit = () => {
    setQueue(null);
    setResults([]);
    resetCard();
  };

  const flip = () => {
    Animated.spring(anim, { toValue: flipped ? 0 : 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
    setFlipped(!flipped);
  };

  // Test sırasında silinen kartları atla
  const liveQueue = queue ? queue.filter((id) => cards.some((c) => c.id === id)) : null;
  const card = liveQueue ? cards.find((c) => c.id === liveQueue[0]) : null;

  const answer = (ok) => {
    if (!card) return;
    onUpdate(recordTest(card, ok, today));
    setResults((r) => [...r, { id: card.id, ok }]);
    setQueue(liveQueue.slice(1));
    resetCard();
  };

  // ---- Test bitti: özet ----
  if (liveQueue && !card) {
    const missed = results.filter((r) => !r.ok).map((r) => cards.find((c) => c.id === r.id)).filter(Boolean);
    const known = results.length - missed.length;

    const restartMissed = () => {
      Alert.alert(
        'Tekrar planına al',
        `${missed.length} kelime günlük çalışmaya geri dönecek ve 1. gün, 3. gün, 1. hafta… planı baştan başlayacak.`,
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Planına al',
            onPress: () => {
              missed.forEach((c) => onUpdate(restartPlan(c, today)));
              exit();
            },
          },
        ]
      );
    };

    return (
      <FlatList
        data={missed}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.listPad}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroBig}>{known}/{results.length}</Text>
              <Text style={styles.heroText}>
                {missed.length === 0 ? 'Hepsini bildin 🎉' : `${missed.length} kelimeyi bilemedin`}
              </Text>
            </View>
            {missed.length > 0 ? <Text style={styles.section}>Bilemediklerin</Text> : null}
          </View>
        }
        renderItem={({ item }) => <WordRow card={item} />}
        ListFooterComponent={
          <View style={{ marginTop: 16, gap: 10 }}>
            {missed.length > 0 ? (
              <Pressable onPress={restartMissed} style={[styles.btn, { backgroundColor: C.warnSoft }]}>
                <Text style={[styles.btnText, { color: C.warn }]}>Bilemediklerimi tekrar planına al</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={exit} style={styles.btn}>
              <Text style={styles.btnText}>Haznem'e dön</Text>
            </Pressable>
          </View>
        }
      />
    );
  }

  // ---- Test sırasında ----
  if (card) {
    const done = results.length;
    const total = done + liveQueue.length;
    return (
      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <Pressable onPress={exit} hitSlop={8}>
            <Text style={styles.exit}>✕ Testi bitir</Text>
          </Pressable>
          <View style={styles.topRight}>
            {flipped ? (
              <Pressable onPress={() => setEditing(true)} hitSlop={8} style={styles.editBtn}>
                <Text style={styles.editText}>✏️ Düzenle</Text>
              </Pressable>
            ) : null}
            <Text style={styles.counter}>{done + 1}/{total}</Text>
          </View>
        </View>

        <FlipCard card={card} anim={anim} onPress={flip} />

        <View style={styles.answerRow}>
          {flipped ? (
            <>
              <Pressable onPress={() => answer(false)} style={[styles.answerBtn, { backgroundColor: C.warnSoft }]}>
                <Text style={[styles.answerText, { color: C.warn }]}>Bilemedim</Text>
              </Pressable>
              <Pressable onPress={() => answer(true)} style={[styles.answerBtn, { backgroundColor: C.accent }]}>
                <Text style={[styles.answerText, { color: '#fff' }]}>Bildim</Text>
              </Pressable>
            </>
          ) : null}
        </View>

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

  // ---- Haznem listesi ----
  return (
    <FlatList
      data={mastered}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.listPad}
      ListHeaderComponent={
        <View style={styles.hero}>
          <Text style={styles.heroBig}>{mastered.length}</Text>
          <Text style={styles.heroText}>kelime haznende</Text>
          <Text style={styles.heroSub}>
            5/5 tekrarı biten kelimeler buraya gelir ve günlük çalışmada artık sorulmaz. İstediğin zaman kendini test
            edebilirsin.
          </Text>
          <Pressable
            onPress={start}
            disabled={mastered.length === 0}
            style={[styles.btn, { alignSelf: 'stretch', marginTop: 16 }, mastered.length === 0 && { opacity: 0.4 }]}
          >
            <Text style={styles.btnText}>Teste başla</Text>
          </Pressable>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Henüz 5/5 tamamlanan kelime yok.</Text>}
      renderItem={({ item }) => <WordRow card={item} />}
    />
  );
}

function WordRow({ card }) {
  const misses = missCount(card);
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.en}>{card.en}</Text>
        <Text style={styles.tr}>{card.tr}</Text>
      </View>
      {misses > 0 ? <Text style={styles.miss}>✗ {misses}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  listPad: { padding: 16, paddingBottom: 32 },
  hero: { backgroundColor: C.accentSoft, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12 },
  heroBig: { fontSize: 44, fontWeight: '800', color: C.accent },
  heroText: { fontSize: 17, fontWeight: '700', color: C.ink, marginTop: 2 },
  heroSub: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  section: { fontSize: 16, fontWeight: '700', color: C.ink, marginTop: 8, marginBottom: 8, paddingHorizontal: 4 },
  btn: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  en: { fontSize: 17, fontWeight: '600', color: C.ink },
  tr: { fontSize: 15, color: C.muted, marginTop: 2 },
  miss: { color: C.warn, backgroundColor: C.warnSoft, fontSize: 13, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  empty: { textAlign: 'center', color: C.muted, marginTop: 24, fontSize: 15 },
  wrap: { flex: 1, padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exit: { color: C.muted, fontSize: 15, fontWeight: '600' },
  counter: { color: C.accent, backgroundColor: C.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 13, overflow: 'hidden' },
  editBtn: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  editText: { fontSize: 13, fontWeight: '600', color: C.ink },
  answerRow: { flexDirection: 'row', gap: 12, marginTop: 16, minHeight: 56 },
  answerBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  answerText: { fontSize: 17, fontWeight: '700' },
});
