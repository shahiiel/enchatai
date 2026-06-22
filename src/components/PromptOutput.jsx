import React, { useState } from 'react';
import { categoryLabels, calculateQualityScore } from '../utils/promptGenerator';
import PromptScore from './PromptScore';

export default function PromptOutput({ prompt, aiTarget, category, answers, onRegenerate, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const el = document.createElement('textarea');
      el.value = prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const aiLabel  = aiTarget === 'chatgpt' ? '🤖 ChatGPT' : '🧠 Claude AI';
  const catLabel = categoryLabels[category] ?? '✨ General';
  const { score, achieved, missing } = calculateQualityScore(answers ?? {});

  return (
    <div className="prompt-output" aria-live="polite">
      <div className="prompt-card">

        {/* Header */}
        <div className="prompt-card-header">
          <div className="prompt-card-title">
            <span>✦</span> Your Optimized Prompt
          </div>
          <div className="prompt-badges">
            <span className="prompt-badge ai">{aiLabel}</span>
            <span className="prompt-badge category">{catLabel}</span>
          </div>
        </div>

        {/* Quality Score */}
        <PromptScore score={score} achieved={achieved} missing={missing} />

        {/* Prompt Text */}
        <div className="prompt-text-wrap">
          <p className="prompt-text" id="generated-prompt-text">{prompt}</p>
        </div>

        {/* Actions */}
        <div className="prompt-actions">
          <button
            id="btn-copy-prompt"
            className={`btn-copy ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied!' : '📋 Copy Prompt'}
          </button>
          <button id="btn-regenerate" className="btn-secondary" onClick={onRegenerate}>
            ↻ Regenerate
          </button>
          <button id="btn-start-over" className="btn-secondary" onClick={onReset}>
            ↺ New Chat
          </button>
        </div>
      </div>
    </div>
  );
}
