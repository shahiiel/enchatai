import React from 'react';

// Renders bold markdown ** ... ** in bot messages
function parseBoldText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Handle blockquotes starting with >
    return part;
  });
}

// Renders lines with blockquote support (> ...)
function renderLines(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('> ')) {
      return (
        <blockquote
          key={i}
          style={{
            borderLeft: '3px solid rgba(255,60,172,0.5)',
            paddingLeft: '12px',
            margin: '6px 0',
            color: 'rgba(255,255,255,0.55)',
            fontStyle: 'italic',
            fontSize: '13px',
          }}
        >
          {parseBoldText(line.slice(2))}
        </blockquote>
      );
    }
    return (
      <span key={i}>
        {parseBoldText(line)}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

export default function ChatBubble({ type, text, animationDelay = 0 }) {
  const isBot = type === 'bot';

  return (
    <div
      className={`bubble-row ${type}`}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className={`bubble-avatar ${type}`} aria-hidden="true">
        {isBot ? '✦' : '👤'}
      </div>
      <div className={`bubble ${type}`}>
        {isBot && <span className="bubble-label">EnchantAI</span>}
        <div>{renderLines(text)}</div>
      </div>
    </div>
  );
}
