import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { C } from '../theme';
import { formatDay, formatMonth, formatShort, formatWeek, monthKey, nextDue, todayStr, weekStart, INTERVALS } from '../dates';
import { missCount } from '../srs';
import { WORD_TYPES } from '../components/CardForm';
import EditCardSheet from '../components/EditCardSheet';
import CalendarView from '../components/CalendarView';

const MODES = [
  { key: 'day', label: 'Gün' },
  { key: 'week', label: 'Hafta' },
  { key: 'month', label: 'Ay' },
  { key: 'cal', label: 'Takvim' },
];

// Büyük/küçük harf ve Türkçe karakter farkını gözetmeden arama
const norm = (s) =>
  (s || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const matches = (card, q) =>
  [card.en, card.tr, card.example, card.synonyms, card.antonyms, card.reference, card.topic].some((f) =>
    norm(f).includes(q)
  );

const typeLabel = (k) => WORD_TYPES.find((t) => t.key === k)?.label || k;

function groupKey(mode, date) {
  if (mode === 'week') return weekStart(date);
  if (mode === 'month') return monthKey(date);
  return date;
}

function groupTitle(mode, key) {
  if (mode === 'week') return formatWeek(key);
  if (mode === 'month') return formatMonth(key);
  return formatDay(key);
}

function status(card, today) {
  const n = nextDue(card);
  if (n === null) return { text: 'Haznede', color: C.accent };
  if (n < today) return { text: 'Gecikti', color: C.warn };
  if (n === today) return { text: 'Bugün', color: C.hint };
  return { text: formatShort(n), color: C.muted };
}

export default function ListScreen({ cards, topics, onUpdate, onDelete, onAddTopic, onRemoveTopic }) {
  const [mode, setMode] = useState('day');
  const [open, setOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const today = todayStr();
  const [calDay, setCalDay] = useState(today);
  const editing = cards.find((c) => c.id === editingId);
  const q = norm(query.trim());

  const counts = useMemo(() => {
    const m = {};
    cards.forEach((c) => {
      m[c.createdAt] = (m[c.createdAt] || 0) + 1;
    });
    return m;
  }, [cards]);

  const sections = useMemo(() => {
    const sorted = [...cards].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    if (q) {
      const data = sorted.filter((c) => matches(c, q));
      return data.length ? [{ key: 'search', title: 'Arama sonuçları', data }] : [];
    }
    if (mode === 'cal') {
      const data = calDay ? sorted.filter((c) => c.createdAt === calDay) : [];
      return data.length ? [{ key: calDay, title: formatDay(calDay), data }] : [];
    }
    const map = new Map();
    sorted.forEach((c) => {
      const k = groupKey(mode, c.createdAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(c);
    });
    return [...map.entries()].map(([k, data]) => ({ key: k, title: groupTitle(mode, k), data }));
  }, [cards, mode, q, calDay]);

  const confirmDelete = (card) => {
    Alert.alert('Kartı sil', `“${card.en}” silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => onDelete(card.id) },
    ]);
  };

  let emptyText = 'Henüz kelime eklemedin.';
  if (q) emptyText = `“${query.trim()}” bulunamadı.`;
  else if (mode === 'cal') emptyText = calDay ? 'Bu gün kelime eklenmemiş.' : 'Kelimelerini görmek için bir güne dokun.';

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="🔍  Kelime ara"
          placeholderTextColor="#A8ACB2"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} style={styles.clear}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {!q ? (
        <View style={styles.segment}>
          {MODES.map((m) => (
            <Pressable key={m.key} onPress={() => setMode(m.key)} style={[styles.segBtn, mode === m.key && styles.segActive]}>
              <Text style={[styles.segText, mode === m.key && styles.segTextActive]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          !q && mode === 'cal' ? <CalendarView counts={counts} selected={calDay} onSelect={setCalDay} today={today} /> : null
        }
        ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
        renderSectionHeader={({ section }) => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{section.title}</Text>
            <Text style={styles.headerCount}>{section.data.length} kelime</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const s = status(item, today);
          const isOpen = open === item.id;
          const misses = missCount(item);
          return (
            <Pressable onPress={() => setOpen(isOpen ? null : item.id)} onLongPress={() => confirmDelete(item)} style={styles.row}>
              <View style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.en}>{item.en}</Text>
                  <Text style={styles.tr}>{item.tr}</Text>
                  {item.topic || item.types?.length ? (
                    <View style={styles.tagRow}>
                      {(item.types || []).map((t) => (
                        <Text key={t} style={styles.typeTag}>{typeLabel(t)}</Text>
                      ))}
                      {item.topic ? <Text style={styles.tag}>{item.topic}</Text> : null}
                    </View>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.status, { color: s.color }]}>{s.text}</Text>
                  {misses > 0 ? <Text style={styles.miss}>✗ {misses}</Text> : null}
                </View>
              </View>
              {isOpen && (
                <View style={styles.detail}>
                  {item.example ? <Text style={styles.example}>“{item.example}”</Text> : null}
                  {item.synonyms ? (
                    <Text style={styles.rel}>
                      <Text style={styles.relKey}>Eş: </Text>
                      {item.synonyms}
                    </Text>
                  ) : null}
                  {item.antonyms ? (
                    <Text style={styles.rel}>
                      <Text style={styles.relKey}>Zıt: </Text>
                      {item.antonyms}
                    </Text>
                  ) : null}
                  {item.reference ? <Text style={styles.reference}>📍 {item.reference}</Text> : null}
                  {misses > 0 ? <Text style={styles.missLine}>{misses} kez bilinemedi</Text> : null}
                  <View style={styles.dots}>
                    {INTERVALS.map((_, i) => (
                      <View key={i} style={[styles.dot, i < item.stage && { backgroundColor: C.accent }]} />
                    ))}
                    <Text style={styles.dotLabel}>{Math.min(item.stage, INTERVALS.length)}/{INTERVALS.length} tekrar</Text>
                  </View>
                  <View style={styles.actions}>
                    <Pressable onPress={() => setEditingId(item.id)} style={styles.actionBtn}>
                      <Text style={[styles.actionText, { color: C.accent }]}>Düzenle</Text>
                    </Pressable>
                    <Pressable onPress={() => confirmDelete(item)} style={[styles.actionBtn, { backgroundColor: C.warnSoft }]}>
                      <Text style={[styles.actionText, { color: C.warn }]}>Sil</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Pressable>
          );
        }}
      />

      <EditCardSheet
        card={editing}
        onClose={() => setEditingId(null)}
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
  searchWrap: { marginHorizontal: 16, marginTop: 12, justifyContent: 'center' },
  search: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, paddingRight: 38, fontSize: 16, color: C.ink,
  },
  clear: { position: 'absolute', right: 14 },
  clearText: { color: C.muted, fontSize: 16 },
  segment: { flexDirection: 'row', marginHorizontal: 16, marginTop: 10, backgroundColor: '#ECE9E2', borderRadius: 12, padding: 4 },
  segBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  segActive: { backgroundColor: C.surface },
  segText: { color: C.muted, fontWeight: '600', fontSize: 15 },
  segTextActive: { color: C.ink },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, marginBottom: 8, paddingHorizontal: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.ink },
  headerCount: { fontSize: 13, color: C.muted },
  row: { backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  en: { fontSize: 17, fontWeight: '600', color: C.ink },
  tr: { fontSize: 15, color: C.muted, marginTop: 2 },
  status: { fontSize: 13, fontWeight: '600', marginLeft: 8 },
  miss: { marginTop: 4, color: C.warn, backgroundColor: C.warnSoft, fontSize: 12, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  missLine: { color: C.warn, marginBottom: 10, fontSize: 14, fontWeight: '600' },
  detail: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  example: { fontStyle: 'italic', color: C.ink, marginBottom: 10, lineHeight: 20 },
  rel: { color: C.ink, marginBottom: 6, fontSize: 14 },
  relKey: { fontWeight: '700', color: C.accent },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.line },
  dotLabel: { marginLeft: 6, color: C.muted, fontSize: 13 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  typeTag: { color: C.hint, backgroundColor: C.hintSoft, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  tag: { color: C.accent, backgroundColor: C.accentSoft, fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  reference: { color: C.muted, marginBottom: 10, fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, backgroundColor: C.accentSoft, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionText: { fontSize: 15, fontWeight: '700' },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 16 },
});
