// ============================================================
// conversationFlow.js — Steps, messages, vague detection
// ============================================================

export const STEPS = {
  GOAL:      'goal',
  CLARIFY:   'clarify',
  AI_TARGET: 'ai_target',
  TONE:      'tone',
  FORMAT:    'format',
  AUDIENCE:  'audience',
  AVOID:     'avoid',
  GENERATE:  'generate',
  DONE:      'done',
};

// ─── Vague Detection ──────────────────────────────────────────
export function isVague(text) {
  const t = text.trim();
  if (t.split(/\s+/).filter(Boolean).length < 5) return true;
  const patterns = [
    /^(help|help me|i need help|assist me)$/i,
    /^(something|anything|idk)$/i,
    /^(create|make|write|build|do something)$/i,
    /^(i need (a |an |to )?(create|make|write|do|build)?)$/i,
    /^i want (to )?(create|make|write|build|do)?$/i,
  ];
  return patterns.some((re) => re.test(t));
}

function getClarifyHint(text) {
  const t = text.toLowerCase();
  if (/story|novel|fiction|script/.test(t))    return 'What genre? Who are the main characters? What is the setting?';
  if (/code|program|app|function|debug/.test(t)) return 'What language/framework? What should it do? Any constraints?';
  if (/email|letter|proposal/.test(t))         return 'Who is the recipient? What is the goal of this message?';
  if (/blog|article|essay|content/.test(t))    return 'What is the specific topic? Who is the target reader?';
  if (/market|ad|campaign|brand/.test(t))      return 'What product/service? Who is the customer? What is the goal?';
  if (/image|design|logo|visual/.test(t))      return 'What style/mood? Where will it be used? Any references?';
  return 'What is the specific topic? Who is this for? Any style requirements?';
}

export function getClarifyMessage(vagueGoal) {
  return `Got it! To craft the best prompt, I need a bit more detail. 🎯\n\n${getClarifyHint(vagueGoal)}\n\nDescribe it as thoroughly as you like!`;
}

// ─── Bot Messages ─────────────────────────────────────────────
export function getBotMessage(step, answers = {}) {
  switch (step) {
    case STEPS.GOAL:
      return "Hey! ✨ I'm **EnchantAI** — your prompt engineer.\n\nWhat do you want to create or accomplish today? Describe it freely.";
    case STEPS.CLARIFY:
      return getClarifyMessage(answers.goal ?? '');
    case STEPS.AI_TARGET:
      return `Perfect! I'll craft the best prompt for:\n\n> "${answers.goal}"\n\nWhich AI are you targeting?`;
    case STEPS.TONE:
      return "Great choice! 🎯 What tone should the AI respond in?";
    case STEPS.FORMAT:
      return "Almost there ✨ How would you like the output structured?";
    case STEPS.AUDIENCE:
      return "Who is the **audience** for this output? This dramatically improves your prompt quality.";
    case STEPS.AVOID:
      return "Last step! 🚀 Anything the AI should **avoid** in its response?\n\nType specific constraints, or click **Skip** to generate now.";
    case STEPS.GENERATE:
      return "✅ Your optimized prompt is ready! Copy it and paste it directly into your chosen AI.";
    default:
      return '';
  }
}

// ─── Quick Reply Options ──────────────────────────────────────
export function getOptions(step) {
  switch (step) {
    case STEPS.AI_TARGET:
      return [
        { label: '🤖 ChatGPT',  value: 'chatgpt' },
        { label: '🧠 Claude AI', value: 'claude'  },
      ];
    case STEPS.TONE:
      return [
        { label: '💼 Professional', value: 'professional' },
        { label: '🎨 Creative',     value: 'creative'     },
        { label: '⚙️ Technical',    value: 'technical'    },
        { label: '😊 Casual',       value: 'casual'       },
        { label: '🔥 Persuasive',   value: 'persuasive'   },
      ];
    case STEPS.FORMAT:
      return [
        { label: '✂️ Concise',      value: 'concise'    },
        { label: '📖 Detailed',     value: 'detailed'   },
        { label: '📋 Step-by-step', value: 'stepbystep' },
        { label: '• Bullet Points', value: 'bullets'    },
      ];
    case STEPS.AUDIENCE:
      return [
        { label: '👤 Myself',         value: 'myself'       },
        { label: '🌱 Beginners',      value: 'beginners'    },
        { label: '🎓 Students',       value: 'students'     },
        { label: '💼 Professionals',  value: 'professionals'},
        { label: '🌍 General Public', value: 'general'      },
        { label: '🧑‍💻 Developers',    value: 'developers'   },
      ];
    case STEPS.AVOID:
      return [{ label: '⏭️ Skip', value: 'skip' }];
    default:
      return [];
  }
}

export const STEP_SEQUENCE = [
  STEPS.GOAL, STEPS.AI_TARGET, STEPS.TONE,
  STEPS.FORMAT, STEPS.AUDIENCE, STEPS.AVOID, STEPS.GENERATE,
];

export function nextStep(current) {
  if (current === STEPS.CLARIFY) return STEPS.AI_TARGET;
  const idx = STEP_SEQUENCE.indexOf(current);
  return STEP_SEQUENCE[idx + 1] ?? STEPS.DONE;
}
