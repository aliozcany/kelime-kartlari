import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { todayStr, addDays, INTERVALS, formatShort } from '../dates';
import { newId } from '../storage';
import CardForm from '../components/CardForm';

export default function AddScreen({ cards, topics, onAdd, onAddTopic, onRemoveTopic, todayCount }) {
  const today = todayStr();

  const add = (values) =>
    onAdd({
      id: newId(),
      ...values,
      createdAt: today,
      stage: 0,
      reviews: [],
    });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <CardForm
          mode="add"
          cards={cards}
          topics={topics}
          onAddTopic={onAddTopic}
          onRemoveTopic={onRemoveTopic}
          onSubmit={add}
        />

        <View style={styles.info}>
          <Text style={styles.infoTitle}>Bugün eklenen: {todayCount}</Text>
          <Text style={styles.infoText}>
            Bugün eklediğin kelimeler şu günlerde sorulacak:{'\n'}
            {INTERVALS.map((d) => formatShort(addDays(today, d))).join('  ·  ')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  info: { marginTop: 28, backgroundColor: C.accentSoft, borderRadius: 14, padding: 16 },
  infoTitle: { fontWeight: '700', color: C.accent, marginBottom: 6, fontSize: 15 },
  infoText: { color: C.ink, lineHeight: 21, fontSize: 14 },
});
