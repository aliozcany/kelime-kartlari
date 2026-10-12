import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { formatDay, formatMonth, formatShort, formatWeek, monthKey, nextDue, todayStr, weekStart, INTERVALS } from '../dates';
import CardForm from '../components/CardForm';
import Sheet from '../components/Sheet';

const MODES = [
  { key: 'day', label: 'Gün' },
  { key: 'week', label: 'Hafta' },
  { key: 'month', label: 'Ay' },
];

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
  if (n === null) return { text: 'Tamamlandı', color: C.accent };
  if (n < today) return { text: 'Gecikti', color: C.warn };
  if (n === today) return { text: 'Bugün', color: C.hint };
  return { text: formatShort(n), color: C.muted };
}

export default function ListScreen({ cards, topics, onUpdate, onDelete, onAddTopic, onRemoveTopic }) {
  const [mode, setMode] = useState('day');
  const [open, setOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const today = todayStr();
  const editing = cards.find((c) => c.id === editingId);

  const sections = useMemo(() => {
    const map = new Map();
    [...cards]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
      .forEach((c) => {
        const k = groupKey(mode, c.createdAt);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(c);
      });
    return [...map.entries()].map(([k, data]) => ({ key: k, title: groupTitle(mode, k), data }));
  }, [cards, mode]);

  const confirmDelete = (card) => {
    Alert.alert('Kartı sil', `“${card.en}” silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => onDelete(card.id) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.segment}>
        {MODES.map((m) => (
          <Pressable key={m.key} onPress={() => setMode(m.key)} style={[styles.segBtn, mode === m.key && styles.segActive]}>
            <Text style={[styles.segText, mode === m.key && styles.segTextActive]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>Henüz kelime eklemedin.</Text>}
        renderSectionHeader={({ section }) => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{section.title}</Text>
            <Text style={styles.headerCount}>{section.data.length} kelime</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const s = status(item, today);
          const isOpen = open === item.id;
          return (
            <Pressable onPress={() => setOpen(isOpen ? null : item.id)} onLongPress={() => confirmDelete(item)} style={styles.row}>
              <View style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.en}>{item.en}</Text>
                  <Text style={styles.tr}>{item.tr}</Text>
                  {item.topic ? <Text style={styles.tag}>{item.topic}</Text> : null}
                </View>
                <Text style={[styles.status, { color: s.color }]}>{s.text}</Text>
              </View>
              {isOpen && (
                <View style={styles.detail}>
                  {item.example ? <Text style={styles.example}>“{item.example}”</Text> : null}
                  {item.reference ? <Text style={styles.reference}>📍 {item.reference}</Text> : null}
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

      <Sheet visible={!!editing} title="Kartı düzenle" onClose={() => setEditingId(null)}>
        {editing ? (
          <CardForm
            key={editing.id}
            mode="edit"
            initial={editing}
            cards={cards}
            topics={topics}
            onAddTopic={onAddTopic}
            onRemoveTopic={onRemoveTopic}
            onSubmit={(values) => {
              onUpdate({ ...editing, ...values });
              setEditingId(null);
            }}
          />
        ) : null}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', margin: 16, backgroundColor: '#ECE9E2', borderRadius: 12, padding: 4 },
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
  detail: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  example: { fontStyle: 'italic', color: C.ink, marginBottom: 10, lineHeight: 20 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.line },
  dotLabel: { marginLeft: 6, color: C.muted, fontSize: 13 },
  tag: { alignSelf: 'flex-start', marginTop: 6, color: C.accent, backgroundColor: C.accentSoft, fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  reference: { color: C.muted, marginBottom: 10, fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, backgroundColor: C.accentSoft, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionText: { fontSize: 15, fontWeight: '700' },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 16 },
});
