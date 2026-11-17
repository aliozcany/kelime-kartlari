import React from 'react';
import CardForm from './CardForm';
import Sheet from './Sheet';

// Kart düzenleme penceresi. Düzenleme tekrar planına (stage, anchor, reviews) dokunmaz.
export default function EditCardSheet({ card, onClose, onSave, cards, topics, onAddTopic, onRemoveTopic }) {
  return (
    <Sheet visible={!!card} title="Kartı düzenle" onClose={onClose}>
      {card ? (
        <CardForm
          key={card.id}
          mode="edit"
          initial={card}
          cards={cards}
          topics={topics}
          onAddTopic={onAddTopic}
          onRemoveTopic={onRemoveTopic}
          onSubmit={(values) => {
            onSave({ ...card, ...values });
            onClose();
          }}
        />
      ) : null}
    </Sheet>
  );
}
