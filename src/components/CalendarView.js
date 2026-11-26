import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatMonth, monthKey, toStr } from '../dates';
import { useColors } from '../theme';
import { cn } from '../lib/utils';
import { Text } from './ui/text';
import { t, weekdaysShort } from '../i18n';

function shiftMonth(key, n) {
  const [y, m] = key.split('-').map(Number);
  return toStr(new Date(y, m - 1 + n, 1)).slice(0, 7);
}

// Ay ızgarası (pazartesiden başlar). Her günün altında o gün eklenen kelime sayısı yazar.
// counts: { 'YYYY-MM-DD': n }
export default function CalendarView({ counts, selected, onSelect, today }) {
  const colors = useColors();
  const [month, setMonth] = useState(monthKey(selected || today));

  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${month}-${String(d).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthTotal = Object.entries(counts)
    .filter(([d]) => d.startsWith(month))
    .reduce((s, [, n]) => s + n, 0);

  return (
    <View className="mt-3 rounded-2xl border border-border bg-card p-3">
      <View className="flex-row items-center justify-between pb-2">
        <Pressable onPress={() => setMonth(shiftMonth(month, -1))} hitSlop={10} className="h-9 w-9 items-center justify-center rounded-full active:bg-muted">
          <ChevronLeft size={20} color={colors.foreground} />
        </Pressable>
        <View className="items-center">
          <Text className="font-serif text-[19px]">{formatMonth(month)}</Text>
          <Text variant="small">{t('common.words', { n: monthTotal })}</Text>
        </View>
        <Pressable onPress={() => setMonth(shiftMonth(month, 1))} hitSlop={10} className="h-9 w-9 items-center justify-center rounded-full active:bg-muted">
          <ChevronRight size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Yüzde genişlik (100/7 %) Android'de yuvarlanıp satırı 6 güne düşürüyordu; satırlar ayrı ayrı çizilir */}
      <View className="flex-row">
        {weekdaysShort().map((d) => (
          <View key={d} className="flex-1 py-1">
            <Text variant="small" className="text-center font-sans-md">{d}</Text>
          </View>
        ))}
      </View>
      {weeks.map((week, w) => (
        <View key={w} className="flex-row">
          {week.map((date, i) => {
            if (!date) return <View key={`e${i}`} className="flex-1" />;
            const n = counts[date] || 0;
            const isSel = date === selected;
            const isToday = date === today;
            return (
              <Pressable key={date} onPress={() => onSelect(isSel ? null : date)} className="flex-1 p-0.5">
                <View
                  className={cn(
                    'items-center rounded-lg border py-1.5',
                    isSel ? 'border-primary bg-primary' : isToday ? 'border-foreground' : 'border-transparent',
                    !isSel && n > 0 && 'bg-accent-soft'
                  )}
                >
                  <Text className={cn('font-sans-md text-[15px]', isSel && 'text-primary-foreground')}>{Number(date.slice(8))}</Text>
                  <Text className={cn('font-sans-sb text-[10px]', isSel ? 'text-primary-foreground' : 'text-accent')}>
                    {n > 0 ? `+${n}` : ' '}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
