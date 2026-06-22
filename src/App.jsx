import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import {
  STEPS, getBotMessage, getOptions, nextStep, isVague,
} from './utils/conversationFlow';
import { generatePrompt, detectCategory } from './utils/promptGenerator';

const TYPING_DELAY = 1300;
function makeId() { return Math.random().toString(36).slice(2); }

export default function App() {
  const [messages, setMessages]               = useState([]);
  const [step, setStep]                       = useState(STEPS.GOAL);
  const [answers, setAnswers]                 = useState({});
  const [isTyping, setIsTyping]               = useState(false);
  const [inputDisabled, setInputDisabled]     = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [promptMeta, setPromptMeta]           = useState(null);
  const [started, setStarted]                 = useState(false);

  // Steps that accept free-text (input stays open)
  const [waitingClarify, setWaitingClarify] = useState(false);
  const [waitingAvoid,   setWaitingAvoid]   = useState(false);

  const stepRef           = useRef(STEPS.GOAL);
  const answersRef        = useRef({});
  const waitingClarifyRef = useRef(false);
  const waitingAvoidRef   = useRef(false);

  // ─── Add bot message with typing delay ────────────────────
  const addBotMessage = useCallback((text, options = null, extra = {}) => {
    setIsTyping(true);
    setInputDisabled(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: makeId(), type: 'bot', text, options: options ?? undefined, ...extra }]);
      if (!options && !extra.showPrompt) setInputDisabled(false);
    }, TYPING_DELAY);
  }, []);

  // ─── Start conversation ───────────────────────────────────
  const startConversation = useCallback(() => {
    setStarted(true);
    setIsTyping(true);
    setInputDisabled(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages([{ id: makeId(), type: 'bot', text: getBotMessage(STEPS.GOAL) }]);
      setInputDisabled(false);
    }, TYPING_DELAY);
  }, []);

  // ─── Generate and show prompt ─────────────────────────────
  const doGenerate = useCallback((finalAnswers) => {
    const prompt   = generatePrompt(finalAnswers);
    const category = detectCategory(finalAnswers.goal ?? '');
    setGeneratedPrompt(prompt);
    setPromptMeta({ aiTarget: finalAnswers.aiTarget, category, answers: finalAnswers });
    addBotMessage(getBotMessage(STEPS.GENERATE, finalAnswers), null, { showPrompt: true });
  }, [addBotMessage]);

  // ─── Handle text input ───────────────────────────────────
  const handleUserInput = useCallback((text) => {
    const cur = answersRef.current;
    if (inputDisabled) return;

    // First message → start conversation
    if (!started) {
      setMessages(prev => [...prev, { id: makeId(), type: 'user', text }]);
      startConversation();
      return;
    }

    // AVOID step — user typed constraints
    if (waitingAvoidRef.current) {
      waitingAvoidRef.current = false;
      setWaitingAvoid(false);
      const newAnswers = { ...cur, avoid: text };
      setAnswers(newAnswers); answersRef.current = newAnswers;
      setMessages(prev => [...prev, { id: makeId(), type: 'user', text }]);
      doGenerate(newAnswers);
      return;
    }

    // CLARIFY step — user adding detail to vague goal
    if (waitingClarifyRef.current) {
      waitingClarifyRef.current = false;
      setWaitingClarify(false);
      const enriched   = `${cur.goal} — ${text}`;
      const newAnswers = { ...cur, goal: enriched };
      setAnswers(newAnswers); answersRef.current = newAnswers;
      setMessages(prev => [...prev, { id: makeId(), type: 'user', text }]);
      const ns = STEPS.AI_TARGET;
      setStep(ns); stepRef.current = ns;
      addBotMessage(getBotMessage(ns, newAnswers), getOptions(ns));
      return;
    }

    // GOAL step — normal flow
    if (stepRef.current !== STEPS.GOAL) return;
    setMessages(prev => [...prev, { id: makeId(), type: 'user', text }]);

    if (isVague(text)) {
      const newAnswers = { ...cur, goal: text };
      setAnswers(newAnswers); answersRef.current = newAnswers;
      waitingClarifyRef.current = true; setWaitingClarify(true);
      setStep(STEPS.CLARIFY); stepRef.current = STEPS.CLARIFY;
      addBotMessage(getBotMessage(STEPS.CLARIFY, newAnswers));
      return;
    }

    const newAnswers = { ...cur, goal: text };
    setAnswers(newAnswers); answersRef.current = newAnswers;
    const ns = nextStep(STEPS.GOAL);
    setStep(ns); stepRef.current = ns;
    addBotMessage(getBotMessage(ns, newAnswers), getOptions(ns));
  }, [started, inputDisabled, startConversation, addBotMessage, doGenerate]);

  // ─── Handle quick reply ──────────────────────────────────
  const handleQuickReply = useCallback((value, label, messageIdx) => {
    const cur = answersRef.current;
    const currentStep = stepRef.current;

    setMessages(prev => prev.map((m, i) => i === messageIdx ? { ...m, selected: value } : m));
    setMessages(prev => [...prev, { id: makeId(), type: 'user', text: label }]);

    // Skip on AVOID step
    if (value === 'skip' || currentStep === STEPS.AVOID) {
      const newAnswers = { ...cur, avoid: value === 'skip' ? '' : value };
      setAnswers(newAnswers); answersRef.current = newAnswers;
      waitingAvoidRef.current = false; setWaitingAvoid(false);
      setStep(STEPS.GENERATE); stepRef.current = STEPS.GENERATE;
      doGenerate(newAnswers);
      return;
    }

    const fieldMap = {
      [STEPS.AI_TARGET]: 'aiTarget',
      [STEPS.TONE]:      'tone',
      [STEPS.FORMAT]:    'format',
      [STEPS.AUDIENCE]:  'audience',
    };
    const field = fieldMap[currentStep];
    if (!field) return;

    const newAnswers = { ...cur, [field]: value };
    setAnswers(newAnswers); answersRef.current = newAnswers;

    const ns = nextStep(currentStep);
    setStep(ns); stepRef.current = ns;

    if (ns === STEPS.AVOID) {
      // Show AVOID message with skip button AND enable text input
      waitingAvoidRef.current = true; setWaitingAvoid(true);
      addBotMessage(getBotMessage(STEPS.AVOID, newAnswers), getOptions(STEPS.AVOID));
    } else {
      addBotMessage(getBotMessage(ns, newAnswers), getOptions(ns));
    }
  }, [addBotMessage, doGenerate]);

  // ─── Regenerate ──────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    const prompt = generatePrompt(answersRef.current);
    setGeneratedPrompt(prompt);
  }, []);

  // ─── Reset ───────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setMessages([]); setStep(STEPS.GOAL); stepRef.current = STEPS.GOAL;
    setAnswers({}); answersRef.current = {};
    setIsTyping(false); setInputDisabled(false);
    setGeneratedPrompt(null); setPromptMeta(null); setStarted(false);
    setWaitingClarify(false); waitingClarifyRef.current = false;
    setWaitingAvoid(false);   waitingAvoidRef.current   = false;
  }, []);

  // ─── Input state ─────────────────────────────────────────
  const textSteps      = [STEPS.GOAL, STEPS.CLARIFY, STEPS.AVOID];
  const isInputEnabled = !inputDisabled && (!started || textSteps.includes(step) || waitingAvoid || waitingClarify);

  const placeholder = !started             ? 'Start by describing what you want to accomplish…'
    : waitingClarify                        ? 'Add more detail… (genre, audience, style, topic…)'
    : waitingAvoid                          ? 'Type what to avoid, or click Skip above…'
    : step === STEPS.GOAL                   ? 'Describe your goal in detail…'
    : 'Use the buttons above to make your selection…';

  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      <div className="app">
        <Header onReset={handleReset} />
        <div className="divider" />
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          onQuickReply={handleQuickReply}
          onRegenerate={handleRegenerate}
          onReset={handleReset}
          generatedPrompt={generatedPrompt}
          promptMeta={promptMeta}
        />
        <div className="divider" />
        <ChatInput onSend={handleUserInput} disabled={!isInputEnabled} placeholder={placeholder} />
      </div>
    </>
  );
}
