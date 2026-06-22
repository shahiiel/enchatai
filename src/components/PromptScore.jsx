import React from 'react';

export default function PromptScore({ score, achieved, missing }) {
  const color = score >= 80 ? '#10b981'
              : score >= 55 ? '#f59e0b'
              : '#FF3CAC';

  const label = score >= 80 ? 'Excellent'
              : score >= 55 ? 'Good'
              : 'Basic';

  const filledBars = Math.round(score / 10);

  return (
    <div className="prompt-score" aria-label={`Prompt quality score: ${score} out of 100`}>
      <div className="score-header">
        <span className="score-label">Prompt Quality</span>
        <span className="score-value" style={{ color }}>
          {score}<span className="score-max">/100</span>
          <span className="score-badge" style={{ background: `${color}22`, color, borderColor: `${color}44` }}>
            {label}
          </span>
        </span>
      </div>

      {/* Bar */}
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
        />
      </div>

      {/* Detail rows */}
      <div className="score-details">
        {achieved.map((item, i) => (
          <div key={i} className="score-item achieved">
            <span className="score-dot">✓</span>
            <span>{item}</span>
          </div>
        ))}
        {missing.map((item, i) => (
          <div key={i} className="score-item missing">
            <span className="score-dot">○</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
