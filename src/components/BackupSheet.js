import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { C } from '../theme';
import { makeBackup, parseBackup } from '../backup';
import { todayStr } from '../dates';
import Sheet from './Sheet';

export default function BackupSheet({ visible, onClose, cards, topics, onRestore }) {
  const [text, setText] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Yedeği .json dosyası olarak oluşturup paylaş menüsünü açar (Drive, Dosyalar, WhatsApp, e-posta…)
  const exportFile = async () => {
    setBusy(true);
    try {
      const file = new File(Paths.cache, `kelime-kartlari-${todayStr()}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(makeBackup(cards, topics));
      if (!(await Sharing.isAvailableAsync())) throw new Error('Bu cihazda paylaşım desteklenmiyor.');
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Yedeği kaydet',
        UTI: 'public.json',
      });
    } catch (e) {
      Alert.alert('Yedek alınamadı', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const confirmRestore = (data, after) => {
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
            after?.();
            onClose();
          },
        },
      ]
    );
  };

  const importFile = async () => {
    let content;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;
      content = await new File(res.assets[0].uri).text();
    } catch (e) {
      Alert.alert('Dosya açılamadı', String(e?.message || e));
      return;
    }
    try {
      confirmRestore(parseBackup(content));
    } catch (e) {
      Alert.alert('Yedek okunamadı', e.message);
    }
  };

  const restoreText = () => {
    try {
      confirmRestore(parseBackup(text), () => setText(''));
    } catch (e) {
      Alert.alert('Yedek okunamadı', e.message);
    }
  };

  return (
    <Sheet visible={visible} title="Yedek" onClose={onClose}>
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Yedek al</Text>
        <Text style={styles.text}>
          {cards.length} kelime ve {topics.length} konu tek bir .json dosyası olarak kaydedilir. Açılan menüden Drive'a,
          Dosyalar'a, e-postaya ya da WhatsApp'a gönderebilirsin.
        </Text>
        <Pressable onPress={exportFile} disabled={busy} style={[styles.btn, busy && { opacity: 0.5 }]}>
          <Text style={styles.btnText}>Yedek dosyasını kaydet</Text>
        </Pressable>
      </View>

      <View style={styles.box}>
        <Text style={styles.boxTitle}>Geri yükle</Text>
        <Text style={styles.text}>Daha önce kaydettiğin yedek dosyasını seç. Mevcut kelimelerin yerine yüklenir.</Text>
        <Pressable onPress={importFile} style={[styles.btn, { backgroundColor: C.warn }]}>
          <Text style={styles.btnText}>Yedek dosyası seç</Text>
        </Pressable>

        <Pressable onPress={() => setPasteOpen(!pasteOpen)} hitSlop={8} style={{ marginTop: 14 }}>
          <Text style={styles.link}>{pasteOpen ? '▾' : '▸'} Eski yöntem: metni yapıştır</Text>
        </Pressable>
        {pasteOpen ? (
          <>
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
              onPress={restoreText}
              disabled={!text.trim()}
              style={[styles.btn, { backgroundColor: C.warn }, !text.trim() && { opacity: 0.4 }]}
            >
              <Text style={styles.btnText}>Metinden geri yükle</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 16, marginTop: 16 },
  boxTitle: { fontSize: 17, fontWeight: '700', color: C.ink, marginBottom: 6 },
  text: { color: C.muted, fontSize: 14, lineHeight: 20 },
  link: { color: C.muted, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: 12, marginTop: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: C.ink, minHeight: 90, maxHeight: 180, textAlignVertical: 'top',
  },
  btn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
