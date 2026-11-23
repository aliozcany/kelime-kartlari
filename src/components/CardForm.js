import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronDown, TriangleAlert } from 'lucide-react-native';
import { useColors } from '../theme';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Chip } from './ui/chip';
import { Input } from './ui/input';
import { Text } from './ui/text';

// Kelime türleri (isteğe bağlı, birden fazla seçilebilir)
export const WORD_TYPES = [
  { key: 'noun', label: 'noun' },
  { key: 'verb', label: 'verb' },
  { key: 'adj', label: 'adj' },
  { key: 'adv', label: 'adv' },
  { key: 'phrase', label: 'phrase' },
];

// "Ayrıntılar" bölümü bir kez açılınca sonraki açılışlarda da açık kalır
const DETAILS_KEY = 'kelime-kartlari:form-details-open';

// Aynı İngilizce kelime (büyük/küçük harf ve boşluk farkı gözetmeden) başka bir kartta var mı
export function findDuplicate(cards, en, exceptId) {
  const k = en.trim().toLowerCase();
  if (!k) return null;
  return cards.find((c) => c.id !== exceptId && c.en.trim().toLowerCase() === k) || null;
}

function Field({ label, hint, className, children }) {
  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="label">
        {label}
        {hint ? <Text variant="small">  {hint}</Text> : null}
      </Text>
      {children}
    </View>
  );
}

