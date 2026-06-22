import React, { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import QuickReply from './QuickReply';
import TypingIndicator from './TypingIndicator';
import PromptOutput from './PromptOutput';

export default function ChatWindow({
  messages,
  isTyping,
  onQuickReply,
  onRegenerate,
  onReset,
  generatedPrompt,
  promptMeta,
}) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, generatedPrompt]);

  return (
    <main className="chat-window" id="chat-window" aria-label="Chat conversation">

      {/* Welcome state — shown when no messages */}
      {messages.length === 0 && !isTyping && (
        <div className="welcome-glow">
          <div className="welcome-orb" aria-hidden="true">✦</div>
          <h1 className="welcome-title">EnchantAI</h1>
          <p className="welcome-sub">
            Your intelligent prompt engineer.<br />
            Describe your goal and I'll craft the perfect AI prompt for you.
          </p>
        </div>
      )}

      {/* Render all messages */}
      {messages.map((msg, idx) => (
        <React.Fragment key={idx}>
          <ChatBubble
            type={msg.type}
            text={msg.text}
            animationDelay={0}
          />

          {/* Render quick replies below bot messages if this message carries options */}
          {msg.type === 'bot' && msg.options && (
            <QuickReply
              options={msg.options}
              selected={msg.selected}
              onSelect={(value, label) => onQuickReply(value, label, idx)}
              disabled={msg.selected !== undefined}
            />
          )}

          {/* Render prompt output below bot message if this is the final step */}
          {msg.type === 'bot' && msg.showPrompt && generatedPrompt && (
            <PromptOutput
              prompt={generatedPrompt}
              aiTarget={promptMeta?.aiTarget}
              category={promptMeta?.category}
              answers={promptMeta?.answers}
              onRegenerate={onRegenerate}
              onReset={onReset}
            />
          )}
        </React.Fragment>
      ))}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}

      <div ref={bottomRef} />
    </main>
  );
}
