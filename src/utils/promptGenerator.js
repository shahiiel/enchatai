// ============================================================
// promptGenerator.js — CO-STAR framework, quality scoring
// ============================================================

// ─── Category Detection ───────────────────────────────────────
export function detectCategory(goal) {
  const g = goal.toLowerCase();
  if (/code|program|function|debug|script|api|develop|build|fix|bug|software/.test(g)) return 'coding';
  if (/write|article|blog|essay|story|email|letter|caption|copy|content|novel/.test(g)) return 'writing';
  if (/design|image|logo|visual|art|illustration|graphic|ui|ux|photo/.test(g))         return 'creative';
  if (/research|analyze|study|explain|summarize|learn|report|data|insight/.test(g))    return 'research';
  if (/market|advertise|promote|brand|campaign|sell|growth|lead|conversion/.test(g))   return 'marketing';
  if (/business|plan|strategy|pitch|startup|finance|revenue|investor|proposal/.test(g)) return 'business';
  if (/social|post|tweet|instagram|linkedin|thread|viral|tiktok/.test(g))              return 'social';
  if (/teach|course|lesson|tutorial|workshop|training|education/.test(g))               return 'education';
  return 'general';
}

export const categoryLabels = {
  coding:    '💻 Coding',
  writing:   '✍️ Writing',
  creative:  '🎨 Creative',
  research:  '🔬 Research',
  marketing: '📣 Marketing',
  business:  '📊 Business',
  social:    '📱 Social',
  education: '🎓 Education',
  general:   '✨ General',
};

// ─── Maps ─────────────────────────────────────────────────────
const toneMap = {
  professional: 'professional, authoritative, and polished',
  creative:     'creative, imaginative, and engaging',
  technical:    'technical, precise, and thorough',
  casual:       'casual, friendly, and conversational',
  persuasive:   'persuasive, compelling, and action-oriented',
};

const formatMap = {
  concise:    'Be concise and to the point — brief, sharp, and impactful.',
  detailed:   'Be comprehensive — rich explanations, examples, and depth.',
  stepbystep: 'Use clear numbered steps that are easy to follow sequentially.',
  bullets:    'Use bullet points for clarity and quick readability.',
};

const audienceMap = {
  myself:        'the requester — be direct, assume full context, skip basic explanations',
  beginners:     'complete beginners — use simple language, define terms, use analogies, avoid jargon',
  students:      'students — educational tone, build understanding progressively, include context',
  professionals: 'industry professionals — use correct terminology, assume domain expertise, be precise',
  general:       'general public — accessible, clear, no assumed background, relatable examples',
  developers:    'software developers — technical precision welcome, code examples encouraged',
};

const systemRoles = {
  coding:    'You are a senior software engineer with 15+ years of experience in clean, production-grade code.',
  writing:   'You are an expert content writer and editor with a proven track record across industries.',
  creative:  'You are a visionary creative director with a sharp aesthetic sense and deep artistic expertise.',
  research:  'You are a meticulous researcher and analytical thinker with deep domain knowledge.',
  marketing: 'You are an expert growth marketer and brand strategist who drives measurable results.',
  business:  'You are a seasoned business consultant with experience across multiple industries.',
  social:    'You are a social media expert who creates platform-native, viral, engaging content.',
  education: 'You are an expert educator and instructional designer who makes complex topics simple.',
  general:   'You are a highly intelligent, versatile assistant committed to delivering exceptional quality.',
};

const categoryInstructions = {
  coding: [
    'Write clean, readable, production-ready code',
    'Include comments explaining non-obvious logic',
    'Handle edge cases and potential errors gracefully',
    'Follow best practices and established design patterns',
  ],
  writing: [
    'Open with a compelling hook that captures attention immediately',
    'Ensure logical flow and smooth transitions between sections',
    'Close with a strong conclusion or clear call to action',
    'Vary sentence length for rhythm and readability',
  ],
  creative: [
    'Prioritize originality and unexpected, memorable angles',
    'Use vivid, sensory language that evokes emotion',
    'Ensure visual and conceptual coherence throughout',
    'Break conventions intentionally when it creates impact',
  ],
  research: [
    'Present reasoning and logic with clarity',
    'Acknowledge nuance and alternative perspectives',
    'Structure findings from broad context to specific detail',
    'Highlight key insights and their real-world implications',
  ],
  marketing: [
    'Lead with the strongest value proposition immediately',
    'Apply proven frameworks (AIDA, PAS, or FAB as appropriate)',
    'Focus on benefits over features throughout',
    'Close with a clear, specific, motivating call to action',
  ],
  business: [
    'Ground recommendations in data or established frameworks',
    'Present risks alongside opportunities for balance',
    'Prioritize actionability — what can be done, when, and how',
    'Consider multiple stakeholder perspectives',
  ],
  social: [
    'Lead with a scroll-stopping hook in the very first line',
    'Optimize for the platform\'s native behavior and audience expectations',
    'Design for maximum engagement and shareability',
    'Use platform-appropriate formatting and conventions',
  ],
  education: [
    'Break concepts into digestible, logical steps',
    'Use analogies and real-world examples throughout',
    'Anticipate common misconceptions and address them proactively',
    'Reinforce key takeaways at the end',
  ],
  general: [
    'Prioritize clarity and directness above all else',
    'Structure your response logically from problem to solution',
    'Use concrete examples to illustrate abstract points',
  ],
};

