import React, { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { C } from '../theme';

const PLACEHOLDER = '#A8ACB2';

// Kelime türleri (isteğe bağlı, birden fazla seçilebilir)
export const WORD_TYPES = [
  { key: 'noun', label: 'noun' },
  { key: 'verb', label: 'verb' },
  { key: 'adj', label: 'adj' },
  { key: 'adv', label: 'adv' },
  { key: 'phrase', label: 'phrase' },
];

// Aynı İngilizce kelime (büyük/küçük harf ve boşluk farkı gözetmeden) başka bir kartta var mı
export function findDuplicate(cards, en, exceptId) {
  const k = en.trim().toLowerCase();
  if (!k) return null;
  return cards.find((c) => c.id !== exceptId && c.en.trim().toLowerCase() === k) || null;
}

// Ekleme ve düzenleme için ortak form.
// mode: 'add' → kaydedince alanlar temizlenir (konu ve referans bir sonraki kelime için kalır)
//       'edit' → initial kartın alanlarıyla açılır
export default function CardForm({ mode = 'add', initial, cards, topics, onAddTopic, onRemoveTopic, onSubmit }) {
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
  const enRef = useRef(null);
  const trRef = useRef(null);
  const exRef = useRef(null);
  const refRef = useRef(null);

  const dup = findDuplicate(cards, en, initial?.id);
  const canSave = en.trim() && tr.trim();
  const label = dup ? (isEdit ? 'Yine de kaydet' : 'Yine de ekle') : isEdit ? 'Kaydet' : 'Kartı ekle';

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

  return (
    <View>
      <Text style={styles.label}>İngilizce</Text>
      <TextInput
        ref={enRef}
        style={styles.input}
        value={en}
        onChangeText={(t) => { setEn(t); setMsg(''); }}
        placeholder="ör. reluctant"
        placeholderTextColor={PLACEHOLDER}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => trRef.current?.focus()}
      />
      {dup ? (
        <Text style={styles.dup}>⚠️ Bu kelime zaten var: “{dup.en}” — {dup.tr}</Text>
      ) : null}

      <Text style={styles.label}>Türkçe</Text>
      <TextInput
        ref={trRef}
        style={styles.input}
        value={tr}
        onChangeText={setTr}
        placeholder="ör. isteksiz, gönülsüz"
        placeholderTextColor={PLACEHOLDER}
        returnKeyType="next"
        onSubmitEditing={() => exRef.current?.focus()}
      />

      <Text style={styles.label}>Tür <Text style={styles.optional}>(isteğe bağlı)</Text></Text>
      <View style={styles.chips}>
        {WORD_TYPES.map((t) => {
          const active = types.includes(t.key);
          return (
            <Pressable key={t.key} onPress={() => toggleType(t.key)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Örnek cümle <Text style={styles.optional}>(ipucu olarak gösterilir)</Text></Text>
      <TextInput
        ref={exRef}
        style={[styles.input, styles.multi]}
        value={example}
        onChangeText={setExample}
        placeholder="ör. She was reluctant to leave the party."
        placeholderTextColor={PLACEHOLDER}
        multiline
      />

      <Text style={styles.label}>Eş anlamlılar <Text style={styles.optional}>(isteğe bağlı)</Text></Text>
      <TextInput
        style={styles.input}
        value={synonyms}
        onChangeText={setSynonyms}
        placeholder="ör. unwilling, hesitant"
        placeholderTextColor={PLACEHOLDER}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Zıt anlamlılar <Text style={styles.optional}>(isteğe bağlı)</Text></Text>
      <TextInput
        style={styles.input}
        value={antonyms}
        onChangeText={setAntonyms}
        placeholder="ör. eager, willing"
        placeholderTextColor={PLACEHOLDER}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Nerede gördün <Text style={styles.optional}>(isteğe bağlı)</Text></Text>
      <TextInput
        ref={refRef}
        style={styles.input}
        value={reference}
        onChangeText={setReference}
        placeholder="ör. Friends 3. sezon, BBC haberi"
        placeholderTextColor={PLACEHOLDER}
        returnKeyType="done"
      />

      <Text style={styles.label}>Konu <Text style={styles.optional}>(isteğe bağlı)</Text></Text>
      <View style={styles.chips}>
        {topics.map((t) => {
          const active = topic === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTopic(active ? null : t)}
              onLongPress={() => confirmRemoveTopic(t)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          );
        })}
        {addingTopic ? (
          <TextInput
            style={[styles.chip, styles.chipInput]}
            value={newTopic}
            onChangeText={setNewTopic}
            placeholder="Yeni konu"
            placeholderTextColor={PLACEHOLDER}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={commitTopic}
            onBlur={commitTopic}
          />
        ) : (
          <Pressable onPress={() => setAddingTopic(true)} style={[styles.chip, styles.chipAdd]}>
            <Text style={styles.chipAddText}>+ Konu</Text>
          </Pressable>
        )}
      </View>
      {topics.length > 0 ? <Text style={styles.small}>Seçmek için dokun, silmek için uzun bas.</Text> : null}

      <Pressable
        onPress={submit}
        disabled={!canSave}
        style={[styles.saveBtn, dup && { backgroundColor: C.warn }, !canSave && { opacity: 0.4 }]}
      >
        <Text style={styles.saveText}>{label}</Text>
      </Pressable>

      {msg ? <Text style={styles.msg}>{msg} ✓</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 6, marginTop: 14 },
  optional: { fontWeight: '400', color: C.muted },
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 17, color: C.ink,
  },
  multi: { minHeight: 80, textAlignVertical: 'top' },
  dup: { color: C.warn, backgroundColor: C.warnSoft, borderRadius: 10, padding: 10, marginTop: 8, fontSize: 14, overflow: 'hidden' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.ink, fontSize: 15 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  chipAdd: { borderStyle: 'dashed', borderColor: C.muted, backgroundColor: 'transparent' },
  chipAddText: { color: C.muted, fontSize: 15, fontWeight: '600' },
  chipInput: { minWidth: 120, fontSize: 15, color: C.ink, borderColor: C.accent, paddingVertical: 6 },
  small: { color: PLACEHOLDER, fontSize: 12, marginTop: 8 },
  saveBtn: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  msg: { textAlign: 'center', color: C.accent, marginTop: 12, fontSize: 15 },
});
