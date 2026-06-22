import React from 'react';

export default function QuickReply({ options, selected, onSelect, disabled }) {
  return (
    <div className="quick-reply-wrap" role="group" aria-label="Options">
      {options.map((opt) => (
        <button
          key={opt.value}
          id={`qr-${opt.value}`}
          className={`quick-reply-btn ${selected === opt.value ? 'selected' : ''}`}
          onClick={() => !disabled && onSelect(opt.value, opt.label)}
          disabled={disabled && selected !== opt.value}
          aria-pressed={selected === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
