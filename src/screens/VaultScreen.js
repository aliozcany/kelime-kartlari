import React, { useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Pressable, View } from 'react-native';
import { Pencil, X } from 'lucide-react-native';
import { isMastered, todayStr } from '../dates';
import { missCount, recordTest, restartPlan } from '../srs';
import { useColors } from '../theme';
import FlipCard from '../components/FlipCard';
import HintPanel from '../components/HintPanel';
import AnswerRow from '../components/AnswerRow';
import EditCardSheet from '../components/EditCardSheet';
import { ProgressBar } from './StudyScreen';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';
import { PagedFooter, pagedListProps, usePaged } from '../lib/usePaged';
import { useSettings } from '../settings';
import { t } from '../i18n';
import { shuffle } from '../lib/utils';


// Kelime Haznem: 5/5 tekrarı bitmiş kelimeler. Günlük çalışmaya gelmezler;
// kullanıcı istediğinde buradan kendini test eder. Test, tekrar planını değiştirmez.
export default function VaultScreen({ cards, onUpdate, topics, onAddTopic, onRemoveTopic }) {
  const colors = useColors();
  const today = todayStr();
  const { lang } = useSettings();
  const mastered = useMemo(
    () => cards.filter(isMastered).sort((a, b) => a.en.localeCompare(b.en, lang.key)),
    [cards, lang.key]
  );
  const paged = usePaged(mastered);

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
        t('vault.restartTitle'),
        t('vault.restartText', { n: missed.length }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('vault.restartOk'),
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
        contentContainerClassName="px-5 pb-8 pt-2"
        ListHeaderComponent={
          <View className="mb-4 items-center rounded-2xl border border-border bg-card px-5 py-7">
            <Text className="font-serif text-[52px] leading-[60px]">
              {known}<Text className="font-serif text-[30px] text-muted-foreground">/{results.length}</Text>
            </Text>
            <Text variant="muted" className="mt-1 text-[15px]">
              {missed.length === 0 ? t('vault.allKnown') : t('vault.missedN', { n: missed.length })}
            </Text>
            {missed.length > 0 ? <Text variant="overline" className="mt-6 self-start">{t('vault.missedList')}</Text> : null}
          </View>
        }
        renderItem={({ item }) => <WordRow card={item} />}
        ItemSeparatorComponent={() => <View className="h-px bg-border" />}
        ListFooterComponent={
          <View className="mt-4 gap-2.5">
            {missed.length > 0 ? (
              <Button variant="dangerSoft" onPress={restartMissed}>
                <Text>{t('vault.restartMissed')}</Text>
              </Button>
            ) : null}
            <Button onPress={exit}>
              <Text>{t('vault.back')}</Text>
            </Button>
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
      <View className="flex-1 px-5 pb-4 pt-2">
        <View className="mb-4 gap-2.5">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={exit} hitSlop={8} className="flex-row items-center gap-1">
              <X size={15} color={colors.mutedForeground} />
              <Text variant="label">{t('vault.endTest')}</Text>
            </Pressable>
            <View className="flex-row items-center gap-1">
              {flipped ? (
                <Button variant="ghost" size="sm" className="-my-2" onPress={() => setEditing(true)}>
                  <Pencil size={14} color={colors.mutedForeground} />
                  <Text className="font-sans-md text-[13px] text-muted-foreground">{t('common.edit')}</Text>
                </Button>
              ) : null}
              <Text variant="label">
                <Text className="font-sans-sb text-[13px] text-foreground">{done + 1}</Text> / {total}
              </Text>
            </View>
          </View>
          <ProgressBar value={total ? done / total : 0} />
        </View>

        <FlipCard card={card} anim={anim} flipped={flipped} onPress={flip} topRight={t('vault.test')} />

        <View className="mt-4 min-h-[56px] justify-center">
          {flipped ? <AnswerRow onAnswer={answer} /> : null}
          <View className={flipped ? 'hidden' : ''}>
            <HintPanel key={card.id} card={card} />
          </View>
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
      data={paged.visible}
      keyExtractor={(c) => c.id}
      {...pagedListProps(paged)}
      ListFooterComponent={<PagedFooter paged={paged} />}
      contentContainerClassName="px-5 pb-8 pt-2"
      ListHeaderComponent={
        <View className="mb-5 rounded-2xl border border-border bg-card p-5">
          <View className="flex-row items-end gap-3">
            <Text className="font-serif text-[52px] leading-[56px]">{mastered.length}</Text>
            <Text className="mb-2 font-sans-md text-[15px]">{t('vault.countLabel')}</Text>
          </View>
          <Text variant="muted" className="mt-2 leading-5">
            {t('vault.intro')}
          </Text>
          <Button className="mt-4" onPress={start} disabled={mastered.length === 0}>
            <Text>{t('vault.start')}</Text>
          </Button>
        </View>
      }
      ListEmptyComponent={<Text variant="muted" className="mt-6 text-center">{t('vault.empty')}</Text>}
      renderItem={({ item }) => <WordRow card={item} />}
      ItemSeparatorComponent={() => <View className="h-px bg-border" />}
    />
  );
}

function WordRow({ card }) {
  const misses = missCount(card);
  return (
    <View className="flex-row items-center py-3">
      <View className="flex-1">
        <Text variant="word">{card.en}</Text>
        <Text variant="muted" className="mt-0.5">{card.tr}</Text>
      </View>
      {misses > 0 ? <Badge variant="danger">{t('common.misses', { n: misses })}</Badge> : null}
    </View>
  );
}