// Ekleme ve düzenleme için ortak form.
// mode: 'add' → kaydedince alanlar temizlenir (konu ve referans bir sonraki kelime için kalır)
//       'edit' → initial kartın alanlarıyla açılır
export default function CardForm({ mode = 'add', initial, cards, topics, onAddTopic, onRemoveTopic, onSubmit }) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const wide = width >= 640; // tablet: alanlar iki sütun
  const isEdit = mode === 'edit';
  const [en, setEn] = useState(initial?.en || '');
  const [tr, setTr] = useState(initial?.tr || '');
  const [example, setExample] = useState(initial?.example || '');
  const [reference, setReference] = useState(initial?.reference || '');
  const [topic, setTopic] = useState(initial?.topic || null);
  const [types, setTypes] = useState(initial?.types || []);
  const [synonyms, setSynonyms] = useState(initial?.synonyms || '');
  const [antonyms, setAntonyms] = useState(initial?.antonyms || '');
  const [addingTopic, setAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [msg, setMsg] = useState('');
  const hasDetails = !!(initial?.example || initial?.synonyms || initial?.antonyms || initial?.reference);
  const [detailsOpen, setDetailsOpen] = useState(isEdit && hasDetails);
  const enRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isEdit && hasDetails) return;
    AsyncStorage.getItem(DETAILS_KEY)
      .then((v) => v === '1' && setDetailsOpen(true))
      .catch(() => {});
  }, []);

  const toggleDetails = () => {
    const next = !detailsOpen;
    setDetailsOpen(next);
    AsyncStorage.setItem(DETAILS_KEY, next ? '1' : '0').catch(() => {});
  };

  const dup = findDuplicate(cards, en, initial?.id);
  const canSave = en.trim() && tr.trim();
  const label = dup ? (isEdit ? 'Yine de kaydet' : 'Yine de ekle') : isEdit ? 'Kaydet' : 'Kartı ekle';
  const filledDetails = [example, synonyms, antonyms, reference].filter((s) => s.trim()).length;

  const submit = () => {
    if (!canSave) return;
    onSubmit({
      en: en.trim(),
      tr: tr.trim(),
      example: example.trim(),
      reference: reference.trim(),
      topic,
      types,
      synonyms: synonyms.trim(),
      antonyms: antonyms.trim(),
    });
    if (!isEdit) {
      setMsg(`“${en.trim()}” eklendi`);
      setEn('');
      setTr('');
      setExample('');
      setTypes([]);
      setSynonyms('');
      setAntonyms('');
      enRef.current?.focus();
    }
  };

  const toggleType = (k) => setTypes((ts) => (ts.includes(k) ? ts.filter((t) => t !== k) : [...ts, k]));

  const commitTopic = () => {
    const name = newTopic.trim();
    if (name) {
      const existing = topics.find((t) => t.toLowerCase() === name.toLowerCase());
      if (!existing) onAddTopic(name);
      setTopic(existing || name);
    }
    setNewTopic('');
    setAddingTopic(false);
  };

  const confirmRemoveTopic = (t) => {
    const used = cards.filter((c) => c.topic === t).length;
    Alert.alert(
      'Konuyu sil',
      `“${t}” konusu silinsin mi?` + (used ? `\n${used} kartın konusu kaldırılacak, kartlar silinmez.` : ''),
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            onRemoveTopic(t);
            if (topic === t) setTopic(null);
          },
        },
      ]
    );
  };

  const row = wide ? 'flex-row gap-3' : 'gap-3';

  return (
    <View className="gap-4">
      <View className={row}>
        <Field label="İngilizce" className={wide ? 'flex-1' : ''}>
          <Input
            ref={enRef}
            value={en}
            onChangeText={(t) => {
              setEn(t);
              setMsg('');
            }}
            placeholder="reluctant"
            autoCapitalize="none"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => trRef.current?.focus()}
            className="font-serif text-[19px]"
          />
        </Field>
        <Field label="Türkçe" className={wide ? 'flex-1' : ''}>
          <Input
            ref={trRef}
            value={tr}
            onChangeText={setTr}
            placeholder="isteksiz, gönülsüz"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </Field>
      </View>

      {dup ? (
        <View className="-mt-1 flex-row items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5">
          <TriangleAlert size={16} color={colors.danger} />
          <Text className="flex-1 text-sm text-danger">
            Bu kelime zaten var: <Text className="font-sans-sb text-sm text-danger">{dup.en}</Text> — {dup.tr}
          </Text>
        </View>
      ) : null}

      <Field label="Tür">
        <View className="flex-row flex-wrap gap-2">
          {WORD_TYPES.map((t) => (
            <Chip key={t.key} label={t.label} active={types.includes(t.key)} onPress={() => toggleType(t.key)} />
          ))}
        </View>
      </Field>

      <Field label="Konu" hint={topics.length ? 'uzun bas: sil' : null}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" className="-mx-5" contentContainerClassName="gap-2 px-5">
          {topics.map((t) => (
            <Chip
              key={t}
              label={t}
              active={topic === t}
              onPress={() => setTopic(topic === t ? null : t)}
              onLongPress={() => confirmRemoveTopic(t)}
            />
          ))}
          {addingTopic ? (
            <Input
              value={newTopic}
              onChangeText={setNewTopic}
              placeholder="Yeni konu"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={commitTopic}
              onBlur={commitTopic}
              className="h-9 min-w-[130px] rounded-full border-foreground py-0 text-sm"
            />
          ) : (
            <Chip dashed label="+ Konu" onPress={() => setAddingTopic(true)} />
          )}
        </ScrollView>
      </Field>

      <View className="rounded-2xl border border-border bg-card/60">
        <Pressable onPress={toggleDetails} className="flex-row items-center justify-between px-4 py-3 active:opacity-70">
          <View className="flex-row items-baseline gap-2">
            <Text className="font-sans-sb text-[15px]">Ayrıntılar</Text>
            <Text variant="small">
              {filledDetails ? `${filledDetails} alan dolu` : 'cümle, eş / zıt anlam, kaynak'}
            </Text>
          </View>
          <View style={{ transform: [{ rotate: detailsOpen ? '180deg' : '0deg' }] }}>
            <ChevronDown size={18} color={colors.mutedForeground} />
          </View>
        </Pressable>

        {detailsOpen ? (
          <View className="gap-3 border-t border-border px-4 pb-4 pt-3">
            <Field label="Örnek cümle" hint="ilk ipucu">
              <Input
                value={example}
                onChangeText={setExample}
                placeholder="She was reluctant to leave the party."
                multiline
                className="font-serif-i text-[17px]"
              />
            </Field>
            <View className="flex-row gap-3">
              <Field label="Eş anlamlı" className="flex-1">
                <Input value={synonyms} onChangeText={setSynonyms} placeholder="unwilling" autoCapitalize="none" />
              </Field>
              <Field label="Zıt anlamlı" className="flex-1">
                <Input value={antonyms} onChangeText={setAntonyms} placeholder="eager" autoCapitalize="none" />
              </Field>
            </View>
            <Field label="Nerede gördün">
              <Input value={reference} onChangeText={setReference} placeholder="Friends 3. sezon, BBC haberi" returnKeyType="done" />
            </Field>
          </View>
        ) : null}
      </View>

      <Button size="lg" variant={dup ? 'danger' : 'default'} onPress={submit} disabled={!canSave}>
        <Text>{label}</Text>
      </Button>

      {msg ? <Text className="-mt-1 text-center font-sans-md text-sm text-accent">{msg}</Text> : null}
    </View>
  );
}