// ─── Quality Score ─────────────────────────────────────────────
export function calculateQualityScore(answers) {
  const { goal = '', aiTarget, tone, format, audience, avoid } = answers;
  let score = 0;
  const achieved = [];
  const missing  = [];

  // Goal depth (0–25 pts)
  const words = goal.trim().split(/\s+/).filter(Boolean).length;
  if (words >= 20)      { score += 25; achieved.push('Rich, detailed goal (+25)'); }
  else if (words >= 10) { score += 15; achieved.push('Clear goal (+15)'); missing.push('Add more detail to your goal (+10)'); }
  else                  { score += 8;  achieved.push('Goal provided (+8)');  missing.push('Describe your goal in more depth (+17)'); }

  // AI target (10 pts)
  if (aiTarget) { score += 10; achieved.push('AI target specified (+10)'); }

  // Tone (10 pts)
  if (tone)     { score += 10; achieved.push('Tone defined (+10)'); }

  // Format (10 pts)
  if (format)   { score += 10; achieved.push('Format set (+10)'); }

  // Audience — highest impact (20 pts)
  if (audience) {
    score += 20;
    achieved.push('Audience defined (+20)');
  } else {
    missing.push('Specify your audience — biggest quality boost (+20)');
  }

  // Avoid constraints (15 pts)
  if (avoid && avoid !== 'skip' && avoid !== '') {
    score += 15;
    achieved.push('Constraints specified (+15)');
  } else {
    missing.push('Add avoid constraints for cleaner output (+15)');
  }

  return { score: Math.min(score, 100), achieved, missing };
}

// ─── Main Generator ───────────────────────────────────────────
export function generatePrompt(answers) {
  const { goal, aiTarget, tone, format, audience, avoid } = answers;
  const category    = detectCategory(goal);
  const toneDesc    = toneMap[tone]     ?? toneMap.professional;
  const formatDesc  = formatMap[format] ?? formatMap.detailed;
  const audDesc     = audienceMap[audience] ?? 'a general audience';
  const role        = systemRoles[category];
  const catLines    = (categoryInstructions[category] ?? categoryInstructions.general)
                        .map(l => `- ${l}`).join('\n');
  const avoidCustom = avoid && avoid !== 'skip' ? `\n- ${avoid}` : '';

  if (aiTarget === 'chatgpt') {
    return buildChatGPT({ goal, toneDesc, formatDesc, audDesc, role, catLines, avoidCustom, tone, format });
  }
  return buildClaude({ goal, toneDesc, formatDesc, audDesc, role, catLines, avoidCustom, tone, format });
}

// ─── ChatGPT Template (CO-STAR) ──────────────────────────────
function buildChatGPT({ goal, toneDesc, formatDesc, audDesc, role, catLines, avoidCustom, tone, format }) {
  return `${role}

Task: ${goal}

Audience: ${audDesc}

Instructions:
- Tone: ${toneDesc}
- Format: ${formatDesc}
${catLines}

Avoid:
- Do not open with filler like "Certainly!", "Of course!", or "Great question!"
- Do not repeat or rephrase the task before answering
- Do not add unnecessary disclaimers or caveats
- Do not pad the response with vague, generic statements${avoidCustom}

Quality check — before finalizing, verify:
✓ Does this directly and completely address the task?
✓ Is the tone ${tone} throughout?
✓ Is it structured as ${format}?
✓ Is it right for the specified audience?
✓ Does it deliver immediate, concrete value?

Now provide your best response.`;
}

// ─── Claude Template (XML structured) ────────────────────────
function buildClaude({ goal, toneDesc, formatDesc, audDesc, role, catLines, avoidCustom, tone, format }) {
  return `<context>
${role}
</context>

<task>
${goal}
</task>

<audience>
${audDesc}
</audience>

<requirements>
Tone: ${toneDesc}
Format: ${formatDesc}
${catLines}
</requirements>

<constraints>
- Do not open with filler like "Certainly!" or "Of course!"
- Do not restate the task before answering
- Do not add disclaimers unless genuinely critical
- Do not pad with vague or generic statements${avoidCustom}
</constraints>

<quality_check>
Before finalizing, verify:
- Does this fully and directly address the task?
- Is the tone ${tone} throughout?
- Is it structured as ${format}?
- Is it appropriate for ${audDesc}?
- Does every sentence deliver real value?
</quality_check>

Think step by step, then provide your best response.`;
}
