import { useEffect, useState } from 'react';

/**
 * Typewriter rotativo compatible con React 19.
 * Un solo useEffect con loop async + flag mounted para cancelación limpia.
 * No respeta prefers-reduced-motion: el efecto es parte del diseño de la landing.
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

  useEffect(() => {
    if (words.length === 0) return;

    let mounted = true;
    let timeoutId;

    const sleep = (ms) => new Promise((resolve) => {
      timeoutId = setTimeout(resolve, ms);
    });

    const run = async () => {
      let wordIndex = 0;

      while (mounted) {
        const currentWord = words[wordIndex];

        for (let i = 1; i <= currentWord.length; i++) {
          if (!mounted) return;
          setText(currentWord.slice(0, i));
          await sleep(typingSpeed);
        }

        await sleep(pauseAfterTyping);
        if (!mounted) return;

        for (let i = currentWord.length - 1; i >= 0; i--) {
          if (!mounted) return;
          setText(currentWord.slice(0, i));
          await sleep(deletingSpeed);
        }

        await sleep(pauseBeforeNext);
        if (!mounted) return;

        wordIndex = (wordIndex + 1) % words.length;
      }
    };

    run();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [words, typingSpeed, deletingSpeed, pauseAfterTyping, pauseBeforeNext]);

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
