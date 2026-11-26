import React from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { t } from '../i18n';


// Alttan açılan tam ekran pencere (kart düzenleme, yedek)
export default function Sheet({ visible, title, onClose, children }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
            <Text variant="title">{title}</Text>
            <Button variant="ghost" size="sm" className="-mr-2" onPress={onClose}>
              <Text className="font-sans-md text-muted-foreground">{t('common.close')}</Text>
            </Button>
          </View>
          <KeyboardAwareScrollView
            bottomOffset={24}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="mx-auto w-full max-w-[760px] px-5 pb-10 pt-2"
          >
            {children}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
