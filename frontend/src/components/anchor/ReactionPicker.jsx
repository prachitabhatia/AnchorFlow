import React from 'react';

const REACTIONS = [
  { id: 'amazing', label: 'Amazing', emoji: '🔥' },
  { id: 'good', label: 'Good', emoji: '🙂' },
  { id: 'mid', label: 'Mid', emoji: '😐' },
  { id: 'boring', label: 'Boring', emoji: '😴' },
  { id: 'confusing', label: 'Confusing', emoji: '😕' },
];

export default function ReactionPicker({ onSelectReaction, disabled = false }) {
  return (
    <div className="reaction-picker-grid">
      {REACTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          style={{ pointerEvents: disabled ? 'none' : 'auto' }}
          onClick={() => onSelectReaction && onSelectReaction(item.id)}
          className="reaction-button"
        >
          <span className="reaction-emoji">{item.emoji}</span>
          <span className="reaction-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
