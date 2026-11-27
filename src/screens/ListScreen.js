import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, TextInput, View } from 'react-native';
import { Search, Volume2, X } from 'lucide-react-native';
import { speak } from '../speech';
import { formatDay, formatMonth, formatShort, formatWeek, monthKey, nextDue, todayStr, weekStart, INTERVALS } from '../dates';
import { missCount } from '../srs';
import { useColors } from '../theme';
import { cn } from '../lib/utils';
import { WORD_TYPES } from '../components/CardForm';
import EditCardSheet from '../components/EditCardSheet';
import CalendarView from '../components/CalendarView';
import { Badge } from '../components/ui/badge';
import { PagedFooter, pagedListProps, usePaged } from '../lib/usePaged';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';
import { collator, t } from '../i18n';
import { useSettings } from '../settings';

const MODES = ['day', 'week', 'month', 'cal'];

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
  if (n === null) return { text: t('list.inVault'), className: 'text-accent' };
  if (n < today) return { text: t('list.late'), className: 'text-danger' };
  if (n === today) return { text: t('list.today'), className: 'text-foreground' };
  return { text: formatShort(n), className: 'text-muted-foreground' };
}

export default function ListScreen({ cards, topics, onUpdate, onDelete, onAddTopic, onRemoveTopic }) {
  const colors = useColors();
  const { uiLang, lang } = useSettings();
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

  // Görünüme göre süzülmüş, yeniden eskiye sıralı düz liste
  const flat = useMemo(() => {
    const sorted = [...cards].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    if (q) return sorted.filter((c) => matches(c, q));
    if (mode === 'cal') return calDay ? sorted.filter((c) => c.createdAt === calDay) : [];
    return sorted;
  }, [cards, mode, q, calDay]);

  const paged = usePaged(flat, `${mode}|${q}|${calDay}`);

  // Başlıktaki sayı, grubun henüz yüklenmemiş kısmını da sayar
  const groupTotals = useMemo(() => {
    const m = {};
    if (!q && mode !== 'cal') flat.forEach((c) => {
      const k = groupKey(mode, c.createdAt);
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }, [flat, mode, q]);

  const sections = useMemo(() => {
    const data = paged.visible;
    if (!data.length) return [];
    if (q) return [{ key: 'search', title: t('list.searchResults'), data, total: flat.length }];
    if (mode === 'cal') return [{ key: calDay, title: formatDay(calDay), data, total: flat.length }];
    const map = new Map();
    data.forEach((c) => {
      const k = groupKey(mode, c.createdAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(c);
    });
    return [...map.entries()].map(([k, d]) => ({ key: k, title: groupTitle(mode, k), data: d, total: groupTotals[k] }));
  }, [paged.visible, flat.length, groupTotals, mode, q, calDay, uiLang]);

  const confirmDelete = (card) => {
    Alert.alert(t('list.deleteTitle'), t('list.deleteQ', { word: card.en }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(card.id) },
    ]);
  };

  let emptyText = t('list.empty');
  if (q) emptyText = t('list.notFound', { q: query.trim() });
  else if (mode === 'cal') emptyText = calDay ? t('list.calEmptyDay') : t('list.calPick');

  return (
    <View className="flex-1">
      <View className="mx-5 mt-1 h-11 flex-row items-center gap-2 rounded-xl border border-input bg-card px-3">
        <Search size={17} color={colors.mutedForeground} />
        <TextInput
          className="flex-1 font-sans text-base text-foreground"
          value={query}
          onChangeText={setQuery}
          placeholder={t('list.search')}
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <X size={17} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      {!q ? (
        <View className="mx-5 mt-3 flex-row rounded-xl bg-muted p-1">
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                className={cn('h-9 flex-1 items-center justify-center rounded-lg', active && 'bg-card')}
              >
                <Text className={cn('text-sm', active ? 'font-sans-sb text-foreground' : 'font-sans-md text-muted-foreground')}>
                  {t(`list.mode.${m}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        {...pagedListProps(paged)}
        ListFooterComponent={<PagedFooter paged={paged} />}
        ListHeaderComponent={
          !q && mode === 'cal' ? <CalendarView counts={counts} selected={calDay} onSelect={setCalDay} today={today} /> : null
        }
        ListEmptyComponent={<Text variant="muted" className="mt-10 text-center text-[15px]">{emptyText}</Text>}
        renderSectionHeader={({ section }) => (
          <View className="mb-1 mt-5 flex-row items-baseline justify-between">
            <Text variant="overline" className="text-foreground">{section.title}</Text>
            <Text variant="small">{t('common.words', { n: section.total ?? section.data.length })}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View className="h-px bg-border" />}
        renderItem={({ item }) => {
          const s = status(item, today);
          const isOpen = open === item.id;
          const misses = missCount(item);
          return (
            <Pressable
              onPress={() => setOpen(isOpen ? null : item.id)}
              onLongPress={() => confirmDelete(item)}
              className="py-3 active:opacity-70"
            >
              <View className="flex-row items-start">
                <View className="flex-1">
                  <Text variant="word">{item.en}</Text>
                  <Text variant="muted" className="mt-0.5 text-[15px]">{item.tr}</Text>
                  {item.topic || item.types?.length ? (
                    <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
                      {item.types?.length ? (
                        <Text className="font-serif-i text-[15px] text-muted-foreground">
                          {item.types.map(typeLabel).join(' · ')}
                        </Text>
                      ) : null}
                      {item.topic ? <Badge variant="accent">{item.topic}</Badge> : null}
                    </View>
                  ) : null}
                </View>
                <View className="shrink-0 items-end gap-1 pl-3 pt-1">
                  <Text numberOfLines={1} className={cn('font-sans-sb text-xs', s.className)}>{s.text}</Text>
                  {misses > 0 ? <Badge variant="danger">{t('common.misses', { n: misses })}</Badge> : null}
                </View>
              </View>

              {isOpen ? (
                <View className="mt-3 gap-1.5">
                  {item.example ? <Text className="font-serif-i text-[16px] leading-[22px]">“{item.example}”</Text> : null}
                  {item.synonyms ? <Rel label={t('common.syn')} text={item.synonyms} /> : null}
                  {item.antonyms ? <Rel label={t('common.ant')} text={item.antonyms} /> : null}
                  {item.reference ? <Text variant="muted">{item.reference}</Text> : null}
                  <View className="mt-1.5 flex-row items-center gap-1.5">
                    {INTERVALS.map((_, i) => (
                      <View key={i} className={cn('h-1.5 w-6 rounded-full', i < item.stage ? 'bg-accent' : 'bg-muted')} />
                    ))}
                    <Text variant="small" className="ml-1.5">
                      {t('common.reviews', { done: Math.min(item.stage, INTERVALS.length), total: INTERVALS.length })}
                    </Text>
                  </View>
                  <View className="mt-2 flex-row gap-2">
                    <Button variant="outline" size="sm" onPress={() => speak(item.en, lang)} accessibilityLabel={t('common.listen')}>
                      <Volume2 size={15} color={colors.foreground} />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onPress={() => setEditingId(item.id)}>
                      <Text>{t('common.edit')}</Text>
                    </Button>
                    <Button variant="dangerSoft" size="sm" className="flex-1" onPress={() => confirmDelete(item)}>
                      <Text>{t('common.delete')}</Text>
                    </Button>
                  </View>
                </View>
              ) : null}
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

function Rel({ label, text }) {
  return (
    <View className="flex-row items-baseline gap-2">
      <Text variant="overline" numberOfLines={1} className="min-w-[36px] text-[10px]">{label}</Text>
      <Text className="flex-1 font-sans-md text-[15px]">{text}</Text>
    </View>
  );
}
