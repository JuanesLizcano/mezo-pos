import { useEffect, useState } from 'react';

export default function Typewriter({
  words = [],
  speed = 90,
  deleteSpeed = 50,
  waitTime = 1600,
  className = '',
  style = {},
  cursorColor = '#C8903F',
}) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || words.length === 0) return;

    const word = words[wordIndex];
    let delay;

    if (!isDeleting && text.length < word.length) {
      delay = setTimeout(() => setText(word.slice(0, text.length + 1)), speed);
    } else if (!isDeleting && text.length === word.length) {
      delay = setTimeout(() => setIsDeleting(true), waitTime);
    } else if (isDeleting && text.length > 0) {
      delay = setTimeout(() => setText(word.slice(0, text.length - 1)), deleteSpeed);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    }

    return () => clearTimeout(delay);
  }, [text, isDeleting, wordIndex, words, speed, deleteSpeed, waitTime, reducedMotion]);

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
          animation: 'mezo-cursor-blink 1s steps(1) infinite',
        }}
      />
      <style>{`@keyframes mezo-cursor-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>
    </span>
  );
}
