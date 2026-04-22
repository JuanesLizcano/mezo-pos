/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mezo: {
          gold:        '#C8903F',
          'gold-deep': '#A87528',
          'gold-soft': '#E4B878',
          'gold-glow': '#F2D9A8',
          ink:         '#080706',
          'ink-raised':'#141210',
          'ink-line':  '#2A2520',
          'ink-muted': '#3A332C',
          cream:       '#F4ECD8',
          'cream-dim': '#D9CEB5',
          'cream-line':'#E8DDC2',
          verde:       '#3DAA68',
          'verde-deep':'#2E8450',
          'verde-soft':'#CDE7D6',
          rojo:        '#C8573F',
          'rojo-soft': '#F0CFC6',
          amber:       '#D9A437',
          graphite:    '#2B2420',
          stone:       '#6B6055',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'mezo-xs': '4px',
        'mezo-sm': '6px',
        'mezo-md': '10px',
        'mezo-lg': '14px',
        'mezo-xl': '20px',
      },
      boxShadow: {
        'mezo-sm':   '0 1px 2px rgba(8,7,6,0.08), 0 1px 1px rgba(8,7,6,0.04)',
        'mezo-md':   '0 6px 20px rgba(8,7,6,0.12), 0 2px 6px rgba(8,7,6,0.06)',
        'mezo-lg':   '0 18px 48px rgba(8,7,6,0.18)',
        'mezo-gold': '0 2px 10px rgba(200,144,63,0.20)',
      },
    },
  },
  plugins: [],
};
