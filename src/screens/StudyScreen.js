import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { isDue, todayStr, STAGE_LABELS } from '../dates';
import { markKnown, markUnknown } from '../srs';
import { useColors } from '../theme';
import FlipCard from '../components/FlipCard';
import HintPanel from '../components/HintPanel';
import AnswerRow from '../components/AnswerRow';
import EditCardSheet from '../components/EditCardSheet';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';

export function ProgressBar({ value }) {
  return (
    <View className="h-1 overflow-hidden rounded-full bg-muted">
      <View className="h-full rounded-full bg-foreground" style={{ width: `${Math.round(value * 100)}%` }} />
    </View>
  );
}

export default function StudyScreen({ cards, onUpdate, topics, onAddTopic, onRemoveTopic }) {
  const colors = useColors();
  const today = todayStr();
  const dueIds = useMemo(() => cards.filter((c) => isDue(c, today)).map((c) => c.id), [cards, today]);

  // Oturum kuyruğu: cevaplanan kart (bilinse de bilinmese de) bugünlük çıkar
  const [queue, setQueue] = useState(dueIds);
  // Bugün tekrar edilen kart sayısı kayıtlardan hesaplanır; sekme değişince ya da uygulama kapanınca sıfırlanmaz
  const doneCount = useMemo(
    () => cards.filter((c) => (c.reviews || []).some((r) => r.date === today)).length,
    [cards, today]
  );
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  // Yeni kart eklendiğinde ya da gün değiştiğinde kuyruğu tazele (oturum ortasında değilse)
  useEffect(() => {
    setQueue((q) => (q.length === 0 ? dueIds : q.filter((id) => cards.some((c) => c.id === id))));
  }, [dueIds.join(',')]);

  const card = cards.find((c) => c.id === queue[0]);

  const reset = () => {
    setFlipped(false);
    anim.setValue(0);
  };

  const flip = () => {
    Animated.spring(anim, { toValue: flipped ? 0 : 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
    setFlipped(!flipped);
  };

  const answer = (ok) => {
    if (!card) return;
    onUpdate(ok ? markKnown(card, today) : markUnknown(card, today));
    setQueue((q) => q.slice(1));
    reset();
  };

  if (!card) {
    return (
      <View className="flex-1 items-center justify-center px-10">
        <Text className="mb-2 text-center font-serif text-[30px] leading-9">
          {doneCount > 0 ? 'Bugünlük bitti.' : 'Bugün tekrar yok.'}
        </Text>
        <Text variant="muted" className="text-center text-[15px] leading-[22px]">
          {doneCount > 0
            ? `${doneCount} kelimeyi tekrar ettin. Yarın görüşürüz.`
            : 'Yeni kelime ekle; eklediğin kelimeler ertesi gün buraya gelir.'}
        </Text>
      </View>
    );
  }

  const total = doneCount + queue.length;

  return (
    <View className="flex-1 px-5 pb-4 pt-2">
      <View className="mb-4 gap-2.5">
        <View className="flex-row items-center justify-between">
          <Text variant="label">
            <Text className="font-sans-sb text-[13px] text-foreground">{queue.length}</Text> kaldı
          </Text>
          {flipped ? (
            <Button variant="ghost" size="sm" className="-my-2 -mr-2" onPress={() => setEditing(true)}>
              <Pencil size={14} color={colors.mutedForeground} />
              <Text className="font-sans-md text-[13px] text-muted-foreground">Düzenle</Text>
            </Button>
          ) : null}
        </View>
        <ProgressBar value={total ? doneCount / total : 0} />
      </View>

      <FlipCard card={card} anim={anim} onPress={flip} topRight={`${STAGE_LABELS[card.stage]} tekrarı`} />

      <View className="mt-4 min-h-[56px] justify-center">
        {flipped ? <AnswerRow onAnswer={answer} /> : null}
        {/* Kart çevrilince ipuçları gizlenir ama açılan ipuçları kaybolmaz */}
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
