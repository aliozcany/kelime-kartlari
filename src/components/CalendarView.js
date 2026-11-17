import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { formatMonth, monthKey, toStr } from '../dates';

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function shiftMonth(key, n) {
  const [y, m] = key.split('-').map(Number);
  return toStr(new Date(y, m - 1 + n, 1)).slice(0, 7);
}

// Ay ızgarası (pazartesiden başlar). Her günün altında o gün eklenen kelime sayısı yazar.
// counts: { 'YYYY-MM-DD': n }
export default function CalendarView({ counts, selected, onSelect, today }) {
  const [month, setMonth] = useState(monthKey(selected || today));

  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${month}-${String(d).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);

  const monthTotal = Object.entries(counts)
    .filter(([d]) => d.startsWith(month))
    .reduce((s, [, n]) => s + n, 0);

  return (
    <View style={styles.box}>
      <View style={styles.nav}>
        <Pressable onPress={() => setMonth(shiftMonth(month, -1))} hitSlop={10} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.month}>{formatMonth(month)}</Text>
          <Text style={styles.monthSub}>{monthTotal} kelime</Text>
        </View>
        <Pressable onPress={() => setMonth(shiftMonth(month, 1))} hitSlop={10} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {DAY_NAMES.map((d) => (
          <View key={d} style={styles.cell}>
            <Text style={styles.dayName}>{d}</Text>
          </View>
        ))}
        {cells.map((date, i) => {
          if (!date) return <View key={`e${i}`} style={styles.cell} />;
          const n = counts[date] || 0;
          const isSel = date === selected;
          const isToday = date === today;
          return (
            <Pressable key={date} onPress={() => onSelect(isSel ? null : date)} style={styles.cell}>
              <View style={[styles.day, n > 0 && styles.dayHas, isToday && styles.dayToday, isSel && styles.daySel]}>
                <Text style={[styles.dayNum, isSel && { color: '#fff' }]}>{Number(date.slice(8))}</Text>
                <Text style={[styles.dayCount, isSel && { color: '#fff' }]}>{n > 0 ? `+${n}` : ' '}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 10, marginBottom: 8 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingBottom: 8 },
  navBtn: { paddingHorizontal: 12, paddingVertical: 2 },
  navText: { fontSize: 28, color: C.accent, fontWeight: '600' },
  month: { fontSize: 17, fontWeight: '700', color: C.ink },
  monthSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, padding: 2 },
  dayName: { textAlign: 'center', fontSize: 12, color: C.muted, fontWeight: '600', paddingVertical: 4 },
  day: { borderRadius: 10, paddingVertical: 6, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  dayHas: { backgroundColor: C.accentSoft },
  dayToday: { borderColor: C.accent },
  daySel: { backgroundColor: C.accent, borderColor: C.accent },
  dayNum: { fontSize: 15, fontWeight: '600', color: C.ink },
  dayCount: { fontSize: 11, fontWeight: '700', color: C.accent, marginTop: 1 },
});
