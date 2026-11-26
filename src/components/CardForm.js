import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronDown, TriangleAlert } from 'lucide-react-native';
import { useColors } from '../theme';
import { useSettings } from '../settings';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Chip } from './ui/chip';
import { Input } from './ui/input';
import { Text } from './ui/text';
import { t } from '../i18n';


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

// Aynı kelime (büyük/küçük harf ve boşluk farkı gözetmeden) başka bir kartta var mı
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
  const { lang } = useSettings();
  const sample = lang.sample;
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
  const label = dup ? (isEdit ? t('form.saveAnyway') : t('form.addAnyway')) : isEdit ? t('form.save') : t('form.add');
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
      setMsg(t('form.added', { word: en.trim() }));
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

  const confirmRemoveTopic = (name) => {
    const used = cards.filter((c) => c.topic === name).length;
    Alert.alert(
      t('form.removeTopic'),
      t('form.removeTopicQ', { topic: name }) + (used ? `\n${t('form.removeTopicUsed', { n: used })}` : ''),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            onRemoveTopic(name);
            if (topic === name) setTopic(null);
          },
        },
      ]
    );
  };

  const row = wide ? 'flex-row gap-3' : 'gap-3';

  return (
    <View className="gap-4">
      <View className={row}>
        <Field label={lang.label} className={wide ? 'flex-1' : ''}>
          <Input
            ref={enRef}
            value={en}
            onChangeText={(t) => {
              setEn(t);
              setMsg('');
            }}
            placeholder={sample.word}
            autoCapitalize="none"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => trRef.current?.focus()}
            className="font-serif text-[19px]"
          />
        </Field>
        <Field label={t('common.meaning')} className={wide ? 'flex-1' : ''}>
          <Input
            ref={trRef}
            value={tr}
            onChangeText={setTr}
            placeholder={sample.meaning}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </Field>
      </View>

      {dup ? (
        <View className="-mt-1 flex-row items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5">
          <TriangleAlert size={16} color={colors.danger} />
          <Text className="flex-1 text-sm text-danger">
            {t('form.duplicate')} <Text className="font-sans-sb text-sm text-danger">{dup.en}</Text> — {dup.tr}
          </Text>
        </View>
      ) : null}

      <Field label={t('form.type')}>
        <View className="flex-row flex-wrap gap-2">
          {WORD_TYPES.map((w) => (
            <Chip key={w.key} label={w.label} active={types.includes(w.key)} onPress={() => toggleType(w.key)} />
          ))}
        </View>
      </Field>

      <Field label={t('form.topic')} hint={topics.length ? t('form.topicHint') : null}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" className="-mx-5" contentContainerClassName="gap-2 px-5">
          {topics.map((name) => (
            <Chip
              key={name}
              label={name}
              active={topic === name}
              onPress={() => setTopic(topic === name ? null : name)}
              onLongPress={() => confirmRemoveTopic(name)}
            />
          ))}
          {addingTopic ? (
            <Input
              value={newTopic}
              onChangeText={setNewTopic}
              placeholder={t('form.newTopic')}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={commitTopic}
              onBlur={commitTopic}
              className="h-9 min-w-[130px] rounded-full border-foreground py-0 text-sm"
            />
          ) : (
            <Chip dashed label={t('form.addTopic')} onPress={() => setAddingTopic(true)} />
          )}
        </ScrollView>
      </Field>

      <View className="rounded-2xl border border-border bg-card/60">
        <Pressable onPress={toggleDetails} className="flex-row items-center justify-between px-4 py-3 active:opacity-70">
          <View className="flex-row items-baseline gap-2">
            <Text className="font-sans-sb text-[15px]">{t('form.details')}</Text>
            <Text variant="small">
              {filledDetails ? t('form.detailsFilled', { n: filledDetails }) : t('form.detailsHint')}
            </Text>
          </View>
          <View style={{ transform: [{ rotate: detailsOpen ? '180deg' : '0deg' }] }}>
            <ChevronDown size={18} color={colors.mutedForeground} />
          </View>
        </Pressable>

        {detailsOpen ? (
          <View className="gap-3 border-t border-border px-4 pb-4 pt-3">
            <Field label={t('form.example')} hint={t('form.exampleHint')}>
              <Input
                value={example}
                onChangeText={setExample}
                placeholder={sample.example}
                multiline
                className="font-serif-i text-[17px]"
              />
            </Field>
            <View className="flex-row gap-3">
              <Field label={t('form.synonyms')} className="flex-1">
                <Input value={synonyms} onChangeText={setSynonyms} placeholder={sample.syn} autoCapitalize="none" />
              </Field>
              <Field label={t('form.antonyms')} className="flex-1">
                <Input value={antonyms} onChangeText={setAntonyms} placeholder={sample.ant} autoCapitalize="none" />
              </Field>
            </View>
            <Field label={t('form.reference')}>
              <Input value={reference} onChangeText={setReference} placeholder={t('form.referencePh')} returnKeyType="done" />
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
