// ============================================================
// conversationFlow.js — Steps, messages, smart goal analysis
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

// ─── Category-specific required details ───────────────────────
// Each category defines what info a good prompt needs.
// `detect` matches the user's goal to this category.
// `fields` lists what details to check for — each has keywords
// that indicate the detail IS present, and a question to ask if missing.

const categoryRequirements = {
  education: {
    detect: /lesson\s*plan|teach|syllabus|curriculum|worksheet|quiz|exam|test\s*paper|assignment|lecture|tutorial|course\s*plan|study\s*(guide|plan|material)|class\s*plan/i,
    fields: [
      { name: 'subject',  present: /math|science|english|history|physics|chemistry|biology|geography|economics|hindi|social|computer|art|music|literature|philosophy|psychology|political|sociology|language|accounting|business\s*studies/i, question: '📚 Which **subject** is this for?' },
      { name: 'grade',    present: /class\s*\d|grade\s*\d|year\s*\d|level|standard|std\s*\d|k-?\d|kindergarten|primary|secondary|high\s*school|college|university|undergraduate|postgraduate|\d+(st|nd|rd|th)\s*(class|grade|year|standard)/i, question: '🎓 Which **class/grade level**?' },
      { name: 'topic',    present: /chapter|topic|unit|on\s+\w{3,}|about\s+\w{3,}|covering|concept\s+of|introduction\s+to|basics\s+of|advanced|fundamentals/i, question: '📖 Which specific **chapter or topic**?' },
      { name: 'duration', present: /\d+\s*(min|hour|period|week|day|session|class)|duration|length|time/i, question: '⏱️ What **duration** — how many periods or minutes?' },
    ],
    acknowledge: 'I see you want to create educational content! 🎓',
  },

  coding: {
    detect: /code|program|function|script|api|develop|build\s*(a|an|the)?\s*(app|website|tool|bot|game|system|platform)|debug|fix\s*(a|the|my)?\s*(bug|error|issue)|software|algorithm|database|frontend|backend|fullstack|deploy/i,
    fields: [
      { name: 'language', present: /python|javascript|java\b|c\+\+|c#|typescript|react|node|html|css|sql|rust|go\b|swift|kotlin|php|ruby|dart|flutter|angular|vue|next|express|django|flask|spring|laravel/i, question: '💻 Which **programming language or framework**?' },
      { name: 'functionality', present: /that\s+(can|will|should|does)|which\s+(can|will|should)|to\s+(do|create|build|make|handle|process|display|show|calculate|convert|fetch|send|store|manage|authenticate|validate|render|parse|sort|filter|search)/i, question: '⚙️ What should it **do specifically**? Describe the functionality.' },
      { name: 'context', present: /for\s+(a|an|my|the|our)|using|with\s+(a|an)?\s*\w{3,}|integrate|connect|database|ui|interface|endpoint/i, question: '🔧 Any **context** — what project is this for? Any libraries/tools to use?' },
    ],
    acknowledge: 'A coding task — let me get the details right! 💻',
  },

  writing: {
    detect: /write|article|blog\s*post|essay|story|novel|content|copywriting|script|screenplay|poem|speech|press\s*release|white\s*paper|case\s*study|newsletter/i,
    fields: [
      { name: 'topic',    present: /about|on\s+\w{3,}|topic|regarding|covering|exploring|discussing|related\s+to|titled|called/i, question: '📝 What **topic** should it cover?' },
      { name: 'audience', present: /for\s+(a|an|my|the|our)?\s*(client|boss|team|reader|audience|student|kid|child|beginner|expert|developer|marketer|professional|customer|investor)/i, question: '👥 Who is the **target reader/audience**?' },
      { name: 'length',   present: /\d+\s*(word|page|paragraph|sentence|line)|short|long|brief|detailed|comprehensive|in-depth|quick|concise/i, question: '📏 What **length** — short, detailed, or a specific word count?' },
    ],
    acknowledge: 'A writing task — let me understand what you need! ✍️',
  },

  email: {
    detect: /email|mail|letter|message\s+to|correspondence|reply\s+to|follow[\s-]*up|outreach|cold\s*(email|mail)|cover\s*letter/i,
    fields: [
      { name: 'recipient', present: /to\s+(a|an|my|the|our)?\s*(client|boss|manager|team|colleague|professor|teacher|customer|recruiter|hr|investor|partner|friend|vendor)|recipient/i, question: '👤 Who is the **recipient**? (boss, client, professor, etc.)' },
      { name: 'purpose',   present: /about|regarding|for\s+(a|an|the)?|to\s+(ask|request|inform|apologize|thank|invite|propose|negotiate|complain|follow|schedule|confirm|cancel|introduce)/i, question: '🎯 What is the **purpose** of this message?' },
      { name: 'tone',      present: /formal|informal|casual|friendly|professional|polite|urgent|apologetic|persuasive|firm/i, question: '🎭 What **tone** — formal, friendly, urgent, etc.?' },
    ],
    acknowledge: 'Let me help you craft the perfect message! ✉️',
  },

  marketing: {
    detect: /market|advertise|promote|brand|campaign|sell|growth|lead|conversion|landing\s*page|ad\s*(copy|text)|social\s*media\s*(post|content|strategy)|seo|funnel|launch/i,
    fields: [
      { name: 'product',  present: /for\s+(a|an|my|the|our)?\s*\w{3,}|product|service|brand|company|startup|app|tool|platform|business|store|shop/i, question: '🏷️ What **product/service/brand** is this for?' },
      { name: 'audience',  present: /target|audience|customer|demographic|user|market|segment|niche|persona|b2b|b2c|consumer/i, question: '🎯 Who is the **target audience**?' },
      { name: 'platform',  present: /instagram|facebook|linkedin|twitter|tiktok|youtube|google|website|email|newsletter|billboard|print|radio|tv|podcast/i, question: '📱 Which **platform or channel**?' },
    ],
    acknowledge: 'A marketing task — let\'s make it impactful! 📣',
  },

  business: {
    detect: /business\s*plan|strategy|pitch\s*(deck)?|startup|finance|revenue|investor|proposal|swot|competitive\s*analysis|market\s*research|feasibility|budget|forecast/i,
    fields: [
      { name: 'industry', present: /tech|saas|ecommerce|healthcare|fintech|edtech|retail|manufacturing|consulting|real\s*estate|food|travel|fashion|logistics|agriculture/i, question: '🏢 Which **industry** is this in?' },
      { name: 'purpose',  present: /for\s+(a|an|the)?\s*(investor|bank|team|board|meeting|presentation|funding|grant|loan)|to\s+(raise|secure|pitch|present|plan|grow|scale|launch)/i, question: '🎯 What is the **purpose** — pitching investors, internal planning, etc.?' },
      { name: 'stage',    present: /early|seed|series|mvp|launch|growth|mature|pre-revenue|revenue|established|scaling|startup|idea\s*stage/i, question: '📊 What **stage** is the business at?' },
    ],
    acknowledge: 'A business task — let me understand the context! 📊',
  },

  social: {
    detect: /social\s*media|post|tweet|instagram|linkedin|thread|viral|tiktok|reel|caption|hashtag|content\s*calendar|carousel/i,
    fields: [
      { name: 'platform', present: /instagram|facebook|linkedin|twitter|x\.com|tiktok|youtube|pinterest|threads|snapchat|reddit/i, question: '📱 Which **platform** is this for?' },
      { name: 'topic',    present: /about|on\s+\w{3,}|topic|regarding|promoting|announcing|celebrating|sharing/i, question: '📝 What **topic or message** should the post convey?' },
      { name: 'brand',    present: /for\s+(a|an|my|the|our)?\s*(brand|company|business|client|personal|page|account)|brand|tone|voice/i, question: '🏷️ For which **brand/account** — and what\'s the brand voice?' },
    ],
    acknowledge: 'Let\'s create engaging social content! 📱',
  },

  design: {
    detect: /design|image|logo|visual|art|illustration|graphic|ui|ux|wireframe|mockup|prototype|banner|poster|flyer|brochure|infographic|thumbnail/i,
    fields: [
      { name: 'type',    present: /logo|banner|poster|flyer|brochure|infographic|thumbnail|icon|illustration|mockup|wireframe|ui|ux|layout|card|template/i, question: '🎨 What **type of design** — logo, banner, UI, poster, etc.?' },
      { name: 'style',   present: /minimal|modern|vintage|retro|bold|elegant|playful|corporate|flat|3d|gradient|glassmorphism|neomorphism|abstract|geometric|hand[\s-]*drawn/i, question: '✨ What **style/mood** — modern, minimal, bold, etc.?' },
      { name: 'usage',   present: /for\s+(a|an|my|the|our)?\s*(website|app|social|print|business|event|brand|product|presentation|youtube|twitch)/i, question: '📐 Where will it be **used** — website, social media, print, etc.?' },
    ],
    acknowledge: 'A design task — let me understand your vision! 🎨',
  },

  research: {
    detect: /research|analyze|study|explain|summarize|learn|report|data|insight|compare|review|investigate|overview|deep\s*dive|breakdown/i,
    fields: [
      { name: 'topic',  present: /about|on\s+\w{3,}|topic|regarding|of\s+\w{3,}|into\s+\w{3,}/i, question: '🔍 What specific **topic** should be researched?' },
      { name: 'depth',  present: /brief|detailed|comprehensive|overview|in-depth|quick|thorough|summary|deep|surface|high[\s-]*level/i, question: '📊 How **in-depth** — quick overview or comprehensive analysis?' },
      { name: 'format', present: /report|paper|presentation|summary|list|comparison|table|chart|pros\s*(and|&)\s*cons|bullet|essay/i, question: '📋 What **output format** — report, summary, comparison, etc.?' },
    ],
    acknowledge: 'A research task — let me know what to dig into! 🔬',
  },
};

// ─── Analyze Goal Completeness ───────────────────────────────
// Returns { category, acknowledged, missingQuestions[], presentDetails[] }
export function analyzeGoal(text) {
  const t = text.trim();
  const words = t.split(/\s+/).filter(Boolean).length;

  // Ultra-short or trivially vague
  if (words < 3) {
    return {
      category: null,
      acknowledge: null,
      missing: [],
      present: [],
      isUltraVague: true,
    };
  }

  // Try to match a category
  for (const [catName, cat] of Object.entries(categoryRequirements)) {
    if (cat.detect.test(t)) {
      const missing = [];
      const present = [];

      for (const field of cat.fields) {
        if (field.present.test(t)) {
          present.push(field.name);
        } else {
          missing.push(field.question);
        }
      }

      return {
        category: catName,
        acknowledge: cat.acknowledge,
        missing,
        present,
        isUltraVague: false,
      };
    }
  }

  // No category matched — check general completeness
  return {
    category: 'general',
    acknowledge: null,
    missing: [],
    present: [],
    isUltraVague: false,
  };
}

// ─── Smart Vague Detection ───────────────────────────────────
export function isVague(text) {
  const t = text.trim();
  const words = t.split(/\s+/).filter(Boolean).length;

  // Ultra-short is always vague
  if (words < 3) return true;

  // Generic patterns that are always vague regardless of length
  const genericPatterns = [
    /^(help|help me|i need help|assist me|can you help)$/i,
    /^(something|anything|idk|not sure)$/i,
    /^(create|make|write|build|do something|do it)$/i,
    /^(i need (a |an |to )?(create|make|write|do|build)?)$/i,
    /^i want (to )?(create|make|write|build|do)?$/i,
    /^(please )?(help|assist|support)( me)?( with)?( (this|that|it))?$/i,
  ];
  if (genericPatterns.some((re) => re.test(t))) return true;

  // Category-specific: if we detect a category but most details are missing → vague
  const analysis = analyzeGoal(t);
  if (analysis.isUltraVague) return true;

  // If a category matched and has 2+ missing fields → needs clarification
  if (analysis.category && analysis.category !== 'general' && analysis.missing.length >= 2) {
    return true;
  }

  // Short goals (< 7 words) without a recognized category are likely vague
  if (words < 7 && analysis.category === 'general') return true;

  return false;
}

// ─── Build Smart Clarification Message ───────────────────────
export function getClarifyMessage(vagueGoal) {
  const analysis = analyzeGoal(vagueGoal);

  // Ultra-vague — generic encouragement
  if (analysis.isUltraVague) {
    return `I'd love to help! ✨ But I need more to work with.\n\nTry describing:\n- **What** you want to create or accomplish\n- **Who** it's for\n- **Any specifics** (topic, style, length, etc.)\n\nThe more detail you give, the better your prompt will be!`;
  }

  // Category matched with specific missing details
  if (analysis.category && analysis.category !== 'general' && analysis.missing.length > 0) {
    const ack = analysis.acknowledge || 'Got it! Let me ask a few things to make your prompt perfect. 🎯';
    const questions = analysis.missing.map(q => `- ${q}`).join('\n');
    const presentNote = analysis.present.length > 0
      ? `\n\n> I noticed you've already specified: **${analysis.present.join(', ')}** — great!`
      : '';

    return `${ack}\n\nTo craft the best prompt, I need a few more details:\n\n${questions}${presentNote}\n\nFeel free to answer all at once!`;
  }

  // General / unrecognized category — ask open-ended
  return `Got it! To craft the best possible prompt, I need a bit more detail. 🎯\n\nCan you tell me:\n- **What specifically** should the output include?\n- **Who** is this for?\n- **Any preferences** on style, length, or format?\n\nDescribe it as thoroughly as you like!`;
}

// ─── Bot Messages ─────────────────────────────────────────────
export function getBotMessage(step, answers = {}) {
  switch (step) {
    case STEPS.GOAL:
      return "Hey! ✨ I'm **EnchantAI** — your prompt engineer.\n\nWhat do you want to create or accomplish today? Describe it freely — the more detail, the better your prompt will be.";
    case STEPS.CLARIFY:
      return getClarifyMessage(answers.goal ?? '');
    case STEPS.AI_TARGET: {
      // Generate a smart acknowledgment based on goal analysis
      const analysis = analyzeGoal(answers.goal ?? '');
      const ack = analysis.acknowledge || '✨ Great';
      return `${ack}\n\nI'll craft the best prompt for:\n\n> "${answers.goal}"\n\nWhich AI are you targeting?`;
    }
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
