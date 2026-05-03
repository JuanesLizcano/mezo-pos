import React, { useEffect, useState, useRef } from 'react';

/**
 * Typewriter rotativo real: escribe letra por letra, pausa, borra letra por letra.
 * NO usa framer-motion. NO usa fade ni slide. Solo setState con setTimeout.
 * prefers-reduced-motion → primera palabra estática, sin cursor.
 */
export default function Typewriter({
  words = [],
  typingSpeed = 90,
  deletingSpeed = 50,
  pauseAfterTyping = 1600,
  pauseBeforeNext = 350,
  className = '',
  style = {},
  cursorColor = '#C8903F',
}) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState('typing');
  const [reducedMotion, setReducedMotion] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || words.length === 0) return;

    const currentWord = words[wordIndex];

    if (phase === 'typing') {
      if (text.length < currentWord.length) {
        timeoutRef.current = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, typingSpeed);
      } else {
        timeoutRef.current = setTimeout(() => setPhase('pausing'), pauseAfterTyping);
      }
    } else if (phase === 'pausing') {
      setPhase('deleting');
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setText(text.slice(0, -1));
        }, deletingSpeed);
      } else {
        timeoutRef.current = setTimeout(() => {
          setWordIndex((i) => (i + 1) % words.length);
          setPhase('typing');
        }, pauseBeforeNext);
      }
    }

    return () => clearTimeout(timeoutRef.current);
  }, [text, phase, wordIndex, words, typingSpeed, deletingSpeed, pauseAfterTyping, pauseBeforeNext, reducedMotion]);

  if (reducedMotion) {
    return <span className={className} style={style}>{words[0] || ''}</span>;
  }

  return (
    <span className="inline-flex items-baseline" aria-live="polite">
      <span className={className} style={style}>{text}</span>
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: '3px',
          height: '0.85em',
          backgroundColor: cursorColor,
          marginLeft: '4px',
          verticalAlign: '-0.05em',
          animation: 'mezo-cursor-blink 1s steps(2) infinite',
        }}
      />
      <style>{`@keyframes mezo-cursor-blink { 50% { opacity: 0; } }`}</style>
    </span>
  );
}
