import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useColors } from '../theme';
import { makeBackup, parseBackup } from '../backup';
import { todayStr } from '../dates';
import Sheet from './Sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Text } from './ui/text';

export default function BackupSheet({ visible, onClose, cards, topics, onRestore }) {
  const [text, setText] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const colors = useColors();

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
      <View className="gap-4">
        <View className="rounded-2xl border border-border bg-card p-4">
          <Text variant="heading">Yedek al</Text>
          <Text variant="muted" className="mt-1 leading-5">
            {cards.length} kelime ve {topics.length} konu tek bir .json dosyası olarak kaydedilir. Açılan menüden Drive'a,
            Dosyalar'a, e-postaya ya da WhatsApp'a gönderebilirsin.
          </Text>
          <Button className="mt-4" onPress={exportFile} disabled={busy}>
            <Text>Yedek dosyasını kaydet</Text>
          </Button>
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Text variant="heading">Geri yükle</Text>
          <Text variant="muted" className="mt-1 leading-5">
            Daha önce kaydettiğin yedek dosyasını seç. Mevcut kelimelerin yerine yüklenir.
          </Text>
          <Button variant="danger" className="mt-4" onPress={importFile}>
            <Text>Yedek dosyası seç</Text>
          </Button>

          <Pressable onPress={() => setPasteOpen(!pasteOpen)} hitSlop={8} className="mt-4 flex-row items-center gap-1">
            {pasteOpen ? (
              <ChevronDown size={15} color={colors.mutedForeground} />
            ) : (
              <ChevronRight size={15} color={colors.mutedForeground} />
            )}
            <Text variant="label">Eski yöntem: metni yapıştır</Text>
          </Pressable>
          {pasteOpen ? (
            <>
              <Input
                className="mt-3 max-h-[180px] bg-background text-[13px]"
                value={text}
                onChangeText={setText}
                placeholder='{"app":"kelime-kartlari", ...}'
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Button variant="danger" className="mt-3" onPress={restoreText} disabled={!text.trim()}>
                <Text>Metinden geri yükle</Text>
              </Button>
            </>
          ) : null}
        </View>
      </View>
    </Sheet>
  );
}
