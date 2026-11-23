import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Eye, EyeOff, Pencil } from 'lucide-react-native';
import { formatShort, INTERVALS } from '../dates';
import { hardestCards } from '../srs';
import { useColors } from '../theme';
import { cn } from '../lib/utils';
import EditCardSheet from '../components/EditCardSheet';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';

// En çok zorlanılan kelimeler: hata oranına göre sıralı bir çalışma listesi.
// Burada cevap verilmez, tekrar planına dokunulmaz; sadece bakıp çalışmak için.
export default function HardScreen({ cards, onUpdate, topics, onAddTopic, onRemoveTopic }) {
  const colors = useColors();
  const ranked = useMemo(() => hardestCards(cards), [cards]);
  const [hideTr, setHideTr] = useState(false);
  const [revealed, setRevealed] = useState({}); // anlamlar gizliyken tek tek açılanlar
  const [open, setOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const editing = cards.find((c) => c.id === editingId);

  const toggleHide = () => {
    setHideTr(!hideTr);
    setRevealed({});
  };

  const onRow = (id) => {
    if (hideTr && !revealed[id]) {
      setRevealed((r) => ({ ...r, [id]: true }));
      return;
    }
    setOpen(open === id ? null : id);
  };

  return (
    <View className="flex-1">
      <FlatList
        data={ranked}
        keyExtractor={(r) => r.card.id}
        contentContainerClassName="px-5 pb-8 pt-2"
        ListHeaderComponent={
          ranked.length ? (
            <View className="mb-3">
              <Text variant="muted" className="leading-5">
                Hata oranına göre sıralı: bilinemediği sayı ÷ toplam sorulduğu sayı. Burada cevap vermezsin, tekrar planı
                değişmez.
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text variant="label">{ranked.length} kelime</Text>
                <Button variant="outline" size="sm" onPress={toggleHide}>
                  {hideTr ? (
                    <Eye size={15} color={colors.foreground} />
                  ) : (
                    <EyeOff size={15} color={colors.foreground} />
                  )}
                  <Text>{hideTr ? 'Anlamları göster' : 'Anlamları gizle'}</Text>
                </Button>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="mt-16 items-center px-6">
            <Text className="mb-2 text-center font-serif text-[26px] leading-8">Henüz zorlandığın kelime yok.</Text>
            <Text variant="muted" className="text-center leading-5">
              Çalışırken ya da Haznem testinde “Bilemedim” dediğin kelimeler burada, en çok zorlandığından başlayarak
              sıralanır.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-px bg-border" />}
        renderItem={({ item, index }) => (
          <HardRow
            {...item}
            rank={index + 1}
            hidden={hideTr && !revealed[item.card.id]}
            open={open === item.card.id}
            onPress={() => onRow(item.card.id)}
            onEdit={() => setEditingId(item.card.id)}
            colors={colors}
          />
        )}
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

function HardRow({ card, rate, misses, attempts, last, rank, hidden, open, onPress, onEdit, colors }) {
  const pct = Math.round(rate * 100);
  return (
    <Pressable onPress={onPress} className="py-3.5 active:opacity-70">
      <View className="flex-row items-start gap-3">
        <Text className="w-7 pt-1 font-serif text-[17px] text-muted-foreground" style={{ fontVariant: ['tabular-nums'] }}>
          {String(rank).padStart(2, '0')}
        </Text>
        <View className="flex-1">
          <Text variant="word">{card.en}</Text>
          {hidden ? (
            <Text variant="muted" className="mt-0.5 tracking-widest">• • •  <Text variant="small">göster</Text></Text>
          ) : (
            <Text variant="muted" className="mt-0.5 text-[15px]">{card.tr}</Text>
          )}
        </View>
        <View className="w-16 items-end pt-0.5">
          <Text className={cn('font-sans-sb text-lg', pct >= 50 ? 'text-danger' : 'text-foreground')}>%{pct}</Text>
          <Text variant="small">{misses}/{attempts}</Text>
        </View>
      </View>

      <View className="ml-10 mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <View className="h-full rounded-full bg-danger/80" style={{ width: `${Math.max(pct, 3)}%` }} />
      </View>

      {open && !hidden ? (
        <View className="ml-10 mt-3 gap-1.5">
          {card.example ? <Text className="font-serif-i text-[16px] leading-[22px]">“{card.example}”</Text> : null}
          {card.synonyms ? <Detail label="Eş" text={card.synonyms} /> : null}
          {card.antonyms ? <Detail label="Zıt" text={card.antonyms} /> : null}
          <Text variant="small" className="mt-1">
            Son bilinemediği gün {formatShort(last)}  ·  {Math.min(card.stage, INTERVALS.length)}/{INTERVALS.length} tekrar
          </Text>
          <Button variant="outline" size="sm" className="mt-2 self-start" onPress={onEdit}>
            <Pencil size={14} color={colors.foreground} />
            <Text>Düzenle</Text>
          </Button>
        </View>
      ) : null}
    </Pressable>
  );
}

function Detail({ label, text }) {
  return (
    <View className="flex-row items-baseline gap-2">
      <Text variant="overline" className="w-7 text-[10px]">{label}</Text>
      <Text className="flex-1 font-sans-md text-[15px]">{text}</Text>
    </View>
  );
}
