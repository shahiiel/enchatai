import React from 'react';

export default function Header({ onReset }) {
  return (
    <header className="header">
      <div className="header-logo">
        <div className="header-logo-icon" aria-hidden="true">✦</div>
        <span className="header-logo-name">EnchantAI</span>
        <span className="header-badge">Beta</span>
      </div>
      <div className="header-actions">
        <button
          id="btn-new-chat"
          className="btn-reset"
          onClick={onReset}
          title="Start a new chat"
        >
          ↺ New Chat
        </button>
      </div>
    </header>
  );
}
