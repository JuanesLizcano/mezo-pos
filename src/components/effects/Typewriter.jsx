import React, { useEffect, useState, useRef } from 'react';

/**
 * Typewriter rotativo: escribe una palabra letra por letra, pausa, borra, siguiente.
 * Inspirado en Daniel Petho (fancycomponents.dev / 21st.dev).
 * prefers-reduced-motion → muestra solo la primera palabra estática, sin cursor.
 */
export default function Typewriter({
  words = [],
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseAfterTyping = 1800,
  pauseBeforeNext = 300,
  className = '',
  style = {},
  cursorColor = '#C8903F',
}) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
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

    if (!isDeleting && text === currentWord) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseAfterTyping);
      return;
    }

    if (isDeleting && text === '') {
      setIsDeleting(false);
      timeoutRef.current = setTimeout(() => {
        setWordIndex((i) => (i + 1) % words.length);
      }, pauseBeforeNext);
      return;
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    timeoutRef.current = setTimeout(() => {
      setText((prev) =>
        isDeleting
          ? currentWord.slice(0, prev.length - 1)
          : currentWord.slice(0, prev.length + 1)
      );
    }, speed);

    return () => clearTimeout(timeoutRef.current);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseAfterTyping, pauseBeforeNext, reducedMotion]);

  if (reducedMotion) {
    return <span className={className} style={style}>{words[0] || ''}</span>;
  }

  return (
    <>
      <style>{`
        @keyframes mezo-blink {
          50% { opacity: 0; }
        }
      `}</style>
      <span className="inline-flex items-baseline" aria-live="polite" aria-atomic="true">
        <span className={className} style={style}>{text}</span>
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            marginLeft: '2px',
            width: '3px',
            height: '0.85em',
            backgroundColor: cursorColor,
            verticalAlign: '-0.05em',
            animation: 'mezo-blink 1s steps(2) infinite',
          }}
        />
      </span>
    </>
  );
}
