import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { C } from './src/theme';
import { loadCards, loadTopics, saveCards, saveTopics } from './src/storage';
import { isDue, todayStr } from './src/dates';
import StudyScreen from './src/screens/StudyScreen';
import AddScreen from './src/screens/AddScreen';
import ListScreen from './src/screens/ListScreen';
import VaultScreen from './src/screens/VaultScreen';
import BackupSheet from './src/components/BackupSheet';

const TABS = [
  { key: 'study', label: 'Çalış', icon: '📖' },
  { key: 'add', label: 'Ekle', icon: '➕' },
  { key: 'list', label: 'Kelimelerim', icon: '🗂️' },
  { key: 'vault', label: 'Haznem', icon: '🏆' },
];

export default function App() {
  const [cards, setCards] = useState(null);
  const [topics, setTopics] = useState([]);
  const [tab, setTab] = useState('study');
  const [backupOpen, setBackupOpen] = useState(false);
  const [, setTick] = useState(0); // gün değişince ekranı tazelemek için

  useEffect(() => {
    Promise.all([loadCards(), loadTopics()]).then(([cs, ts]) => {
      setTopics(ts);
      setCards(cs);
    });
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setTick((t) => t + 1));
    return () => sub.remove();
  }, []);

  const update = useCallback((fn) => {
    setCards((prev) => {
      const next = fn(prev);
      saveCards(next);
      return next;
    });
  }, []);

  const updateTopics = useCallback((fn) => {
    setTopics((prev) => {
      const next = fn(prev);
      saveTopics(next);
      return next;
    });
  }, []);

  const addCard = (card) => update((cs) => [...cs, card]);
  const updateCard = (card) => update((cs) => cs.map((c) => (c.id === card.id ? card : c)));
  const deleteCard = (id) => update((cs) => cs.filter((c) => c.id !== id));

  const addTopic = (name) =>
    updateTopics((ts) =>
      ts.some((t) => t.toLowerCase() === name.toLowerCase())
        ? ts
        : [...ts, name].sort((a, b) => a.localeCompare(b, 'tr'))
    );
  // Konu silinince kartlar silinmez, sadece konuları boşaltılır
  const removeTopic = (name) => {
    updateTopics((ts) => ts.filter((t) => t !== name));
    update((cs) => cs.map((c) => (c.topic === name ? { ...c, topic: null } : c)));
  };

  const restore = (data) => {
    update(() => data.cards);
    updateTopics(() => data.topics);
  };

  const topicProps = { topics, onAddTopic: addTopic, onRemoveTopic: removeTopic };

  if (!cards) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  const today = todayStr();
  const dueCount = cards.filter((c) => isDue(c, today)).length;
  const todayCount = cards.filter((c) => c.createdAt === today).length;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{TABS.find((t) => t.key === tab).label}</Text>
            <Text style={styles.sub}>{cards.length} kelime · bugün {dueCount} tekrar</Text>
          </View>
          <Pressable onPress={() => setBackupOpen(true)} hitSlop={8} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>💾 Yedek</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }}>
          {tab === 'study' && <StudyScreen cards={cards} onUpdate={updateCard} {...topicProps} />}
          {tab === 'add' && <AddScreen cards={cards} onAdd={addCard} todayCount={todayCount} {...topicProps} />}
          {tab === 'list' && <ListScreen cards={cards} onUpdate={updateCard} onDelete={deleteCard} {...topicProps} />}
          {tab === 'vault' && <VaultScreen cards={cards} onUpdate={updateCard} {...topicProps} />}
        </View>

        <BackupSheet
          visible={backupOpen}
          onClose={() => setBackupOpen(false)}
          cards={cards}
          topics={topics}
          onRestore={restore}
        />

        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tabBtn}>
                <View>
                  <Text style={[styles.tabIcon, !active && { opacity: 0.45 }]}>{t.icon}</Text>
                  {t.key === 'study' && dueCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{dueCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.tabLabel, active && { color: C.accent }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  headerBtn: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  headerBtnText: { fontSize: 13, fontWeight: '600', color: C.ink },
  title: { fontSize: 28, fontWeight: '800', color: C.ink },
  sub: { fontSize: 14, color: C.muted, marginTop: 2 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.surface, paddingTop: 8, paddingBottom: 4 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 12, color: C.muted, marginTop: 2, fontWeight: '600' },
  badge: { position: 'absolute', top: -4, right: -14, backgroundColor: C.warn, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
