import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="typing-row" aria-label="EnchantAI is typing">
      <div className="bubble-avatar bot" aria-hidden="true">✦</div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
