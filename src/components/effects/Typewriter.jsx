import { useEffect, useState } from 'react';

export default function Typewriter({
  words = [],
  speed = 70,
  initialDelay = 0,
  waitTime = 1500,
  deleteSpeed = 40,
  loop = true,
  className = '',
  style = {},
  cursorColor = '#C8903F',
  showCursor = true,
  hideCursorOnType = false,
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
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

    let timeout;
    const currentText = words[currentTextIndex];

    const tick = () => {
      if (isDeleting) {
        if (displayText.length === 0) {
          setIsDeleting(false);
          if (currentTextIndex === words.length - 1 && !loop) return;
          setCurrentTextIndex((prev) => (prev + 1) % words.length);
          setCurrentIndex(0);
        } else {
          timeout = setTimeout(() => {
            setDisplayText((prev) => prev.slice(0, -1));
          }, deleteSpeed);
        }
      } else {
        if (currentIndex < currentText.length) {
          timeout = setTimeout(() => {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          }, speed);
        } else if (words.length > 1) {
          timeout = setTimeout(() => setIsDeleting(true), waitTime);
        }
      }
    };

    const delay =
      currentIndex === 0 && !isDeleting && displayText.length === 0
        ? initialDelay
        : 0;

    timeout = setTimeout(tick, delay);

    return () => clearTimeout(timeout);
  }, [currentIndex, displayText, isDeleting, speed, deleteSpeed, waitTime, words, currentTextIndex, loop, initialDelay, reducedMotion]);

  if (reducedMotion) {
    return <span className={className} style={style}>{words[0] || ''}</span>;
  }

  const isTypingNow = !isDeleting && currentIndex < (words[currentTextIndex]?.length ?? 0);

  return (
    <span className={`inline whitespace-pre-wrap ${className}`} style={style} aria-live="polite">
      <span>{displayText}</span>
      {showCursor && (
        <>
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
              ...(hideCursorOnType && isTypingNow ? { visibility: 'hidden' } : {}),
            }}
          />
          <style>{`@keyframes mezo-cursor-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>
        </>
      )}
    </span>
  );
}
