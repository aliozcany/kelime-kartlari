import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { todayStr, addDays, INTERVALS, formatShort } from '../dates';
import { newId } from '../storage';
import CardForm from '../components/CardForm';
import { Text } from '../components/ui/text';
import { t } from '../i18n';


export default function AddScreen({ cards, topics, onAdd, onAddTopic, onRemoveTopic, todayCount }) {
  const today = todayStr();

  const add = (values) =>
    onAdd({
      id: newId(),
      ...values,
      createdAt: today,
      stage: 0,
      reviews: [],
    });

  return (
    <KeyboardAwareScrollView
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="mx-auto w-full max-w-[760px] px-5 pb-10 pt-2"
    >
      <CardForm
        mode="add"
        cards={cards}
        topics={topics}
        onAddTopic={onAddTopic}
        onRemoveTopic={onRemoveTopic}
        onSubmit={add}
      />

      <Text variant="small" className="mt-5 text-center leading-[18px]">
        {t('add.footer', { n: todayCount })}{'\n'}
        {INTERVALS.map((d) => formatShort(addDays(today, d))).join('  ·  ')}
      </Text>
    </KeyboardAwareScrollView>
  );
}
