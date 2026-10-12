import React, { useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { C } from '../theme';
import { makeBackup, parseBackup } from '../backup';
import Sheet from './Sheet';

export default function BackupSheet({ visible, onClose, cards, topics, onRestore }) {
  const [text, setText] = useState('');

  const exportBackup = async () => {
    try {
      await Share.share({ title: 'Kelime Kartları yedeği', message: makeBackup(cards, topics) });
    } catch (e) {
      Alert.alert('Paylaşılamadı', String(e?.message || e));
    }
  };

  const restore = () => {
    let data;
    try {
      data = parseBackup(text);
    } catch (e) {
      Alert.alert('Yedek okunamadı', e.message);
      return;
    }
    Alert.alert(
      'Yedeği geri yükle',
      `Şu anki ${cards.length} kelime silinecek, yerine yedekteki ${data.cards.length} kelime yüklenecek.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Geri yükle',
          style: 'destructive',
          onPress: () => {
            onRestore(data);
            setText('');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Sheet visible={visible} title="Yedek" onClose={onClose}>
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Yedek al</Text>
        <Text style={styles.text}>
          {cards.length} kelime ve {topics.length} konu tek bir metin olarak paylaşılır. Notlar'a kaydedebilir, kendine
          e-postayla ya da mesajla gönderebilirsin.
        </Text>
        <Pressable onPress={exportBackup} style={styles.btn}>
          <Text style={styles.btnText}>Yedeği paylaş</Text>
        </Pressable>
      </View>

      <View style={styles.box}>
        <Text style={styles.boxTitle}>Geri yükle</Text>
        <Text style={styles.text}>Daha önce aldığın yedek metninin tamamını aşağıya yapıştır.</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder='{"app":"kelime-kartlari", ...}'
          placeholderTextColor="#A8ACB2"
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={restore}
          disabled={!text.trim()}
          style={[styles.btn, { backgroundColor: C.warn }, !text.trim() && { opacity: 0.4 }]}
        >
          <Text style={styles.btnText}>Geri yükle</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 16, marginTop: 16 },
  boxTitle: { fontSize: 17, fontWeight: '700', color: C.ink, marginBottom: 6 },
  text: { color: C.muted, fontSize: 14, lineHeight: 20 },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: 12, marginTop: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: C.ink, minHeight: 90, maxHeight: 180, textAlignVertical: 'top',
  },
  btn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
