import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { parse, todayStr } from '../dates';
import { t, weekdaysShort } from '../i18n';
import { computeStats } from '../stats';
import { useSettings } from '../settings';
import { useColors } from '../theme';
import { cn } from '../lib/utils';
import Sheet from './Sheet';
import { Text } from './ui/text';

// Günlük kelime hedefi: dolunca yeşile döner
export function GoalBar({ added, goal, className }) {
  if (!goal) return null;
  const done = added >= goal;
  return (
    <View className={cn('gap-1.5', className)}>
      <View className="flex-row items-baseline justify-between">
        <Text variant="label" className={done ? 'text-accent' : undefined}>
          {done ? t('goal.done') : t('goal.label')}
        </Text>
        <Text className={cn('font-sans-sb text-[13px]', done ? 'text-accent' : 'text-foreground')} style={{ fontVariant: ['tabular-nums'] }}>
          {Math.min(added, goal)}/{goal}
        </Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-muted">
        <View
          className={cn('h-full rounded-full', done ? 'bg-accent' : 'bg-foreground')}
          style={{ width: `${Math.round(Math.min(added / goal, 1) * 100)}%` }}
        />
      </View>
    </View>
  );
}

function Tile({ value, label }) {
  return (
    <View className="min-w-[45%] flex-1 rounded-2xl border border-border bg-card px-4 py-3">
      <Text className="font-serif text-[28px] leading-9" style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
      <Text variant="muted">{label}</Text>
    </View>
  );
}

export default function StatsSheet({ visible, onClose, cards }) {
  const colors = useColors();
  const { dailyGoal } = useSettings();
  const today = todayStr();
  const s = useMemo(() => computeStats(cards, today), [cards, today]);
  const maxAdded = Math.max(1, dailyGoal || 0, ...s.week.map((d) => d.added));
  const weekReviews = s.week.reduce((n, d) => n + d.reviewed, 0);
  const weekAdded = s.week.reduce((n, d) => n + d.added, 0);
  const W = weekdaysShort();

  return (
    <Sheet visible={visible} title={t('stats.title')} onClose={onClose}>
      <View className="gap-7">
        <View className="flex-row items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4">
          <View className={cn('h-14 w-14 items-center justify-center rounded-full', s.streak ? 'bg-highlight' : 'bg-muted')}>
            <Flame size={28} color={s.streak ? colors.highlightForeground : colors.mutedForeground} />
          </View>
          <View className="flex-1">
            <Text className="font-serif text-[30px] leading-9">{t('stats.streakDays', { n: s.streak })}</Text>
            <Text variant="muted" className="leading-5">
              {s.streak === 0 ? t('stats.streakZero') : s.activeToday ? t('stats.streakSafe') : t('stats.streakKeep')}
            </Text>
          </View>
        </View>

        {dailyGoal ? <GoalBar added={s.addedToday} goal={dailyGoal} /> : null}

        <View className="gap-2.5">
          <Text variant="overline">{t('stats.week')}</Text>
          <View className="rounded-2xl border border-border bg-card px-3 pb-3 pt-4">
            <View className="h-32 flex-row items-end gap-2">
              {s.week.map((d) => {
                const met = dailyGoal ? d.added >= dailyGoal : d.added > 0;
                const isToday = d.date === today;
                return (
                  <View key={d.date} className="flex-1 items-center justify-end gap-1">
                    <Text variant="small" className={met ? 'text-accent' : undefined}>{d.added || ''}</Text>
                    <View
                      className={cn('w-full rounded-md', met ? 'bg-accent' : d.added ? 'bg-foreground' : 'bg-muted')}
                      style={{ height: Math.max(4, (d.added / maxAdded) * 88) }}
                    />
                  </View>
                );
              })}
            </View>
            <View className="mt-2 flex-row gap-2">
              {s.week.map((d) => (
                <Text
                  key={d.date}
                  numberOfLines={1}
                  className={cn('flex-1 text-center text-[11px]', d.date === today ? 'font-sans-sb text-foreground' : 'text-muted-foreground')}
                >
                  {W[(parse(d.date).getDay() + 6) % 7]}
                </Text>
              ))}
            </View>
          </View>
          <Text variant="small" className="leading-[18px]">
            {t('stats.weekSummary', { added: weekAdded, reviewed: weekReviews })}
            {dailyGoal ? ` ${t('stats.goalHint')}` : ''}
          </Text>
        </View>

        <View className="gap-2.5">
          <Text variant="overline">{t('stats.overall')}</Text>
          <View className="flex-row flex-wrap gap-2.5">
            <Tile value={s.total} label={t('stats.total')} />
            <Tile value={s.mastered} label={t('stats.mastered')} />
            <Tile value={s.learning} label={t('stats.learning')} />
            <Tile value={s.accuracy === null ? '–' : t('stats.pct', { n: Math.round(s.accuracy * 100) })} label={t('stats.accuracy')} />
            <Tile value={s.best} label={t('stats.best')} />
            <Tile value={s.activeDays} label={t('stats.activeDays')} />
          </View>
        </View>
      </View>
    </Sheet>
  );
}
